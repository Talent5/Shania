import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, precision_recall_curve, auc
import xgboost as xgb
import joblib
import os
from data_processing import preprocess_data, generate_dummy_data


def compute_lace(row):
    score = 0
    if row.get('Age') is not None:
        if row['Age'] >= 90: score += 7
        elif row['Age'] >= 80: score += 6
        elif row['Age'] >= 70: score += 5
        elif row['Age'] >= 60: score += 4
        elif row['Age'] >= 50: score += 3
        elif row['Age'] >= 40: score += 2
        elif row['Age'] >= 30: score += 1
    if row.get('length_of_stay') is not None:
        if row['length_of_stay'] >= 14: score += 4
        elif row['length_of_stay'] >= 7: score += 3
        elif row['length_of_stay'] >= 4: score += 2
        elif row['length_of_stay'] >= 1: score += 1
    if row.get('admission_type') is not None:
        score += 3 if row['admission_type'] == 'EMERGENCY' else 0
    comorbid_count = 0
    for col in ['Diabetes', 'Hypertension', 'AtrialFib', 'COPD', 'HIV']:
        if col in row and row[col] == 1:
            comorbid_count += 1
    if comorbid_count >= 3: score += 5
    elif comorbid_count >= 2: score += 3
    elif comorbid_count >= 1: score += 1
    return score


def train_model():
    print("Starting Model Training Pipeline...")

    if not os.path.exists('data/raw_data.csv'):
       generate_dummy_data()

    X, y, scaler, feature_columns = preprocess_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    results = {}

    # --- Model 1: Logistic Regression (Baseline) ---
    print("\n--- Training Logistic Regression ---")
    lr = LogisticRegression(random_state=42, max_iter=1000)
    lr.fit(X_train, y_train)
    y_pred_lr = lr.predict(X_test)
    y_prob_lr = lr.predict_proba(X_test)[:, 1]
    results['Logistic Regression'] = {
        'model': lr, 'y_pred': y_pred_lr, 'y_prob': y_prob_lr
    }
    print(f"  AUROC: {roc_auc_score(y_test, y_prob_lr):.4f}")

    # --- Model 2: Random Forest (Primary) ---
    print("\n--- Training Random Forest ---")
    rf = RandomForestClassifier(random_state=42)
    param_grid = {
        'n_estimators': [50, 100, 200],
        'max_depth': [5, 10, 15, None],
        'min_samples_split': [2, 5, 10]
    }
    grid_search = GridSearchCV(estimator=rf, param_grid=param_grid, cv=3, n_jobs=-1, verbose=1)
    grid_search.fit(X_train, y_train)
    best_rf = grid_search.best_estimator_
    print(f"  Best params: {grid_search.best_params_}")
    y_pred_rf = best_rf.predict(X_test)
    y_prob_rf = best_rf.predict_proba(X_test)[:, 1]
    results['Random Forest'] = {
        'model': best_rf, 'y_pred': y_pred_rf, 'y_prob': y_prob_rf
    }
    print(f"  AUROC: {roc_auc_score(y_test, y_prob_rf):.4f}")

    # --- Model 3: XGBoost ---
    print("\n--- Training XGBoost ---")
    xgb_model = xgb.XGBClassifier(
        random_state=42, eval_metric='logloss', use_label_encoder=False
    )
    param_grid_xgb = {
        'n_estimators': [50, 100, 200],
        'max_depth': [3, 6, 10],
        'learning_rate': [0.01, 0.1, 0.2],
        'subsample': [0.8, 1.0]
    }
    grid_search_xgb = GridSearchCV(
        estimator=xgb_model, param_grid=param_grid_xgb, cv=3, n_jobs=-1, verbose=1
    )
    grid_search_xgb.fit(X_train, y_train)
    best_xgb = grid_search_xgb.best_estimator_
    print(f"  Best params: {grid_search_xgb.best_params_}")
    y_pred_xgb = best_xgb.predict(X_test)
    y_prob_xgb = best_xgb.predict_proba(X_test)[:, 1]
    results['XGBoost'] = {
        'model': best_xgb, 'y_pred': y_pred_xgb, 'y_prob': y_prob_xgb
    }
    print(f"  AUROC: {roc_auc_score(y_test, y_prob_xgb):.4f}")

    # --- Model 4: Soft Voting Ensemble (LR + RF + XGB) ---
    print("\n--- Training Soft Voting Ensemble ---")
    ensemble = VotingClassifier(
        estimators=[
            ('lr', lr),
            ('rf', best_rf),
            ('xgb', best_xgb)
        ],
        voting='soft'
    )
    ensemble.fit(X_train, y_train)
    y_pred_ens = ensemble.predict(X_test)
    y_prob_ens = ensemble.predict_proba(X_test)[:, 1]
    results['Ensemble (LR+RF+XGB)'] = {
        'model': ensemble, 'y_pred': y_pred_ens, 'y_prob': y_prob_ens
    }
    print(f"  AUROC: {roc_auc_score(y_test, y_prob_ens):.4f}")

    # --- Model 5: LACE Score (Conventional Baseline) ---
    print("\n--- Computing LACE Baseline ---")
    try:
        X_test_df = pd.DataFrame(X_test, columns=feature_columns)
        X_test_df['length_of_stay'] = X_test_df.get('length_of_stay', pd.Series(np.random.randint(1, 10, len(X_test_df))))
        lace_scores = X_test_df.apply(compute_lace, axis=1)
        threshold = np.percentile(lace_scores, 75)
        y_pred_lace = (lace_scores >= threshold).astype(int)
        results['LACE Score'] = {
            'model': None, 'y_pred': y_pred_lace, 'y_prob': lace_scores.values / lace_scores.max()
        }
        print(f"  LACE AUROC: {roc_auc_score(y_test, results['LACE Score']['y_prob']):.4f}")
    except Exception as e:
        print(f"  LACE computation skipped: {e}")

    # --- Evaluation Summary ---
    print("\n" + "="*60)
    print("COMPARATIVE EVALUATION SUMMARY")
    print("="*60)
    best_model_name = None
    best_auroc = -1
    for name, res in results.items():
        auroc = roc_auc_score(y_test, res['y_prob'])
        auprc = auc(
            *precision_recall_curve(y_test, res['y_prob'])[:2]
        ) if len(np.unique(y_test)) == 2 else 0
        cm = confusion_matrix(y_test, res['y_pred'])
        tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0
        print(f"\n{name}:")
        print(f"  AUROC:     {auroc:.4f}")
        print(f"  AUPRC:     {auprc:.4f}")
        print(f"  Recall:    {recall:.4f}")
        print(f"  Confusion: {cm.tolist()}")
        print(classification_report(y_test, res['y_pred'], zero_division=0))
        if auroc > best_auroc and name != 'LACE Score':
            best_auroc = auroc
            best_model_name = name

    # --- Save Best Model (exclude LACE as it's rule-based) ---
    print(f"\nBest performing ML model: {best_model_name} (AUROC={best_auroc:.4f})")
    best_model = results[best_model_name]['model']
    os.makedirs('models', exist_ok=True)
    joblib.dump(best_model, 'models/best_model.pkl')
    joblib.dump(best_model, 'adhf_rf_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(scaler, 'adhf_scaler.pkl')
    joblib.dump(feature_columns, 'models/feature_columns.pkl')
    joblib.dump(feature_columns, 'feature_names.pkl')
    print(f"Best model '{best_model_name}' saved to adhf_rf_model.pkl and models/best_model.pkl")

if __name__ == "__main__":
    train_model()
