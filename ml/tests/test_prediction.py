"""
Unit tests for Career Prediction Module and Model Registry.
"""
import tempfile
from pathlib import Path
import pytest
import pandas as pd
import joblib
from sklearn.tree import DecisionTreeClassifier

from src.preprocessing import create_pipeline
from src.predict import CareerPredictor
from src.model_registry import ModelRegistry


@pytest.fixture
def test_environment():
    """Setup a temporary isolated models directory and registry."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        models_dir = Path(tmp_dir) / "models"
        models_dir.mkdir(parents=True)
        registry_path = models_dir / "model_registry.json"

        # Fit small dummy pipeline
        df = pd.DataFrame([
            {
                "Class10_Maths": 90,
                "Class10_Science": 90,
                "Class10_SST": 80,
                "Class10_English": 85,
                "Class10_Fifth_Subject": "German",
                "Class10_Fifth_Marks": 95,
                "Class10_Percentage": 88.0,
                "Class12_Stream": "PCM",
                "Class12_Percentage": 90.0,
                "Class12_Subject1_Name": "Physics",
                "Class12_Subject1_Marks": 90,
                "Class12_Subject2_Name": "Chemistry",
                "Class12_Subject2_Marks": 85,
                "Class12_Subject3_Name": "Mathematics",
                "Class12_Subject3_Marks": 95,
                "Class12_Subject4_Name": "English",
                "Class12_Subject4_Marks": 80,
                "Class12_Subject5_Name": "Computer Science",
                "Class12_Subject5_Marks": 95,
            },
            {
                "Class10_Maths": 60,
                "Class10_Science": 60,
                "Class10_SST": 90,
                "Class10_English": 85,
                "Class10_Fifth_Subject": "Music",
                "Class10_Fifth_Marks": 90,
                "Class10_Percentage": 77.0,
                "Class12_Stream": "Arts",
                "Class12_Percentage": 82.0,
                "Class12_Subject1_Name": "History",
                "Class12_Subject1_Marks": 90,
                "Class12_Subject2_Name": "Political Science",
                "Class12_Subject2_Marks": 85,
                "Class12_Subject3_Name": "Geography",
                "Class12_Subject3_Marks": 80,
                "Class12_Subject4_Name": "English",
                "Class12_Subject4_Marks": 82,
                "Class12_Subject5_Name": "Sociology",
                "Class12_Subject5_Marks": 88,
            },
        ])
        y = pd.Series(["Engineering", "Law"])

        pipeline = create_pipeline(DecisionTreeClassifier(random_state=42))
        pipeline.fit(df, y)

        # Save to v1
        v1_dir = models_dir / "v1"
        v1_dir.mkdir(parents=True)
        joblib.dump(pipeline, v1_dir / "career_pipeline.joblib")

        # Register in registry
        reg = ModelRegistry(registry_path=registry_path, models_dir=models_dir)
        reg.register_version(
            version="v1",
            dataset_type="synthetic",
            dataset_path="dummy.csv",
            artifact_path=str(v1_dir / "career_pipeline.joblib"),
            algorithm="DecisionTreeClassifier",
            metrics={"accuracy": 1.0, "macro_f1": 1.0},
            set_active=True,
        )

        yield models_dir, reg


def test_registry_version_increment_and_rollback(test_environment):
    models_dir, reg = test_environment

    assert reg.get_active_version() == "v1"
    assert reg.get_next_version() == "v2"

    # Register v2
    v2_dir = models_dir / "v2"
    v2_dir.mkdir()
    reg.register_version(
        version="v2",
        dataset_type="real",
        dataset_path="real.csv",
        artifact_path=str(v2_dir / "career_pipeline.joblib"),
        algorithm="RandomForestClassifier",
        metrics={"accuracy": 0.85, "macro_f1": 0.84},
        set_active=True,
    )
    assert reg.get_active_version() == "v2"

    # Test rollback
    rolled_back = reg.rollback()
    assert rolled_back == "v1"
    assert reg.get_active_version() == "v1"


def test_career_predictor_single_prediction(test_environment):
    models_dir, reg = test_environment

    predictor = CareerPredictor(version="v1", models_dir=models_dir)
    student = {
        "Class10_Maths": 92,
        "Class10_Science": 88,
        "Class10_SST": 75,
        "Class10_English": 80,
        "Class10_Fifth_Subject": "German",
        "Class10_Fifth_Marks": 90,
        "Class10_Percentage": 85.0,
        "Class12_Stream": "PCM",
        "Class12_Percentage": 88.0,
        "Class12_Subject1_Name": "Physics",
        "Class12_Subject1_Marks": 90,
        "Class12_Subject2_Name": "Chemistry",
        "Class12_Subject2_Marks": 85,
        "Class12_Subject3_Name": "Mathematics",
        "Class12_Subject3_Marks": 92,
        "Class12_Subject4_Name": "English",
        "Class12_Subject4_Marks": 80,
        "Class12_Subject5_Name": "Computer Science",
        "Class12_Subject5_Marks": 90,
    }

    result = predictor.predict_single(student)
    assert result["model_version"] == "v1"
    assert "predicted_career" in result
    assert "top_predictions" in result
    assert len(result["top_predictions"]) >= 1
    assert 0.0 <= result["top_predictions"][0]["probability"] <= 1.0
