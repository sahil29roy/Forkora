"""
Preprocessing module for Forkora Career Recommendation ML Pipeline.
Implements custom Scikit-learn transformers and pipelines to extract academic features,
encode nominal categorical columns, preserve unstudied vs zero marks distinctions,
and prevent data leakage.
"""
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def normalize_subject_name(name: str) -> str:
    """Normalize subject string for robust matching."""
    if not name or pd.isna(name):
        return ""
    clean = str(name).strip().title()
    mapping = {
        "Maths": "Mathematics",
        "Math": "Mathematics",
        "Cs": "Computer Science",
        "Comp Sci": "Computer Science",
        "Bio": "Biology",
        "Phy": "Physics",
        "Chem": "Chemistry",
        "Pe": "Physical Education",
        "P.E.": "Physical Education",
        "Physical Edu": "Physical Education",
        "Pol Science": "Political Science",
        "Pol Sci": "Political Science",
        "Accounts": "Accountancy",
        "Bst": "Business Studies",
        "Eco": "Economics",
    }
    return mapping.get(clean, clean)


class AcademicPreprocessor(BaseEstimator, TransformerMixin):
    """
    End-to-end academic preprocessor compliant with Scikit-learn Transformer interface.

    Extracts:
    1. Base Class 10 academic marks and percentage.
    2. Class 10 elective subject (One-Hot Encoded) and marks.
    3. Class 12 stream (One-Hot Encoded) and percentage.
    4. Class 12 subject indicators (has_subject) to preserve unstudied vs zero distinction.
    5. Class 12 individual subject marks (unstudied filled with -1.0, scaled).
    """

    def __init__(
        self,
        known_subjects: Optional[List[str]] = None,
        unstudied_mark_value: float = -1.0,
        scale_numeric: bool = True,
    ):
        self.known_subjects = known_subjects
        self.unstudied_mark_value = unstudied_mark_value
        self.scale_numeric = scale_numeric

        # Fitted attributes
        self.subjects_: List[str] = []
        self.cat_encoder_: Optional[OneHotEncoder] = None
        self.base_imputer_: Optional[SimpleImputer] = None
        self.scaler_: Optional[StandardScaler] = None
        self.feature_names_out_: List[str] = []
        self.base_num_cols_: List[str] = []
        self.cat_cols_: List[str] = []

    def _discover_subjects(self, df: pd.DataFrame) -> List[str]:
        """Discover all unique Class 12 subjects actually present in the dataset."""
        if self.known_subjects:
            return sorted(list(set(self.known_subjects)))

        subjects: Set[str] = set()

        # Inspect slot columns (Class12_Subject{i}_Name)
        for col in df.columns:
            if "subject" in col.lower() and "name" in col.lower():
                vals = df[col].dropna().unique()
                for v in vals:
                    clean = normalize_subject_name(str(v))
                    if clean and clean.lower() != "nan":
                        subjects.add(clean)

        # Also inspect wide columns like Class12_{Subject}_Marks
        for col in df.columns:
            if col.startswith("Class12_") and col.endswith("_Marks"):
                subj_name = col[8:-6].replace("_", " ")
                clean = normalize_subject_name(subj_name)
                if clean:
                    subjects.add(clean)

        return sorted(list(subjects))

    def _extract_tabular_features(
        self, X: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """
        Extract base numerical, indicator, and categorical dataframes from raw input.
        """
        if isinstance(X, dict):
            df = pd.DataFrame([X])
        elif isinstance(X, list):
            df = pd.DataFrame(X)
        elif isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            df = pd.DataFrame(X)

        n_rows = len(df)

        def _get_num_series(col_name: str, alt_name: str = "") -> pd.Series:
            if col_name in df.columns:
                return pd.to_numeric(df[col_name], errors="coerce")
            if alt_name and alt_name in df.columns:
                return pd.to_numeric(df[alt_name], errors="coerce")
            return pd.Series(np.nan, index=df.index, dtype=float)

        # 1. Base Class 10 Numerical Features
        c10_maths = _get_num_series("Class10_Maths", "c10_maths")
        c10_science = _get_num_series("Class10_Science", "c10_science")
        c10_sst = _get_num_series("Class10_SST", "c10_sst")
        c10_english = _get_num_series("Class10_English", "c10_english")
        c10_fifth_marks = _get_num_series("Class10_Fifth_Marks", "c10_fifth_marks")
        c10_pct = _get_num_series("Class10_Percentage", "c10_percentage")

        # 2. Base Class 12 Numerical Features
        c12_pct = _get_num_series("Class12_Percentage", "c12_percentage")

        # Fallback percentage calculation if missing but marks present
        c10_calc_pct = pd.concat([c10_maths, c10_science, c10_sst, c10_english, c10_fifth_marks], axis=1).mean(axis=1)
        c10_pct = c10_pct.fillna(c10_calc_pct)

        base_numeric = {
            "c10_maths": c10_maths,
            "c10_science": c10_science,
            "c10_sst": c10_sst,
            "c10_english": c10_english,
            "c10_fifth_marks": c10_fifth_marks,
            "c10_percentage": c10_pct,
            "c12_percentage": c12_pct,
        }

        # 3. Categorical Features
        c10_fifth_subj = df.get("Class10_Fifth_Subject", df.get("c10_fifth_subject", pd.Series(["None"] * n_rows)))
        c10_fifth_subj = c10_fifth_subj.fillna("None").astype(str).str.strip()

        c12_stream = df.get("Class12_Stream", df.get("c12_stream", pd.Series(["Unknown"] * n_rows)))
        c12_stream = c12_stream.fillna("Unknown").astype(str).str.strip()

        df_cat = pd.DataFrame({
            "c10_fifth_subject": c10_fifth_subj,
            "c12_stream": c12_stream,
        }, index=df.index)

        # 4. Class 12 Subject Indicators and Marks
        subject_marks: Dict[str, pd.Series] = {}
        subject_indicators: Dict[str, pd.Series] = {}

        for subj in self.subjects_:
            clean_sub_col = subj.lower().replace(" ", "_")
            # Default unstudied subject gets unstudied_mark_value (-1.0) and has_sub = 0.0
            subject_marks[f"mark_{clean_sub_col}"] = pd.Series(self.unstudied_mark_value, index=df.index, dtype=float)
            subject_indicators[f"has_{clean_sub_col}"] = pd.Series(0.0, index=df.index, dtype=float)

        # Populate from slot columns: Class12_Subject{i}_Name and Class12_Subject{i}_Marks
        for i in range(1, 10):
            name_col = f"Class12_Subject{i}_Name"
            mark_col = f"Class12_Subject{i}_Marks"
            if name_col in df.columns:
                sub_names = df[name_col].astype(str).map(normalize_subject_name)
                marks = pd.to_numeric(df[mark_col], errors="coerce") if mark_col in df.columns else pd.Series(np.nan, index=df.index)

                for row_idx, (s_name, s_mark) in enumerate(zip(sub_names, marks)):
                    idx = df.index[row_idx]
                    if s_name and s_name in self.subjects_:
                        clean_col = s_name.lower().replace(" ", "_")
                        subject_indicators[f"has_{clean_col}"].loc[idx] = 1.0
                        if pd.notna(s_mark):
                            # Preserves student's actual mark, even if 0.0
                            subject_marks[f"mark_{clean_col}"].loc[idx] = float(s_mark)

        # Also support wide format input: Class12_{Subject}_Marks or {Subject}_Marks
        for subj in self.subjects_:
            clean_col = subj.lower().replace(" ", "_")
            candidate_cols = [
                f"Class12_{subj}_Marks",
                f"Class12_{subj}",
                f"{subj}_Marks",
                f"Class12_{clean_col}_marks",
                f"mark_{clean_col}",
            ]
            for c_col in candidate_cols:
                if c_col in df.columns:
                    wide_marks = pd.to_numeric(df[c_col], errors="coerce")
                    valid_mask = wide_marks.notna()
                    subject_indicators[f"has_{clean_col}"][valid_mask] = 1.0
                    subject_marks[f"mark_{clean_col}"][valid_mask] = wide_marks[valid_mask]
                    break

        df_base_num = pd.DataFrame(base_numeric, index=df.index)
        df_subj_marks = pd.DataFrame(subject_marks, index=df.index)
        df_ind = pd.DataFrame(subject_indicators, index=df.index)

        return df_base_num, df_subj_marks, df_ind, df_cat

    def fit(self, X: pd.DataFrame, y: Optional[pd.Series] = None) -> "AcademicPreprocessor":
        """
        Fit preprocessor on training data ONLY to prevent leakage.
        """
        if isinstance(X, (dict, list)):
            X = pd.DataFrame(X)

        self.subjects_ = self._discover_subjects(X)
        df_base_num, df_subj_marks, df_ind, df_cat = self._extract_tabular_features(X)

        self.base_num_cols_ = list(df_base_num.columns)
        self.cat_cols_ = list(df_cat.columns)

        # 1. Fit Categorical Encoder (handle unknown categories safely)
        self.cat_encoder_ = OneHotEncoder(
            handle_unknown="ignore",
            sparse_output=False,
        )
        self.cat_encoder_.fit(df_cat)

        # 2. Fit Imputer on base numerical features (median strategy)
        self.base_imputer_ = SimpleImputer(strategy="median")
        self.base_imputer_.fit(df_base_num)

        # 3. Fit Scaler across base numerical and subject marks
        if self.scale_numeric:
            base_imputed = self.base_imputer_.transform(df_base_num)
            all_num = np.hstack([base_imputed, df_subj_marks.to_numpy(dtype=float)])
            self.scaler_ = StandardScaler()
            self.scaler_.fit(all_num)

        # Build feature names out
        num_names = self.base_num_cols_ + list(df_subj_marks.columns)
        ind_names = list(df_ind.columns)
        cat_names = list(self.cat_encoder_.get_feature_names_out(self.cat_cols_))
        self.feature_names_out_ = num_names + ind_names + cat_names

        return self

    def transform(self, X: Union[pd.DataFrame, Dict[str, Any], List[Dict[str, Any]]]) -> np.ndarray:
        """
        Transform raw student data into complete numerical feature matrix.
        """
        if self.cat_encoder_ is None or self.base_imputer_ is None:
            raise RuntimeError("AcademicPreprocessor must be fitted before transform can be called.")

        df_base_num, df_subj_marks, df_ind, df_cat = self._extract_tabular_features(X)

        # Impute base numerical features
        base_imputed = self.base_imputer_.transform(df_base_num)
        all_num = np.hstack([base_imputed, df_subj_marks.to_numpy(dtype=float)])

        if self.scale_numeric and self.scaler_ is not None:
            all_num = self.scaler_.transform(all_num)

        # Indicators are kept as clean binary 0.0 / 1.0
        X_ind = df_ind.fillna(0.0).to_numpy(dtype=float)

        # Encode categorical features
        X_cat = self.cat_encoder_.transform(df_cat)

        # Concatenate horizontally: [Scaled Numbers, Binary Indicators, One-Hot Categoricals]
        X_out = np.hstack([all_num, X_ind, X_cat])
        return X_out

    def get_feature_names_out(self, input_features: Optional[Any] = None) -> List[str]:
        """Return list of transformed feature names for interpretability."""
        return list(self.feature_names_out_)


def create_pipeline(
    classifier: BaseEstimator,
    scale_numeric: bool = True,
) -> Pipeline:
    """
    Construct a complete end-to-end Scikit-learn Pipeline with preprocessing and classifier.
    """
    preprocessor = AcademicPreprocessor(
        scale_numeric=scale_numeric,
    )
    return Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", classifier),
    ])
