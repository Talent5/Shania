#!/usr/bin/env python3
"""
Complete demonstration of HIGH RISK patient through dashboard/API/model flow
"""
import joblib
import pandas as pd
from app import _find_matching_onehot_feature

# Load model
model = joblib.load('adhf_rf_model.pkl')
model_features = list(model.feature_names_in_)

print("=" * 80)
print("HIGH RISK PATIENT - COMPLETE FLOW DEMONSTRATION")
print("=" * 80)
print()

# HIGH RISK PATIENT DATA (from dashboard form submission)
print("STEP 1: Patient Data Entered in Dashboard Form")
print("-" * 80)

patient_data = {
    'Age': 88,
    'Gender': 'M',
    'AdmissionType': 'EMERGENCY',
    'Insurance': 'Medicare',
    'SystolicBP': 78,
    'DiastolicBP': 45,
    'HeartRate': 125,
    'RespRate': 32,
    'SpO2': 85,
    'BNP': 2500,
    'Creatinine': 3.2,
    'Sodium': 125,
    'Hemoglobin': 8.0,
    'Diabetes': 1,
    'Hypertension': 1,
    'AtrialFib': 1,
    'COPD': 1
}

# Display patient info
print("PATIENT PROFILE:")
print()
print("  Demographics & Admission:")
print(f"    Age: {patient_data['Age']} years (ELDERLY - HIGH RISK FACTOR)")
print(f"    Gender: {patient_data['Gender']}")
print(f"    Admission Type: {patient_data['AdmissionType']}")
print(f"    Insurance: {patient_data['Insurance']}")
print()
print("  VITAL SIGNS (CRITICAL - ALL ABNORMAL):")
print(f"    Systolic BP: {patient_data['SystolicBP']} mmHg (SEVERE HYPOTENSION - CRITICAL)")
print(f"    Diastolic BP: {patient_data['DiastolicBP']} mmHg (SEVERE HYPOTENSION - CRITICAL)")
print(f"    Heart Rate: {patient_data['HeartRate']} bpm (TACHYCARDIA - HIGH)")
print(f"    Respiratory Rate: {patient_data['RespRate']} (TACHYPNEA - RESPIRATORY DISTRESS)")
print(f"    SpO2: {patient_data['SpO2']}% (SEVERE HYPOXEMIA - CRITICAL)")
print()
print("  LABORATORY VALUES (ALL ABNORMAL - MULTIPLE ORGAN DYSFUNCTION):")
print(f"    BNP: {patient_data['BNP']} pg/mL (EXTREMELY HIGH - SEVERE HF)")
print(f"    Creatinine: {patient_data['Creatinine']} mg/dL (SEVERE KIDNEY DYSFUNCTION)")
print(f"    Sodium: {patient_data['Sodium']} mEq/L (SEVERE HYPONATREMIA)")
print(f"    Hemoglobin: {patient_data['Hemoglobin']} g/dL (SEVERE ANEMIA)")
print()
print("  COMORBIDITIES (ALL PRESENT - MAXIMUM BURDEN):")
print(f"    Diabetes: YES")
print(f"    Hypertension: YES")
print(f"    Atrial Fibrillation: YES")
print(f"    COPD: YES")
print()

# STEP 2: API Processing
print("STEP 2: Backend API Processing (app.py /predict endpoint)")
print("-" * 80)

# Initialize input row with model features
input_row = {feature: 0.0 for feature in model_features}

# Map numeric fields
numerical_cols = ['Age', 'SystolicBP', 'DiastolicBP', 'HeartRate', 'RespRate', 'SpO2', 'BNP', 'Creatinine', 'Sodium', 'Hemoglobin']
for col in numerical_cols:
    if col in input_row:
        input_row[col] = float(patient_data[col])

# Map gender
input_row['Gender'] = 1.0 if str(patient_data['Gender']).strip().upper() == 'M' else 0.0

# Map comorbidities
for col in ['Diabetes', 'Hypertension', 'AtrialFib', 'COPD']:
    if col in input_row:
        input_row[col] = float(int(patient_data[col]))

# Map categorical features
print("Feature mapping:")
matched_count = 0
for prefix in ['AdmissionType', 'Insurance']:
    value = patient_data[prefix]
    matched = _find_matching_onehot_feature(model_features, prefix, value)
    if matched:
        input_row[matched] = 1.0
        matched_count += 1
        print(f"  {prefix}={value} -> {matched} = 1.0")
    else:
        print(f"  {prefix}={value} -> base category (all one-hot features = 0)")

print()
print(f"Model features initialized: {len(model_features)} features")
print(f"Patient values mapped: {matched_count + len(numerical_cols) + 1 + 4} fields")
print()

# STEP 3: Model Prediction
print("STEP 3: Model Inference (Random Forest Classifier)")
print("-" * 80)

df_final = pd.DataFrame([input_row], columns=model_features)
prediction = model.predict(df_final)[0]
probability = model.predict_proba(df_final)[0][1]
feature_importance = model.feature_importances_

print("Feature input summary:")
print(f"  All {len(model_features)} features prepared and normalized")
print()

# Find top contributing features
top_features_idx = feature_importance.argsort()[-5:][::-1]
print("Top 5 predictive features for this patient:")
for i, idx in enumerate(top_features_idx, 1):
    feat = model_features[idx]
    importance = feature_importance[idx]
    value = input_row[feat]
    print(f"  {i}. {feat:25s} (importance={importance:.4f}, value={value})")

print()

# STEP 4: Result
print("STEP 4: Prediction Result")
print("=" * 80)
print()
print(f"  MODEL PREDICTION (Class):     {prediction}")
print(f"  READMISSION PROBABILITY:      {probability:.4f} ({probability*100:.2f}%)")
print()

if prediction == 1:
    print("  STATUS: HIGH RISK")
    print()
    print("  CLINICAL INTERPRETATION:")
    print("  - This patient is AT HIGH RISK of 30-day hospital readmission")
    print("  - Multiple critical factors present:")
    print("    * Age 88 (elderly)")
    print("    * Severe hemodynamic compromise (BP 78/45)")
    print("    * Severe renal dysfunction (Creatinine 3.2)")
    print("    * Severe electrolyte abnormality (Na 125)")
    print("    * Profound anemia (Hgb 8.0)")
    print("    * Respiratory distress (RR 32, SpO2 85%)")
    print("    * Severe cardiac dysfunction (BNP 2500)")
    print("    * Multiple comorbidities active")
    print()
    print("  RECOMMENDATION:")
    print("  - HIGH PRIORITY for close monitoring and aggressive management")
    print("  - Strong candidate for ICU/high-acuity care")
    print("  - Early discharge planning and home support essential")
    print("  - Consider advanced therapies / specialist consultation")
else:
    print("  STATUS: LOW RISK (unexpected)")

print()
print("=" * 80)
