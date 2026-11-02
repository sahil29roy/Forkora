"""
Configuration module for Forkora Career Recommendation ML Pipeline.
"""
from pathlib import Path
from typing import Dict, List, Set

# Base directory paths
# ML_DIR is the root of the ml/ package
ML_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ML_DIR.parent

DATASETS_DIR = ML_DIR / "datasets"
SYNTHETIC_DATA_DIR = DATASETS_DIR / "synthetic"
REAL_DATA_DIR = DATASETS_DIR / "real"
DEFAULT_DATA_PATH = SYNTHETIC_DATA_DIR / "students.csv"

MODELS_DIR = ML_DIR / "models"
REPORTS_DIR = ML_DIR / "reports"
REGISTRY_PATH = MODELS_DIR / "model_registry.json"

# Training parameters
RANDOM_SEED: int = 42
TEST_SIZE: float = 0.2
CV_FOLDS: int = 5

# Target column configuration
TARGET_COLUMN: str = "chosen_career"
TARGET_COLUMN_ALIASES: List[str] = [
    "chosen_career",
    "Career_Field",
    "career_field",
    "career",
    "Career",
    "target",
]

# ID and metadata columns that must never be used as predictive features
EXCLUDED_COLUMNS: Set[str] = {
    "Student_ID",
    "student_id",
    "id",
    "ID",
    "Unnamed: 20",
    "created_at",
    "updated_at",
}

# Validation constraints
MIN_MARK: float = 0.0
MAX_MARK: float = 100.0
MIN_PERCENTAGE: float = 0.0
MAX_PERCENTAGE: float = 100.0

VALID_STREAMS: Set[str] = {
    "PCM",
    "PCB",
    "PCMB",
    "Commerce",
    "Arts",
    "Science",
    "Humanities",
}

# Standard Class 12 subjects recognized across synthetic and real CBSE/State curricula
STANDARD_CLASS12_SUBJECTS: List[str] = [
    "Accountancy",
    "Agriculture",
    "Applied Mathematics",
    "Biology",
    "Biotechnology",
    "Business Studies",
    "Chemistry",
    "Computer Science",
    "Economics",
    "English",
    "Fine Arts",
    "Geography",
    "History",
    "Informatics Practices",
    "Legal Studies",
    "Mathematics",
    "Physical Education",
    "Physics",
    "Political Science",
    "Psychology",
    "Sociology",
    "Vocational Studies",
]

# Subject slot pattern configuration in dataset
SUBJECT_SLOT_COUNT: int = 5
