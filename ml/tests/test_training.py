"""
Unit tests for Training Pipeline and Serialization.
Uses a small synthetic fixture to verify training, artifact saving, and evaluation.
"""
import tempfile
from pathlib import Path
import pytest
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression

from src.preprocessing import create_pipeline
from src.evaluate import evaluate_model_predictions, extract_feature_importance


@pytest.fixture
def small_training_data():
    """Create a minimal balanced multi-class dataset."""
    records = []
    classes = ["Engineering", "Medicine", "Commerce", "Arts"]
    for i in range(40):
        c = classes[i % 4]
        stream = "PCM" if c == "Engineering" else ("PCB" if c == "Medicine" else ("Commerce" if c == "Commerce" else "Arts"))
        sub1 = "Physics" if stream in ["PCM", "PCB"] else ("Accountancy" if stream == "Commerce" else "History")
        sub2 = "Chemistry" if stream in ["PCM", "PCB"] else ("Business Studies" if stream == "Commerce" else "Political Science")
        sub3 = "Mathematics" if stream == "PCM" else ("Biology" if stream == "PCB" else ("Economics" if stream == "Commerce" else "Geography"))

        records.append({
            "Class10_Maths": 70 + (i % 20),
            "Class10_Science": 70 + (i % 20),
            "Class10_SST": 65 + (i % 20),
            "Class10_English": 75 + (i % 15),
            "Class10_Fifth_Subject": "German",
            "Class10_Fifth_Marks": 80,
            "Class10_Percentage": 75.0,
            "Class12_Stream": stream,
            "Class12_Percentage": 78.0,
            "Class12_Subject1_Name": sub1,
            "Class12_Subject1_Marks": 75 + (i % 15),
            "Class12_Subject2_Name": sub2,
            "Class12_Subject2_Marks": 72 + (i % 15),
            "Class12_Subject3_Name": sub3,
            "Class12_Subject3_Marks": 80 + (i % 15),
            "Class12_Subject4_Name": "English",
            "Class12_Subject4_Marks": 70,
            "Class12_Subject5_Name": "Physical Education",
            "Class12_Subject5_Marks": 85,
            "chosen_career": c,
        })
    return pd.DataFrame(records)


def test_pipeline_serialization_and_reloading(small_training_data):
    X = small_training_data.drop(columns=["chosen_career"])
    y = small_training_data["chosen_career"]

    pipeline = create_pipeline(LogisticRegression(max_iter=200, random_state=42))
    pipeline.fit(X, y)

    with tempfile.TemporaryDirectory() as tmp_dir:
        save_path = Path(tmp_dir) / "test_pipeline.joblib"
        joblib.dump(pipeline, save_path)
        assert save_path.exists()

        loaded_pipeline = joblib.load(save_path)
        preds = loaded_pipeline.predict(X[:5])
        assert len(preds) == 5
        assert hasattr(loaded_pipeline, "predict_proba")


def test_evaluation_metrics_computation():
    y_true = ["Engineering", "Medicine", "Engineering", "Commerce"]
    y_pred = ["Engineering", "Engineering", "Engineering", "Commerce"]

    metrics = evaluate_model_predictions(y_true, y_pred)
    assert 0.0 <= metrics["accuracy"] <= 1.0
    assert 0.0 <= metrics["macro_f1"] <= 1.0
    assert "confusion_matrix" in metrics
    assert "classification_report_str" in metrics
