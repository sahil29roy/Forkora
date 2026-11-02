"""
Unit tests for Data Validation Module.
"""
import pytest
import pandas as pd
import numpy as np

from src.validation import DatasetValidator, DataValidationError


@pytest.fixture
def sample_valid_dataframe():
    """Create a minimal valid synthetic dataset."""
    return pd.DataFrame([
        {
            "Student_ID": 1,
            "Class10_Maths": 75,
            "Class10_Science": 80,
            "Class10_SST": 70,
            "Class10_English": 85,
            "Class10_Fifth_Subject": "German",
            "Class10_Fifth_Marks": 90,
            "Class10_Percentage": 80.0,
            "Class12_Stream": "PCM",
            "Class12_Percentage": 82.0,
            "Class12_Subject1_Name": "Physics",
            "Class12_Subject1_Marks": 80,
            "Class12_Subject2_Name": "Chemistry",
            "Class12_Subject2_Marks": 78,
            "Class12_Subject3_Name": "Mathematics",
            "Class12_Subject3_Marks": 88,
            "Class12_Subject4_Name": "English",
            "Class12_Subject4_Marks": 85,
            "Class12_Subject5_Name": "Computer Science",
            "Class12_Subject5_Marks": 92,
            "chosen_career": "Engineering",
        },
        {
            "Student_ID": 2,
            "Class10_Maths": 65,
            "Class10_Science": 88,
            "Class10_SST": 60,
            "Class10_English": 75,
            "Class10_Fifth_Subject": "French",
            "Class10_Fifth_Marks": 82,
            "Class10_Percentage": 74.0,
            "Class12_Stream": "PCB",
            "Class12_Percentage": 85.0,
            "Class12_Subject1_Name": "Physics",
            "Class12_Subject1_Marks": 75,
            "Class12_Subject2_Name": "Chemistry",
            "Class12_Subject2_Marks": 82,
            "Class12_Subject3_Name": "Biology",
            "Class12_Subject3_Marks": 90,
            "Class12_Subject4_Name": "English",
            "Class12_Subject4_Marks": 80,
            "Class12_Subject5_Name": "Physical Education",
            "Class12_Subject5_Marks": 94,
            "chosen_career": "Medical / Healthcare",
        },
    ])


def test_validator_passes_clean_data(sample_valid_dataframe):
    validator = DatasetValidator(target_col="chosen_career")
    clean_df, report = validator.validate(sample_valid_dataframe)
    assert len(clean_df) == 2
    assert report.valid_records == 2
    assert report.excluded_records == 0
    assert report.is_valid()


def test_validator_catches_invalid_marks(sample_valid_dataframe):
    # Introduce negative mark and mark > 100
    df = sample_valid_dataframe.copy()
    df.loc[0, "Class10_Maths"] = -10
    df.loc[1, "Class12_Subject1_Marks"] = 150

    validator = DatasetValidator(target_col="chosen_career")
    with pytest.raises(DataValidationError):
        # All records invalid -> fails is_valid threshold
        validator.validate(df)


def test_validator_excludes_invalid_records_with_accounting(sample_valid_dataframe):
    # Add one invalid row to 2 valid rows
    invalid_row = sample_valid_dataframe.iloc[[0]].copy()
    invalid_row["Student_ID"] = 3
    invalid_row["Class10_Percentage"] = 125.0  # Invalid percentage > 100
    df = pd.concat([sample_valid_dataframe, invalid_row], ignore_index=True)

    validator = DatasetValidator(target_col="chosen_career")
    clean_df, report = validator.validate(df)

    assert len(clean_df) == 2
    assert report.total_records == 3
    assert report.excluded_records == 1
    assert 2 in report.excluded_indices
    assert "Percentage out of range" in report.reasons_by_index[2][0]


def test_validator_catches_missing_target_column(sample_valid_dataframe):
    df = sample_valid_dataframe.drop(columns=["chosen_career"])
    validator = DatasetValidator(target_col="chosen_career")
    with pytest.raises(DataValidationError, match="Required target column 'chosen_career' is missing"):
        validator.validate(df)


def test_validator_catches_missing_target_labels(sample_valid_dataframe):
    df = sample_valid_dataframe.copy()
    df.loc[0, "chosen_career"] = np.nan
    validator = DatasetValidator(target_col="chosen_career")
    clean_df, report = validator.validate(df)
    assert report.missing_target_count == 1
    assert len(clean_df) == 1
