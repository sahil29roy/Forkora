"""
Prediction module for Forkora Career Recommendation ML Pipeline.
Loads trained versioned pipelines, processes student academic records, and returns
top career predictions with model probability scores and realistic caveats.
"""
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import argparse
import json
import joblib
import numpy as np
import pandas as pd

from src.config import MODELS_DIR
from src.model_registry import ModelRegistry


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
    ) -> Dict[str, Any]:
        """
        Generate career recommendations for a single student academic profile.

        Parameters
        ----------
        student_data : dict
            Student academic marks and stream details.
        top_k : int
            Number of top career categories to return (default 3).

        Returns
        -------
        Dict[str, Any]
            Prediction output dictionary with model version and probabilities.
        """
        df = pd.DataFrame([student_data])
        results = self.predict_batch(df, top_k=top_k)
        return results[0]

    def predict_batch(
        self,
        df: pd.DataFrame,
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """
        Generate career recommendations for a batch of student records.

        Parameters
        ----------
        df : pd.DataFrame
            DataFrame containing student academic features.
        top_k : int
            Number of top career categories to return.

        Returns
        -------
        List[Dict[str, Any]]
            List of structured prediction outputs.
        """
        # Obtain predictions and class probabilities from fitted pipeline
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
                "disclaimer": (
                    "Model probabilities reflect pattern associations from training data and should not be treated as "
                    "calibrated real-world likelihoods or career suitability guarantees."
                ),
            }

            if has_proba and probabilities is not None:
                probs_row = probabilities[idx]
                sorted_indices = np.argsort(probs_row)[::-1]
                top_items = []
                for rank in range(min(top_k, len(sorted_indices))):
                    c_idx = sorted_indices[rank]
                    top_items.append({
                        "career": str(classes[c_idx]),
                        "probability": round(float(probs_row[c_idx]), 4),
                    })
                rec["top_predictions"] = top_items
            else:
                rec["top_predictions"] = [{"career": str(pred), "probability": 1.0}]

            outputs.append(rec)

        return outputs


def main():
    parser = argparse.ArgumentParser(description="Forkora Career Prediction CLI")
    parser.add_argument("--version", type=str, default=None, help="Model version (defaults to active version)")
    parser.add_argument("--sample", action="store_true", help="Run prediction on built-in sample student")
    parser.add_argument("--input-json", type=str, default=None, help="JSON string or file path containing student record")

    args = parser.parse_args()

    predictor = CareerPredictor(version=args.version)
    print(f"Loaded CareerPredictor for model version: {predictor.version}")

    if args.sample:
        # Sample Class 12 PCM student aiming for Engineering / IT
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
        print("\nInput Student Academic Profile:")
        print(json.dumps(sample_student, indent=2))
        res = predictor.predict_single(sample_student)
        print("\nPrediction Output:")
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
            res = predictor.predict_single(data)
        print(json.dumps(res, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
