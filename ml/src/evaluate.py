"""
Evaluation module for Forkora Career Recommendation ML Pipeline.
Computes comprehensive multiclass classification metrics:
- Overall Accuracy
- Macro and Weighted Precision, Recall, F1
- Per-class Precision, Recall, F1
- Confusion Matrix (image + JSON)
- Classification Report
- Feature Importance (Tree-based & Linear)
"""
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import json
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend safe for headless/background execution
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)

from src.config import REPORTS_DIR


def evaluate_model_predictions(
    y_true: Union[np.ndarray, List[str]],
    y_pred: Union[np.ndarray, List[str]],
    class_labels: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Compute full evaluation metrics on predictions.

    Parameters
    ----------
    y_true : array-like
        Ground truth labels.
    y_pred : array-like
        Predicted labels.
    class_labels : list of str, optional
        Unique class labels in sorted order.

    Returns
    -------
    Dict[str, Any]
        Dictionary with all scalar metrics and per-class reports.
    """
    if class_labels is None:
        class_labels = sorted(list(set(y_true).union(set(y_pred))))

    acc = float(accuracy_score(y_true, y_pred))
    macro_prec = float(precision_score(y_true, y_pred, average="macro", zero_division=0))
    macro_rec = float(recall_score(y_true, y_pred, average="macro", zero_division=0))
    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    # Per-class metrics
    per_class_prec = precision_score(y_true, y_pred, average=None, labels=class_labels, zero_division=0)
    per_class_rec = recall_score(y_true, y_pred, average=None, labels=class_labels, zero_division=0)
    per_class_f1 = f1_score(y_true, y_pred, average=None, labels=class_labels, zero_division=0)

    per_class_metrics: Dict[str, Dict[str, float]] = {}
    for i, label in enumerate(class_labels):
        per_class_metrics[label] = {
            "precision": round(float(per_class_prec[i]), 4),
            "recall": round(float(per_class_rec[i]), 4),
            "f1_score": round(float(per_class_f1[i]), 4),
        }

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred, labels=class_labels)
    cm_list = cm.tolist()

    # Full text and dict classification report
    clf_rep_dict = classification_report(y_true, y_pred, labels=class_labels, output_dict=True, zero_division=0)
    clf_rep_str = classification_report(y_true, y_pred, labels=class_labels, zero_division=0)

    return {
        "accuracy": round(acc, 4),
        "macro_precision": round(macro_prec, 4),
        "macro_recall": round(macro_rec, 4),
        "macro_f1": round(macro_f1, 4),
        "weighted_f1": round(weighted_f1, 4),
        "class_labels": class_labels,
        "per_class_metrics": per_class_metrics,
        "confusion_matrix": cm_list,
        "classification_report_str": clf_rep_str,
        "classification_report_dict": clf_rep_dict,
    }


def plot_and_save_confusion_matrix(
    cm: List[List[int]],
    class_labels: List[str],
    output_path: Union[str, Path] = REPORTS_DIR / "confusion_matrix.png",
    title: str = "Confusion Matrix - Career Recommendation Model",
) -> Path:
    """
    Render and save a high-resolution confusion matrix heatmap.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    cm_arr = np.array(cm)
    plt.figure(figsize=(12, 10))
    sns.heatmap(
        cm_arr,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=class_labels,
        yticklabels=class_labels,
        cbar=True,
    )
    plt.title(title, fontsize=14, fontweight="bold", pad=15)
    plt.xlabel("Predicted Career Category", fontsize=11, fontweight="bold")
    plt.ylabel("True Career Category", fontsize=11, fontweight="bold")
    plt.xticks(rotation=45, ha="right", fontsize=9)
    plt.yticks(rotation=0, fontsize=9)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    return output_path


def extract_feature_importance(
    pipeline: Any,
    top_n: int = 20,
) -> Dict[str, float]:
    """
    Extract feature importances or mean absolute coefficients from a trained pipeline.
    """
    if "preprocessor" not in pipeline.named_steps or "classifier" not in pipeline.named_steps:
        return {}

    preprocessor = pipeline.named_steps["preprocessor"]
    classifier = pipeline.named_steps["classifier"]
    feature_names = preprocessor.get_feature_names_out()

    importances: Dict[str, float] = {}

    # Tree-based feature importances
    if hasattr(classifier, "feature_importances_"):
        raw_imp = classifier.feature_importances_
        if len(raw_imp) == len(feature_names):
            pairs = sorted(zip(feature_names, raw_imp), key=lambda x: x[1], reverse=True)
            for name, val in pairs[:top_n]:
                importances[name] = round(float(val), 5)

    # Linear model coefficients (mean absolute coefficient across classes)
    elif hasattr(classifier, "coef_"):
        coef = classifier.coef_
        mean_abs_coef = np.mean(np.abs(coef), axis=0)
        if len(mean_abs_coef) == len(feature_names):
            pairs = sorted(zip(feature_names, mean_abs_coef), key=lambda x: x[1], reverse=True)
            for name, val in pairs[:top_n]:
                importances[name] = round(float(val), 5)

    return importances


def plot_and_save_feature_importance(
    importance_dict: Dict[str, float],
    output_path: Union[str, Path] = REPORTS_DIR / "feature_importance.png",
    title: str = "Top 20 Feature Importances",
) -> Optional[Path]:
    """
    Render and save horizontal bar chart of top feature importances.
    """
    if not importance_dict:
        return None

    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    features = list(importance_dict.keys())[::-1]
    scores = [importance_dict[f] for f in features]

    plt.figure(figsize=(10, 8))
    plt.barh(features, scores, color="#2563eb")
    plt.title(title, fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Importance Score / Mean Absolute Weight", fontsize=10)
    plt.ylabel("Feature", fontsize=10)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300)
    plt.close()
    return output_path
