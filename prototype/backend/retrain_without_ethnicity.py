import joblib
import json
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)

DATA_PATH = "data/mimic_adhf_raw.csv"
MODEL_PATH = "adhf_rf_model.pkl"
METRICS_PATH = "model_metrics.json"


def train_without_ethnicity():
    df = pd.read_csv(DATA_PATH)

    # Keep only project-relevant predictors and explicitly remove ethnicity.
    drop_cols = ["No", "HadmID", "Readmission", "Ethnicity"]
    y = df["Readmission"].astype(int)
    X = df.drop(columns=[c for c in drop_cols if c in df.columns])

    # Encode categorical fields used by the dashboard.
    if "Gender" in X.columns:
        X["Gender"] = X["Gender"].astype(str).str.upper().map({"M": 1, "F": 0}).fillna(0).astype(int)

    for col in ["Diabetes", "Hypertension", "AtrialFib", "COPD", "HIV"]:
        if col in X.columns:
            X[col] = X[col].astype(str).str.strip().str.lower().map({"yes": 1, "no": 0}).fillna(0).astype(int)

    X = pd.get_dummies(X, columns=["AdmissionType", "Insurance"], drop_first=True)

    # Basic missing value handling before SMOTE.
    for col in X.columns:
        if X[col].dtype.kind in "biufc":
            X[col] = X[col].fillna(X[col].median())
        else:
            X[col] = X[col].fillna(0)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        class_weight="balanced_subsample",
        n_jobs=-1,
        random_state=42,
    )
    model.fit(X_train_resampled, y_train_resampled)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    metrics = {
        "model_name": "Random Forest",
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "auroc": float(roc_auc_score(y_test, y_proba)),
        "precision": float(precision_score(y_test, y_pred, zero_division=0)),
        "recall": float(recall_score(y_test, y_pred, zero_division=0)),
        "f1": float(f1_score(y_test, y_pred, zero_division=0)),
        "test_samples": int(len(y_test)),
        "test_size": 0.2,
        "random_state": 42,
        "excluded_features": ["Ethnicity"],
    }

    print("Model trained without ethnicity.")
    print("Feature count:", len(model.feature_names_in_))
    print("Any ethnicity features:", any("Ethnicity_" in f for f in model.feature_names_in_))
    print("Accuracy:", metrics["accuracy"])
    print("AUC:", metrics["auroc"])
    print("Confusion matrix:\n", confusion_matrix(y_test, y_pred))
    print("Classification report:\n", classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_PATH)
    with open(METRICS_PATH, "w", encoding="utf-8") as metrics_file:
        json.dump(metrics, metrics_file, indent=2)
    print(f"Saved model to {MODEL_PATH}")
    print(f"Saved metrics to {METRICS_PATH}")


if __name__ == "__main__":
    train_without_ethnicity()
