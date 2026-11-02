"""
Prediction module for Forkora Career Recommendation ML Pipeline.
Loads trained versioned pipelines, validates student academic records, processes features,
and returns top career predictions with model probability scores, mapped Forkora career nodes,
and realistic caveats.
"""
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import argparse
import json
import joblib
import numpy as np
import pandas as pd

from src.config import MODELS_DIR, VALID_STREAMS
from src.model_registry import ModelRegistry


# Mapping from ML broad categories to Forkora's 12 Career Nodes
CAREER_NODE_MAPPING: Dict[str, Dict[str, float]] = {
    "CAREER_SOFTWARE_ENGINEER": {
        "Computer Science / IT": 0.60,
        "Engineering": 0.40,
    },
    "CAREER_DATA_SCIENTIST": {
        "Computer Science / IT": 0.50,
        "Research": 0.30,
        "Engineering": 0.20,
    },
    "CAREER_CYBERSECURITY": {
        "Computer Science / IT": 0.70,
        "Engineering": 0.30,
    },
    "CAREER_DOCTOR": {
        "Medical / Healthcare": 0.85,
        "Biotechnology": 0.15,
    },
    "CAREER_BIOTECHNOLOGIST": {
        "Biotechnology": 0.75,
        "Medical / Healthcare": 0.15,
        "Research": 0.10,
    },
    "CAREER_CHARTERED_ACCOUNTANT": {
        "Chartered Accountancy": 0.60,
        "Business / Finance": 0.40,
    },
    "CAREER_INVESTMENT_BANKER": {
        "Business / Finance": 0.70,
        "Management": 0.30,
    },
    "CAREER_PRODUCT_MANAGER": {
        "Management": 0.50,
        "Computer Science / IT": 0.30,
        "Business / Finance": 0.20,
    },
    "CAREER_CORPORATE_LAWYER": {
        "Law": 0.80,
        "Business / Finance": 0.20,
    },
    "CAREER_CIVIL_SERVANT": {
        "Government Services": 0.70,
        "Law": 0.15,
        "Teaching / Education": 0.15,
    },
    "CAREER_CLINICAL_PSYCHOLOGIST": {
        "Medical / Healthcare": 0.50,
        "Research": 0.30,
        "Teaching / Education": 0.20,
    },
    "CAREER_UI_UX_DESIGNER": {
        "Architecture / Design": 0.50,
        "Arts / Design": 0.30,
        "Computer Science / IT": 0.20,
    },
}


def validate_prediction_input(record: Dict[str, Any]) -> List[str]:
    """
    Validate inference record against training schema constraints.
    Returns list of validation violation warnings/errors.
    """
    violations: List[str] = []

    # Check marks range [0, 100]
    for key, val in record.items():
        if val is None or pd.isna(val):
            continue
        if "mark" in key.lower() or key in ["Class10_Maths", "Class10_Science", "Class10_SST", "Class10_English"]:
            try:
                num = float(val)
                if num < 0.0 or num > 100.0:
                    violations.append(f"Mark '{key}' has value {val} outside valid range [0, 100].")
            except (ValueError, TypeError):
                violations.append(f"Mark '{key}' has non-numeric value: {val}.")

        if "percentage" in key.lower():
            try:
                num = float(val)
                if num < 0.0 or num > 100.0:
                    violations.append(f"Percentage '{key}' has value {val} outside valid range [0, 100].")
            except (ValueError, TypeError):
                violations.append(f"Percentage '{key}' has non-numeric value: {val}.")

    # Check stream validity if provided
    for key in ["Class12_Stream", "c12_stream", "stream"]:
        if key in record and record[key]:
            val = str(record[key]).strip()
            if val and val != "None" and val not in VALID_STREAMS and not any(s in val.upper() for s in ["PCM", "PCB", "COMMERCE", "ARTS", "HUMANITIES"]):
                violations.append(f"Unrecognized stream value '{val}'. Expected one of {list(VALID_STREAMS)}.")

    return violations


def map_probabilities_to_career_nodes(
    class_probabilities: Dict[str, float]
) -> Dict[str, int]:
    """
    Map broad ML category probabilities to Forkora's 12 specific Career Nodes (0 to 100 scale).
    """
    node_scores: Dict[str, int] = {}

    for node_code, weights in CAREER_NODE_MAPPING.items():
        weighted_prob = 0.0
        for category, w in weights.items():
            prob = class_probabilities.get(category, 0.0)
            weighted_prob += prob * w

        # Calibrate: baseline 50 for neutral/zero, up to 98 for high category probabilities (0.35+)
        score = int(round(min(98.0, max(45.0, 50.0 + (weighted_prob / 0.35) * 45.0))))
        node_scores[node_code] = score

    return node_scores


class CareerPredictor:
    """Inference engine for student career recommendations."""

    def __init__(self, version: Optional[str] = None, models_dir: Union[str, Path] = MODELS_DIR):
        self.models_dir = Path(models_dir)
        self.registry = ModelRegistry(models_dir=self.models_dir)

        if version is not None:
            self.version = version
            self.model_path = self.models_dir / version / "career_pipeline.joblib"
            if not self.model_path.exists():
                raise FileNotFoundError(f"Model pipeline artifact for version '{version}' not found at: {self.model_path}")
        else:
            self.version = self.registry.get_active_version()
            if not self.version:
                raise RuntimeError("No active model found in registry. Please specify a version or train a model first.")
            active_path = self.registry.get_active_artifact_path()
            if not active_path or not active_path.exists():
                self.model_path = self.models_dir / self.version / "career_pipeline.joblib"
            else:
                self.model_path = active_path

        # Load fitted pipeline (preprocessing + classifier)
        self.pipeline = joblib.load(self.model_path)

        # Retrieve metadata if available
        meta_path = self.models_dir / self.version / "metadata.json"
        self.metadata: Dict[str, Any] = {}
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def predict_single(
        self,
        student_data: Dict[str, Any],
        top_k: int = 3,
        strict_validation: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate career recommendations for a single student academic profile.
        """
        # Validate input against training schema
        violations = validate_prediction_input(student_data)
        if violations and strict_validation:
            raise ValueError(f"Prediction input validation failed: {'; '.join(violations)}")

        # Sanitize / clip any out-of-range marks to prevent corruption
        sanitized = dict(student_data)
        for k, v in sanitized.items():
            if "mark" in k.lower() or k in ["Class10_Maths", "Class10_Science", "Class10_SST", "Class10_English"]:
                try:
                    num = float(v)
                    sanitized[k] = min(100.0, max(0.0, num))
                except (ValueError, TypeError):
                    pass

        df = pd.DataFrame([sanitized])
        results = self.predict_batch(df, top_k=top_k)
        res = results[0]
        if violations:
            res["validation_warnings"] = violations
        return res

    def predict_batch(
        self,
        df: pd.DataFrame,
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Generate career recommendations for a batch of student records.
        """
        y_preds = self.pipeline.predict(df)

        has_proba = hasattr(self.pipeline, "predict_proba")
        if has_proba:
            try:
                probabilities = self.pipeline.predict_proba(df)
                classes = list(self.pipeline.classes_)
            except (AttributeError, RuntimeError):
                has_proba = False
                probabilities = None
                classes = []
        else:
            probabilities = None
            classes = []

        outputs: List[Dict[str, Any]] = []

        for idx, pred in enumerate(y_preds):
            rec: Dict[str, Any] = {
                "model_version": self.version,
                "predicted_career": str(pred),
                "top_predictions": [],
                "career_node_scores": {},
                "disclaimer": (
                    "Model probabilities reflect pattern associations from training data and should not be treated as "
                    "calibrated real-world likelihoods or career suitability guarantees."
                ),
            }

            if has_proba and probabilities is not None:
                probs_row = probabilities[idx]
                all_probs_dict = {str(classes[c]): round(float(probs_row[c]), 4) for c in range(len(classes))}

                sorted_indices = np.argsort(probs_row)[::-1]
                top_items = []
                for rank in range(min(top_k, len(sorted_indices))):
                    c_idx = sorted_indices[rank]
                    top_items.append({
                        "career": str(classes[c_idx]),
                        "probability": round(float(probs_row[c_idx]), 4),
                    })
                rec["top_predictions"] = top_items
                rec["career_node_scores"] = map_probabilities_to_career_nodes(all_probs_dict)
            else:
                rec["top_predictions"] = [{"career": str(pred), "probability": 1.0}]
                rec["career_node_scores"] = {}

            outputs.append(rec)

        return outputs


def main():
    parser = argparse.ArgumentParser(description="Forkora Career Prediction CLI")
    parser.add_argument("--version", type=str, default=None, help="Model version (defaults to active version)")
    parser.add_argument("--sample", action="store_true", help="Run prediction on built-in sample student")
    parser.add_argument("--input-json", type=str, default=None, help="JSON string or file path containing student record")
    parser.add_argument("--strict", action="store_true", help="Raise error on schema violations")

    args = parser.parse_args()

    predictor = CareerPredictor(version=args.version)

    if args.sample:
        sample_student = {
            "Class10_Maths": 88,
            "Class10_Science": 92,
            "Class10_SST": 74,
            "Class10_English": 81,
            "Class10_Fifth_Subject": "Computer Science",
            "Class10_Fifth_Marks": 95,
            "Class10_Percentage": 86.0,
            "Class12_Stream": "PCM",
            "Class12_Percentage": 89.2,
            "Class12_Subject1_Name": "Physics",
            "Class12_Subject1_Marks": 88,
            "Class12_Subject2_Name": "Chemistry",
            "Class12_Subject2_Marks": 84,
            "Class12_Subject3_Name": "Mathematics",
            "Class12_Subject3_Marks": 94,
            "Class12_Subject4_Name": "English",
            "Class12_Subject4_Marks": 82,
            "Class12_Subject5_Name": "Computer Science",
            "Class12_Subject5_Marks": 98,
        }
        res = predictor.predict_single(sample_student, strict_validation=args.strict)
        print(json.dumps(res, indent=2))

    elif args.input_json:
        p = Path(args.input_json)
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = json.loads(args.input_json)

        if isinstance(data, list):
            res = predictor.predict_batch(pd.DataFrame(data))
        else:
            res = predictor.predict_single(data, strict_validation=args.strict)
        print(json.dumps(res, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
