import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib
import os
from data_processing import preprocess_data, generate_dummy_data

# --- Model Training Pipeline ---
def train_model():
    print("Starting Model Training Pipeline...")
    
    # 1. Data Collection & Preprocessing
    # Ensure data exists
    if not os.path.exists('data/raw_data.csv'):
       generate_dummy_data()

    X, y, scaler, feature_columns = preprocess_data()

    # 2. Train-Test Split (80-20 for simplicity, or 80-10-10 as per paper but here just train/test for prototype)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 3. Model Definition (Random Forest)
    rf = RandomForestClassifier(random_state=42)

    # 4. Hyperparameter Tuning (GridSearchCV)
    # Using a smaller grid for speed in this prototype
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [5, 10, 15, None],
        'min_samples_split': [2, 5, 10]
    }
    
    print("Performing Grid Search...")
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=2)
    grid_search.fit(X_train, y_train)

    best_rf = grid_search.best_estimator_
    print(f"Best Hyperparameters: {grid_search.best_params_}")

    # 5. Evaluation
    print("Evaluating Model...")
    y_pred = best_rf.predict(X_test)
    y_pred_proba = best_rf.predict_proba(X_test)[:, 1]

    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print(f"AUC-ROC Score: {roc_auc_score(y_test, y_pred_proba)}")
    print(f"Confusion Matrix: \n{confusion_matrix(y_test, y_pred)}")

    # 6. Save Artifacts
    print("Saving Model Artifacts...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(best_rf, 'models/random_forest_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(feature_columns, 'models/feature_columns.pkl')
    print("Model saved to models/random_forest_model.pkl")

if __name__ == "__main__":
    train_model()
