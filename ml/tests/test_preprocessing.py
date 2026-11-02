"""
Unit tests for Preprocessing Module.
Verifies categorical encoding, feature extraction, and preservation of unstudied vs zero marks.
"""
import pytest
import pandas as pd
import numpy as np

from src.preprocessing import AcademicPreprocessor, create_pipeline
from sklearn.tree import DecisionTreeClassifier


@pytest.fixture
def sample_feature_dataframe():
    """Create a fixture with unstudied subject vs zero mark."""
    return pd.DataFrame([
        {
            # Student 1: Studied Physics and scored 0.0!
            "Class10_Maths": 70,
            "Class10_Science": 65,
            "Class10_SST": 60,
            "Class10_English": 75,
            "Class10_Fifth_Subject": "German",
            "Class10_Fifth_Marks": 80,
            "Class10_Percentage": 70.0,
            "Class12_Stream": "PCM",
            "Class12_Percentage": 60.0,
            "Class12_Subject1_Name": "Physics",
            "Class12_Subject1_Marks": 0,  # Explicit zero score!
            "Class12_Subject2_Name": "Chemistry",
            "Class12_Subject2_Marks": 70,
            "Class12_Subject3_Name": "Mathematics",
            "Class12_Subject3_Marks": 80,
            "Class12_Subject4_Name": "English",
            "Class12_Subject4_Marks": 75,
            "Class12_Subject5_Name": "Computer Science",
            "Class12_Subject5_Marks": 85,
        },
        {
            # Student 2: Arts student who NEVER studied Physics or Chemistry!
            "Class10_Maths": 50,
            "Class10_Science": 55,
            "Class10_SST": 85,
            "Class10_English": 80,
            "Class10_Fifth_Subject": "Music",
            "Class10_Fifth_Marks": 90,
            "Class10_Percentage": 72.0,
            "Class12_Stream": "Arts",
            "Class12_Percentage": 78.0,
            "Class12_Subject1_Name": "History",
            "Class12_Subject1_Marks": 85,
            "Class12_Subject2_Name": "Political Science",
            "Class12_Subject2_Marks": 80,
            "Class12_Subject3_Name": "Geography",
            "Class12_Subject3_Marks": 75,
            "Class12_Subject4_Name": "English",
            "Class12_Subject4_Marks": 82,
            "Class12_Subject5_Name": "Sociology",
            "Class12_Subject5_Marks": 90,
        },
    ])


def test_preprocessor_preserves_zero_vs_unstudied_distinction(sample_feature_dataframe):
    """
    Ensure a student who studied a subject and scored 0.0 is cleanly distinguished
    from a student who never studied the subject (indicator=0, mark=-1).
    """
    prep = AcademicPreprocessor(scale_numeric=False)  # Unscaled to check raw extracted values
    prep.fit(sample_feature_dataframe)

    df_base_num, df_subj_marks, df_ind, df_cat = prep._extract_tabular_features(sample_feature_dataframe)

    # Student 0 studied Physics and scored 0.0
    assert df_ind.loc[0, "has_physics"] == 1.0
    assert df_subj_marks.loc[0, "mark_physics"] == 0.0

    # Student 1 never studied Physics
    assert df_ind.loc[1, "has_physics"] == 0.0
    assert df_subj_marks.loc[1, "mark_physics"] == -1.0


def test_preprocessor_handles_unknown_categories_safely(sample_feature_dataframe):
    """Ensure unexpected streams or subjects at test time do not crash transform."""
    prep = AcademicPreprocessor()
    prep.fit(sample_feature_dataframe)

    test_row = sample_feature_dataframe.iloc[[0]].copy()
    test_row["Class12_Stream"] = "UnknownStream"
    test_row["Class10_Fifth_Subject"] = "UnknownSubject"

    # Should transform cleanly without throwing an exception
    X_trans = prep.transform(test_row)
    assert X_trans.shape[0] == 1
    assert X_trans.shape[1] == len(prep.get_feature_names_out())


def test_pipeline_creation_and_end_to_end_fit(sample_feature_dataframe):
    y = pd.Series(["Engineering", "Law"])
    pipeline = create_pipeline(DecisionTreeClassifier(random_state=42))
    pipeline.fit(sample_feature_dataframe, y)

    preds = pipeline.predict(sample_feature_dataframe)
    assert len(preds) == 2
    assert preds[0] in ["Engineering", "Law"]
