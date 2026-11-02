"""
Training pipeline module for Forkora Career Recommendation ML Pipeline.
Trains and compares multiple multiclass classifiers using Stratified K-Fold CV,
selects the best model via Macro F1, evaluates on held-out test data, saves versioned
artifacts, and registers the model in the registry.
"""
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import argparse
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.tree import DecisionTreeClassifier

from src.config import (
    CV_FOLDS,
    DEFAULT_DATA_PATH,
    MODELS_DIR,
    RANDOM_SEED,
    REPORTS_DIR,
    TARGET_COLUMN,
    TEST_SIZE,
)
from src.data_loader import load_dataset, split_features_target
from src.evaluate import (
    evaluate_model_predictions,
    extract_feature_importance,
    plot_and_save_confusion_matrix,
    plot_and_save_feature_importance,
)
from src.model_registry import ModelRegistry
from src.preprocessing import AcademicPreprocessor, create_pipeline
from src.validation import DatasetValidator


def get_candidate_models(random_seed: int = RANDOM_SEED) -> Dict[str, Any]:
    """
    Define candidate multiclass classification models with balanced class weighting.
    """
    return {
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=random_seed,
            solver="lbfgs",
        ),
        "DecisionTreeClassifier": DecisionTreeClassifier(
            max_depth=12,
            min_samples_split=10,
            class_weight="balanced",
            random_state=random_seed,
        ),
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=100,
            max_depth=16,
            min_samples_split=6,
            class_weight="balanced",
            random_state=random_seed,
            n_jobs=-1,
        ),
        "GradientBoostingClassifier": HistGradientBoostingClassifier(
            max_iter=100,
            max_depth=10,
            class_weight="balanced",
            random_state=random_seed,
        ),
    }


def run_training_pipeline(
    data_path: Union[str, Path] = DEFAULT_DATA_PATH,
    dataset_type: str = "synthetic",
    target_col: str = TARGET_COLUMN,
    column_mapping: Optional[Union[Dict[str, str], str]] = None,
    test_size: float = TEST_SIZE,
    cv_folds: int = CV_FOLDS,
    random_seed: int = RANDOM_SEED,
    activate_model: bool = False,
    version_override: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Execute end-to-end model training, validation, cross-validation, selection,
    held-out testing, serialization, and registry tracking.
    """
    print("\n" + "=" * 80)
    print("FORKORA CAREER RECOMMENDATION ML TRAINING PIPELINE")
    print(f"Timestamp:    {datetime.now().isoformat()}")
    print(f"Dataset Path: {data_path}")
    print(f"Dataset Type: {dataset_type}")
    print(f"Random Seed:  {random_seed}")
    print("=" * 80)

    # 1. Load Dataset
    print("\n[Step 1/8] Loading dataset...")
    raw_df = load_dataset(data_path=data_path, target_col=target_col, column_mapping=column_mapping)
    print(f"  Loaded raw dataset shape: {raw_df.shape}")

    # 2. Validate Dataset
    print("\n[Step 2/8] Validating schema, ranges, and consistency...")
    validator = DatasetValidator(target_col=target_col)
    clean_df, val_report = validator.validate(raw_df)
    print(val_report.get_summary_text())

    # 3. Separate Features and Target
    print("\n[Step 3/8] Isolating feature space and target variable...")
    X, y = split_features_target(clean_df, target_col=target_col, exclude_ids=True)
    class_distribution = y.value_counts().to_dict()
    class_labels = sorted(list(class_distribution.keys()))
    print(f"  Features count: {X.shape[1]}")
    print(f"  Target variable: '{target_col}' with {len(class_labels)} unique career categories:")
    for cls_name, count in sorted(class_distribution.items(), key=lambda x: x[1], reverse=True):
        print(f"    - {cls_name:<26}: {count:>5} records ({count/len(y)*100:.1f}%)")

    # 4. Stratified Train-Test Split
    print(f"\n[Step 4/8] Performing stratified train/test split (Train: {100-int(test_size*100)}%, Test: {int(test_size*100)}%)...")
    # Verify class sample counts for stratified split
    min_class_count = min(class_distribution.values())
    if min_class_count < 2:
        raise ValueError(
            f"Cannot perform stratified train/test split. Minimum class size is {min_class_count}. "
            "At least 2 samples per class are required."
        )

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_seed,
        stratify=y,
    )
    print(f"  Training set: {len(X_train)} samples")
    print(f"  Test set:     {len(X_test)} samples (held out, never seen during CV or tuning)")

    # 5. Cross-Validation on Candidate Models (Training set ONLY)
    print(f"\n[Step 5/8] Evaluating candidate models using {cv_folds}-Fold Stratified Cross-Validation on training set...")
    candidates = get_candidate_models(random_seed=random_seed)
    cv_splitter = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_seed)
    cv_results: Dict[str, Dict[str, float]] = {}

    scoring = {
        "accuracy": "accuracy",
        "macro_f1": "f1_macro",
        "weighted_f1": "f1_weighted",
        "macro_precision": "precision_macro",
        "macro_recall": "recall_macro",
    }

    for name, clf in candidates.items():
        print(f"  Evaluating {name}...")
        pipeline = create_pipeline(clf, scale_numeric=True)
        scores = cross_validate(pipeline, X_train, y_train, cv=cv_splitter, scoring=scoring, n_jobs=1)

        cv_results[name] = {
            "cv_accuracy_mean": float(np.mean(scores["test_accuracy"])),
            "cv_accuracy_std": float(np.std(scores["test_accuracy"])),
            "cv_macro_f1_mean": float(np.mean(scores["test_macro_f1"])),
            "cv_macro_f1_std": float(np.std(scores["test_macro_f1"])),
            "cv_weighted_f1_mean": float(np.mean(scores["test_weighted_f1"])),
            "cv_macro_precision_mean": float(np.mean(scores["test_macro_precision"])),
            "cv_macro_recall_mean": float(np.mean(scores["test_macro_recall"])),
        }

    # Model Comparison Table
    print("\n" + "=" * 90)
    print("MODEL COMPARISON (Stratified 5-Fold Cross-Validation on Training Set)")
    print("=" * 90)
    print(f"{'Model Algorithm':<30} {'CV Macro F1':<18} {'CV Accuracy':<18} {'CV Weighted F1':<18}")
    print("-" * 90)
    for name, m in sorted(cv_results.items(), key=lambda x: x[1]["cv_macro_f1_mean"], reverse=True):
        f1_str = f"{m['cv_macro_f1_mean']:.4f} +/- {m['cv_macro_f1_std']:.4f}"
        acc_str = f"{m['cv_accuracy_mean']:.4f} +/- {m['cv_accuracy_std']:.4f}"
        wf1_str = f"{m['cv_weighted_f1_mean']:.4f}"
        print(f"{name:<30} {f1_str:<18} {acc_str:<18} {wf1_str:<18}")
    print("=" * 90)

    # 6. Select Best Model Based on CV Macro F1
    best_model_name = max(cv_results, key=lambda k: cv_results[k]["cv_macro_f1_mean"])
    print(f"\n[Step 6/8] Best model selected: '{best_model_name}' (CV Macro F1: {cv_results[best_model_name]['cv_macro_f1_mean']:.4f})")
    print("  Selection Rationale: Macro F1 treats all career categories equally, preventing majority class dominance.")

    # 7. Train Final Selected Pipeline on Full Training Set & Evaluate on Held-out Test Set
    print("\n[Step 7/8] Fitting final pipeline on entire training set and evaluating on held-out test set...")
    best_clf = candidates[best_model_name]
    final_pipeline = create_pipeline(best_clf, scale_numeric=True)
    final_pipeline.fit(X_train, y_train)

    # Predict on test set
    y_test_pred = final_pipeline.predict(X_test)
    test_eval = evaluate_model_predictions(y_test, y_test_pred, class_labels=class_labels)

    print("\n" + "-" * 60)
    print("HELD-OUT TEST SET EVALUATION METRICS:")
    print("-" * 60)
    print(f"Accuracy:        {test_eval['accuracy']:.4f}")
    print(f"Macro F1-Score:  {test_eval['macro_f1']:.4f}")
    print(f"Weighted F1:     {test_eval['weighted_f1']:.4f}")
    print(f"Macro Precision: {test_eval['macro_precision']:.4f}")
    print(f"Macro Recall:    {test_eval['macro_recall']:.4f}")
    print("-" * 60)
    print("\nClassification Report:\n")
    print(test_eval["classification_report_str"])

    # Feature Importance
    feature_importances = extract_feature_importance(final_pipeline, top_n=20)
    if feature_importances:
        print("\nTop 10 Most Influential Features:")
        for feat, score in list(feature_importances.items())[:10]:
            print(f"  * {feat:<32}: {score:.5f}")

    # 8. Versioning, Artifact Serialization, and Registration
    print("\n[Step 8/8] Serializing pipeline artifacts and updating Model Registry...")
    registry = ModelRegistry()
    version = version_override or registry.get_next_version()

    version_dir = MODELS_DIR / version
    version_dir.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    # File paths
    pipeline_path = version_dir / "career_pipeline.joblib"
    metadata_path = version_dir / "metadata.json"
    eval_report_path = version_dir / "evaluation_report.json"
    cm_version_path = version_dir / "confusion_matrix.png"
    cm_reports_path = REPORTS_DIR / "confusion_matrix.png"
    feat_imp_version_path = version_dir / "feature_importance.png"
    feat_imp_reports_path = REPORTS_DIR / "feature_importance.png"
    comparison_path = REPORTS_DIR / "model_comparison.json"

    # Save fitted pipeline
    joblib.dump(final_pipeline, pipeline_path)
    print(f"  Saved trained pipeline to: {pipeline_path}")

    # Save confusion matrix plot in both version dir and reports dir
    plot_and_save_confusion_matrix(test_eval["confusion_matrix"], class_labels, output_path=cm_version_path)
    plot_and_save_confusion_matrix(test_eval["confusion_matrix"], class_labels, output_path=cm_reports_path)
    print(f"  Saved confusion matrix plot to: {cm_version_path}")

    # Save feature importance plot
    if feature_importances:
        plot_and_save_feature_importance(feature_importances, output_path=feat_imp_version_path)
        plot_and_save_feature_importance(feature_importances, output_path=feat_imp_reports_path)
        print(f"  Saved feature importance plot to: {feat_imp_version_path}")

    # Save model comparison report
    with open(comparison_path, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "selected_model": best_model_name,
            "cv_results": cv_results,
        }, f, indent=2)

    # Save evaluation report JSON
    with open(eval_report_path, "w", encoding="utf-8") as f:
        json.dump(test_eval, f, indent=2)

    # Save comprehensive metadata.json
    preprocessor = final_pipeline.named_steps["preprocessor"]
    metadata = {
        "model_version": version,
        "training_dataset_name": Path(data_path).name,
        "dataset_type": dataset_type,
        "training_date": datetime.now().isoformat(),
        "num_training_records": len(X_train),
        "num_test_records": len(X_test),
        "input_feature_names": list(X.columns),
        "transformed_feature_names": preprocessor.get_feature_names_out(),
        "target_column": target_col,
        "career_labels": class_labels,
        "model_algorithm": best_model_name,
        "random_seed": random_seed,
        "preprocessing_config": {
            "impute_strategy": "median",
            "scale_numeric": True,
            "unstudied_mark_value": -1.0,
            "categorical_encoding": "OneHotEncoder(handle_unknown='ignore')",
        },
        "cv_metrics": cv_results[best_model_name],
        "test_metrics": {
            "accuracy": test_eval["accuracy"],
            "macro_precision": test_eval["macro_precision"],
            "macro_recall": test_eval["macro_recall"],
            "macro_f1": test_eval["macro_f1"],
            "weighted_f1": test_eval["weighted_f1"],
        },
        "top_features": feature_importances,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"  Saved model metadata to: {metadata_path}")

    # Register in Model Registry
    # If version is v1 or explicitly requested, set as active
    is_active = activate_model or (version == "v1")
    registry.register_version(
        version=version,
        dataset_type=dataset_type,
        dataset_path=str(data_path),
        artifact_path=str(pipeline_path),
        algorithm=best_model_name,
        metrics=test_eval,
        set_active=is_active,
    )
    print(f"  Registered {version} in Model Registry (Active: {is_active})")
    print("=" * 80 + "\n")

    return {
        "version": version,
        "pipeline_path": str(pipeline_path),
        "metadata_path": str(metadata_path),
        "best_model": best_model_name,
        "cv_results": cv_results,
        "test_eval": test_eval,
    }


def main():
    parser = argparse.ArgumentParser(description="Forkora Career Recommendation ML Training Pipeline")
    parser.add_argument("--data", type=str, default=str(DEFAULT_DATA_PATH), help="Path to student dataset (.csv or .xlsx)")
    parser.add_argument("--type", type=str, choices=["synthetic", "real"], default="synthetic", help="Dataset type: synthetic or real")
    parser.add_argument("--target-col", type=str, default=TARGET_COLUMN, help="Target column name")
    parser.add_argument("--column-mapping", type=str, default=None, help="JSON string or file path for column mapping")
    parser.add_argument("--seed", type=int, default=RANDOM_SEED, help="Random seed for reproducibility")
    parser.add_argument("--cv", type=int, default=CV_FOLDS, help="Number of cross-validation folds")
    parser.add_argument("--test-size", type=float, default=TEST_SIZE, help="Held-out test split ratio")
    parser.add_argument("--activate", action="store_true", help="Immediately set newly trained model as active")

    args = parser.parse_args()

    run_training_pipeline(
        data_path=args.data,
        dataset_type=args.type,
        target_col=args.target_col,
        column_mapping=args.column_mapping,
        test_size=args.test_size,
        cv_folds=args.cv,
        random_seed=args.seed,
        activate_model=args.activate,
    )


if __name__ == "__main__":
    main()
