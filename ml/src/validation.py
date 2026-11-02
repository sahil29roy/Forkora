"""
Data validation module for Forkora Career Recommendation ML Pipeline.
Performs thorough checks on marks bounds, percentage ranges, target labels, duplicates,
stream validity, and subject-mark consistency without silent row drops.
"""
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple
import pandas as pd

from src.config import (
    MAX_MARK,
    MAX_PERCENTAGE,
    MIN_MARK,
    MIN_PERCENTAGE,
    TARGET_COLUMN,
    VALID_STREAMS,
)


class DataValidationError(Exception):
    """Raised when dataset structure is fatally invalid for training."""
    pass


@dataclass
class ValidationReport:
    """Comprehensive report summarizing dataset validation findings."""
    total_records: int = 0
    valid_records: int = 0
    excluded_records: int = 0
    missing_target_count: int = 0
    duplicate_rows_count: int = 0
    duplicate_ids_count: int = 0
    invalid_marks_count: int = 0
    invalid_percentage_count: int = 0
    invalid_streams_count: int = 0
    inconsistent_subjects_count: int = 0
    excluded_indices: List[int] = field(default_factory=list)
    reasons_by_index: Dict[int, List[str]] = field(default_factory=dict)
    summary_messages: List[str] = field(default_factory=list)

    def is_valid(self) -> bool:
        """Check if dataset has enough valid records to proceed."""
        return self.valid_records > 0 and (self.valid_records / max(self.total_records, 1)) >= 0.5

    def get_summary_text(self) -> str:
        """Format a human-readable summary of the validation report."""
        lines = [
            "=" * 60,
            "DATA VALIDATION REPORT",
            "=" * 60,
            f"Total records inspected:    {self.total_records}",
            f"Valid records:              {self.valid_records}",
            f"Excluded records:           {self.excluded_records}",
            f"Missing target labels:      {self.missing_target_count}",
            f"Duplicate rows:             {self.duplicate_rows_count}",
            f"Duplicate student IDs:      {self.duplicate_ids_count}",
            f"Invalid mark values:        {self.invalid_marks_count}",
            f"Invalid percentage values:  {self.invalid_percentage_count}",
            f"Invalid stream values:      {self.invalid_streams_count}",
            f"Inconsistent subject slots: {self.inconsistent_subjects_count}",
            "-" * 60,
        ]
        if self.summary_messages:
            lines.append("Noteworthy observations:")
            for msg in self.summary_messages:
                lines.append(f"  * {msg}")
        lines.append("=" * 60)
        return "\n".join(lines)


class DatasetValidator:
    """Validator for student academic career dataset."""

    def __init__(
        self,
        target_col: str = TARGET_COLUMN,
        min_mark: float = MIN_MARK,
        max_mark: float = MAX_MARK,
        min_percentage: float = MIN_PERCENTAGE,
        max_percentage: float = MAX_PERCENTAGE,
        valid_streams: Optional[Set[str]] = None,
    ):
        self.target_col = target_col
        self.min_mark = min_mark
        self.max_mark = max_mark
        self.min_percentage = min_percentage
        self.max_percentage = max_percentage
        self.valid_streams = valid_streams or VALID_STREAMS

    def validate(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, ValidationReport]:
        """
        Validate dataset records, document issues, and filter out invalid rows with full accounting.

        Parameters
        ----------
        df : pd.DataFrame
            Input dataset.

        Returns
        -------
        Tuple[pd.DataFrame, ValidationReport]
            Cleaned DataFrame of valid records and the comprehensive ValidationReport.

        Raises
        ------
        DataValidationError
            If the dataset is structurally unrecoverable (empty, missing target column, etc.).
        """
        if df is None or len(df) == 0:
            raise DataValidationError("Dataset is empty. Cannot proceed with validation or training.")

        if self.target_col not in df.columns:
            raise DataValidationError(
                f"Required target column '{self.target_col}' is missing from dataset. "
                f"Available columns: {list(df.columns)}"
            )

        report = ValidationReport(total_records=len(df))
        reasons_by_idx: Dict[int, List[str]] = {}

        def record_issue(idx: int, reason: str):
            if idx not in reasons_by_idx:
                reasons_by_idx[idx] = []
            reasons_by_idx[idx].append(reason)

        # 1. Missing target check
        missing_target_mask = df[self.target_col].isna() | (df[self.target_col].astype(str).str.strip() == "")
        for idx in df[missing_target_mask].index:
            record_issue(idx, f"Missing target value in '{self.target_col}'")
            report.missing_target_count += 1

        # 2. Duplicate rows check
        dup_rows_mask = df.duplicated()
        for idx in df[dup_rows_mask].index:
            record_issue(idx, "Identical duplicate row")
            report.duplicate_rows_count += 1

        # 3. Duplicate ID check (if Student_ID present)
        for id_col in ["Student_ID", "student_id", "id", "ID"]:
            if id_col in df.columns:
                dup_id_mask = df[id_col].duplicated(keep="first")
                for idx in df[dup_id_mask].index:
                    record_issue(idx, f"Duplicate identifier in '{id_col}' ({df.loc[idx, id_col]})")
                    report.duplicate_ids_count += 1
                break

        # 4. Check marks columns (range 0 - 100)
        mark_cols = [
            c for c in df.columns
            if "mark" in c.lower() or c in ["Class10_Maths", "Class10_Science", "Class10_SST", "Class10_English"]
        ]
        for col in mark_cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                invalid_mask = (df[col] < self.min_mark) | (df[col] > self.max_mark)
                for idx in df[invalid_mask].index:
                    val = df.loc[idx, col]
                    record_issue(idx, f"Mark out of range [{self.min_mark}, {self.max_mark}] in '{col}': {val}")
                    report.invalid_marks_count += 1

        # 5. Check percentage columns (range 0 - 100)
        percentage_cols = [c for c in df.columns if "percentage" in c.lower()]
        for col in percentage_cols:
            if pd.api.types.is_numeric_dtype(df[col]):
                invalid_mask = (df[col] < self.min_percentage) | (df[col] > self.max_percentage)
                for idx in df[invalid_mask].index:
                    val = df.loc[idx, col]
                    record_issue(idx, f"Percentage out of range [{self.min_percentage}, {self.max_percentage}] in '{col}': {val}")
                    report.invalid_percentage_count += 1

        # 6. Stream validation
        stream_cols = [c for c in df.columns if "stream" in c.lower()]
        for col in stream_cols:
            invalid_stream_mask = ~df[col].astype(str).str.strip().isin(self.valid_streams) & ~df[col].isna()
            for idx in df[invalid_stream_mask].index:
                val = df.loc[idx, col]
                record_issue(idx, f"Unrecognized stream value in '{col}': '{val}'")
                report.invalid_streams_count += 1

        # 7. Subject slots consistency
        # Check if Subject{i}_Name is given, does it have corresponding Subject{i}_Marks?
        # Check for duplicate subjects within same student
        for idx, row in df.iterrows():
            chosen_subjects: List[str] = []
            for i in range(1, 10):
                name_col = f"Class12_Subject{i}_Name"
                mark_col = f"Class12_Subject{i}_Marks"
                if name_col in df.columns:
                    sub_name = str(row[name_col]).strip() if pd.notna(row[name_col]) else ""
                    if sub_name and sub_name != "nan":
                        if sub_name in chosen_subjects:
                            record_issue(idx, f"Duplicate Class 12 subject '{sub_name}' in slot {i}")
                            report.inconsistent_subjects_count += 1
                        chosen_subjects.append(sub_name)

                        if mark_col in df.columns and pd.isna(row[mark_col]):
                            record_issue(idx, f"Subject '{sub_name}' specified in slot {i} but marks are missing")
                            report.inconsistent_subjects_count += 1

        # Tally excluded rows
        excluded_indices = sorted(list(reasons_by_idx.keys()))
        report.excluded_indices = excluded_indices
        report.reasons_by_index = reasons_by_idx
        report.excluded_records = len(excluded_indices)
        report.valid_records = report.total_records - report.excluded_records

        # Summary notes
        if report.excluded_records > 0:
            report.summary_messages.append(
                f"Excluded {report.excluded_records} records ({report.excluded_records/report.total_records*100:.2f}%) "
                f"due to validation violations."
            )
        else:
            report.summary_messages.append("All records successfully passed strict schema and range validation.")

        if not report.is_valid():
            raise DataValidationError(
                f"Dataset failed validation: too many invalid records ({report.excluded_records}/{report.total_records}). "
                f"\nSummary:\n{report.get_summary_text()}"
            )

        # Return filtered dataframe of valid records
        clean_df = df.drop(index=excluded_indices).reset_index(drop=True)
        return clean_df, report
