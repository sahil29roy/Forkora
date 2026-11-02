# Forkora Machine Learning Pipeline: Career Category Recommendation

This module provides a modular, reproducible Machine Learning pipeline for predicting broad student career categories based on secondary and senior secondary academic performance (Class 10 and Class 12).

---

## 1. Project Overview & Architecture

The ML pipeline is architecturally isolated from Forkora's Node.js backend. It operates independently in Python using Scikit-learn, with standardized pipelines for preprocessing, validation, cross-validation model selection, versioned serialization, and active registry management.

### Directory Structure

```
ml/
├── datasets/
│   ├── synthetic/
│   │   ├── students.csv
│   │   └── student_career_dataset.xlsx
│   └── real/
│       └── .gitkeep                  # Drop real student datasets here
├── models/
│   ├── model_registry.json           # Active version tracker and history
│   └── v1/
│       ├── career_pipeline.joblib    # Serialized preprocessor + classifier
│       ├── metadata.json             # Provenance, features, metrics, config
│       ├── evaluation_report.json    # Detailed per-class metrics & confusion matrix
│       ├── confusion_matrix.png      # Confusion matrix heatmap
│       └── feature_importance.png    # Top influential features chart
├── reports/
│   ├── confusion_matrix.png
│   ├── feature_importance.png
│   └── model_comparison.json         # Cross-validation comparison across candidates
├── notebooks/
│   └── explore_dataset.py
├── src/
│   ├── __init__.py
│   ├── config.py                     # Centralized paths, bounds, and subjects
│   ├── data_loader.py                # CSV/Excel loading, alias mapping, leak prevention
│   ├── validation.py                 # Strict data validation & accounting
│   ├── preprocessing.py              # Zero vs unstudied preservation, OneHotEncoder, scaler
│   ├── train.py                      # Stratified CV, model selection, held-out testing
│   ├── evaluate.py                   # Multi-class evaluation metrics & plots
│   ├── predict.py                    # Prediction inference engine & CLI
│   └── model_registry.py             # Version registry management & rollback CLI
├── tests/
│   ├── __init__.py
│   ├── test_validation.py
│   ├── test_preprocessing.py
│   ├── test_training.py
│   └── test_prediction.py
├── requirements.txt
└── README.md
```

---

## 2. Installation & Setup

### 2.1 Virtual Environment Setup

From the `ml/` directory:

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows Command Prompt:
.\venv\Scripts\activate.bat
# On Linux / macOS:
source venv/bin/activate
```

### 2.2 Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 3. Dataset Placement & Expected Schema

### 3.1 Dataset Locations
- **Synthetic Data**: Place in `ml/datasets/synthetic/students.csv` or `ml/datasets/synthetic/student_career_dataset.xlsx`.
- **Real Data**: Place collected student records in `ml/datasets/real/students.csv`.

### 3.2 Expected Schema

The pipeline natively supports both **slot-based schema** and **wide/direct schema**:

| Feature Field | Description | Type / Range | Example |
| :--- | :--- | :--- | :--- |
| `Student_ID` | Unique identifier (automatically excluded from training) | Numeric / String | `10001` |
| `Class10_Maths` | Class 10 Mathematics score | 0 - 100 | `85` |
| `Class10_Science` | Class 10 Science score | 0 - 100 | `88` |
| `Class10_SST` | Class 10 Social Science score | 0 - 100 | `74` |
| `Class10_English` | Class 10 English score | 0 - 100 | `80` |
| `Class10_Fifth_Subject` | Class 10 Elective Subject | Nominal Categorical | `"German"`, `"IT"` |
| `Class10_Fifth_Marks` | Class 10 Elective Subject score | 0 - 100 | `92` |
| `Class10_Percentage` | Class 10 Overall aggregate % | 0 - 100 | `83.8` |
| `Class12_Stream` | Senior secondary academic stream | Categorical | `"PCM"`, `"PCB"`, `"Commerce"`, `"Arts"`, `"PCMB"` |
| `Class12_Percentage` | Class 12 Overall aggregate % | 0 - 100 | `87.5` |
| `Class12_Subject{i}_Name` | Class 12 Subject Slot 1 to 5 Name | String | `"Physics"`, `"Economics"` |
| `Class12_Subject{i}_Marks` | Class 12 Subject Slot 1 to 5 Mark | 0 - 100 | `89` |
| `chosen_career` *(or `Career_Field`)* | Target broad career category | String | `"Engineering"`, `"Business / Finance"` |

### 3.3 Critical Preprocessing Rule: Unstudied Subjects vs. Zero Marks
An unstudied subject is **never** treated as a zero mark. The preprocessor creates:
1. `has_{subject}` (binary indicator: `1.0` if studied, `0.0` if not studied).
2. `mark_{subject}`:
   - When a student studied the subject and scored `0.0`: `has_{subject} = 1.0`, `mark_{subject} = 0.0`.
   - When a student did not study the subject: `has_{subject} = 0.0`, `mark_{subject} = -1.0` (imputed).

This preserves the distinction between subject omission and subject failure.

---

## 4. Training the Pipeline

### 4.1 Basic Training on Synthetic Data

From the `ml/` directory:

```bash
python -m src.train --data datasets/synthetic/students.csv --type synthetic --activate
```

This will:
1. Load and sanitize dataset.
2. Run strict range and consistency checks (reports any excluded rows).
3. Split data 80% train / 20% test using Stratified Splitting.
4. Run 5-fold Stratified Cross-Validation on:
   - Logistic Regression
   - Decision Tree Classifier
   - Random Forest Classifier
   - Gradient Boosting Classifier (HistGradientBoosting)
5. Select best model based on **Macro F1** (accounting for class imbalance).
6. Fit best model on the complete training set.
7. Evaluate once on the 20% held-out test set.
8. Save artifacts to `models/v{N}/` and register version in `model_registry.json`.

---

## 5. Model Inference & Predictions

### 5.1 Command Line Prediction

Run sample inference:
```bash
python -m src.predict --sample
```

Run prediction on a custom student JSON file:
```bash
python -m src.predict --input-json path/to/student.json
```

Or pass inline JSON:
```bash
python -m src.predict --input-json '{"Class10_Maths": 92, "Class10_Science": 94, "Class10_SST": 75, "Class10_English": 82, "Class10_Fifth_Subject": "IT", "Class10_Fifth_Marks": 96, "Class10_Percentage": 87.8, "Class12_Stream": "PCM", "Class12_Percentage": 91.5, "Class12_Subject1_Name": "Physics", "Class12_Subject1_Marks": 92, "Class12_Subject2_Name": "Chemistry", "Class12_Subject2_Marks": 88, "Class12_Subject3_Name": "Mathematics", "Class12_Subject3_Marks": 95, "Class12_Subject4_Name": "English", "Class12_Subject4_Marks": 85, "Class12_Subject5_Name": "Computer Science", "Class12_Subject5_Marks": 97}'
```

### 5.2 Python API Usage

```python
from src.predict import CareerPredictor

# Automatically loads active model version
predictor = CareerPredictor()

student_profile = {
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

result = predictor.predict_single(student_profile, top_k=3)
print(result)
```

Example JSON response:
```json
{
  "model_version": "v1",
  "predicted_career": "Engineering",
  "top_predictions": [
    {
      "career": "Engineering",
      "probability": 0.4501
    },
    {
      "career": "Architecture / Design",
      "probability": 0.3082
    },
    {
      "career": "Computer Science / IT",
      "probability": 0.1252
    }
  ],
  "disclaimer": "Model probabilities reflect pattern associations from training data and should not be treated as calibrated real-world likelihoods or career suitability guarantees."
}
```

---

## 6. Retraining with Real-World Data

When original student data becomes available:

1. Place dataset in `ml/datasets/real/students.csv`.
2. If column names differ, supply a column mapping JSON string:
   ```bash
   python -m src.train \
       --data datasets/real/students.csv \
       --type real \
       --column-mapping '{"c10_math": "Class10_Maths", "stream": "Class12_Stream", "career": "chosen_career"}'
   ```
3. The retraining module will:
   - Validate schema and marks.
   - Increment the version (e.g. `v1` -> `v2`).
   - Preserve historical `v1` artifacts without overwriting.
   - Run CV and generate evaluation reports for the new version.
4. Evaluate the new version before activating:
   ```bash
   # Inspect metadata and test metrics of v2
   python -m src.model_registry info v2

   # Activate v2 once approved
   python -m src.model_registry set-active v2
   ```

---

## 7. Model Version Management & Rollback

### List All Models
```bash
python -m src.model_registry list
```

### Inspect Model Metadata
```bash
python -m src.model_registry info v1
```

### Activate a Model Version
```bash
python -m src.model_registry set-active v1
```

### Rollback to Previous Version
```bash
python -m src.model_registry rollback
```
Or specify a target version explicitly:
```bash
python -m src.model_registry rollback --version v1
```

---

## 8. Running Automated Tests

Run the complete test suite:
```bash
python -m pytest -v
```

Tests cover:
- Data validation and range boundaries
- Unstudied subject vs zero mark distinction
- Unknown categorical handling at inference
- Pipeline serialization and reloading
- Metric computation (accuracy, macro F1, confusion matrix)
- Model registry version incrementing and rollback

---

## 9. Critical Caveat: Limitations of Synthetic Training Data

1. **Synthetic Nature**: The current dataset (`v1`) was generated synthetically. Performance on synthetic data **does not guarantee real-world generalization**.
2. **Model Probabilities**: Class probabilities returned by the model reflect empirical sample distributions in the training dataset and must **not** be treated as calibrated likelihoods or life-outcome guarantees.
3. **Exploration Tool**: Machine learning predictions should be used solely as exploratory recommendations to assist career discovery, alongside psychometric evaluations and academic counseling.
