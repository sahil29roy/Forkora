"""
Data loader module for Forkora Career Recommendation ML Pipeline.
Supports loading CSV and Excel datasets, normalizing target columns, and applying configurable column mappings.
"""
from pathlib import Path
from typing import Dict, Optional, Tuple, Union
import json
import pandas as pd

from src.config import (
    DEFAULT_DATA_PATH,
    EXCLUDED_COLUMNS,
    TARGET_COLUMN,
    TARGET_COLUMN_ALIASES,
)


def load_dataset(
    data_path: Union[str, Path] = DEFAULT_DATA_PATH,
    target_col: str = TARGET_COLUMN,
    column_mapping: Optional[Union[Dict[str, str], str]] = None,
) -> pd.DataFrame:
    """
    Load raw student dataset from CSV or Excel file and perform basic structural sanitation.

    Parameters
    ----------
    data_path : str or Path
        Path to the dataset file (.csv or .xlsx).
    target_col : str
        Target column name (default 'chosen_career').
    column_mapping : dict or JSON string, optional
        Optional mapping to rename columns from a real dataset to standard canonical names.

    Returns
    -------
    pd.DataFrame
        Loaded and normalized DataFrame.
    """
    path = Path(data_path)
    if not path.exists():
        # Also check relative to ML_DIR or REPO_ROOT
        from src.config import ML_DIR, REPO_ROOT
        alt1 = ML_DIR / path
        alt2 = REPO_ROOT / path
        if alt1.exists():
            path = alt1
        elif alt2.exists():
            path = alt2
        else:
            raise FileNotFoundError(f"Dataset file not found at: {data_path}")

    # Load file based on extension
    suffix = path.suffix.lower()
    if suffix in [".xlsx", ".xls"]:
        df = pd.read_excel(path)
    elif suffix in [".csv", ".txt"]:
        df = pd.read_csv(path)
    elif suffix == ".parquet":
        df = pd.read_parquet(path)
    else:
        raise ValueError(f"Unsupported file format: {suffix}. Supported formats: .csv, .xlsx, .parquet")

    # Drop completely empty columns (e.g. 'Unnamed: 20' from Excel)
    unnamed_cols = [c for c in df.columns if str(c).startswith("Unnamed:") and df[c].isna().all()]
    if unnamed_cols:
        df = df.drop(columns=unnamed_cols)

    # Apply user-defined column mapping if provided
    if column_mapping:
        if isinstance(column_mapping, str):
            column_mapping = json.loads(column_mapping)
        df = df.rename(columns=column_mapping)

    # Resolve target column if not present under canonical name
    if target_col not in df.columns:
        for alias in TARGET_COLUMN_ALIASES:
            if alias in df.columns:
                df = df.rename(columns={alias: target_col})
                break

    return df


def split_features_target(
    df: pd.DataFrame,
    target_col: str = TARGET_COLUMN,
    exclude_ids: bool = True,
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Separate features (X) and target (y) from dataset.
    Excludes identifiers and target columns from feature set X to prevent data leakage.

    Parameters
    ----------
    df : pd.DataFrame
        Loaded dataset.
    target_col : str
        Target column name.
    exclude_ids : bool
        Whether to drop identifier columns from X.

    Returns
    -------
    Tuple[pd.DataFrame, pd.Series]
        (X, y)
    """
    if target_col not in df.columns:
        raise KeyError(
            f"Target column '{target_col}' not found in dataset. "
            f"Available columns: {list(df.columns)}"
        )

    y = df[target_col].copy()

    cols_to_drop = [target_col]
    if exclude_ids:
        cols_to_drop.extend([c for c in EXCLUDED_COLUMNS if c in df.columns])

    X = df.drop(columns=cols_to_drop).copy()
    return X, y
