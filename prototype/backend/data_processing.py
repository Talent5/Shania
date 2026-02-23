import pandas as pd
import numpy as np
from sklearn.impute import KNNImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
import pickle
import os

# --- Data Generation (Simulation of MIMIC-III Demo) ---
def generate_dummy_data(n_samples=500, output_path='data/raw_data.csv'):
    """Generates synthetic data mimicking the MIMIC-III demo ADHF dataset."""
    np.random.seed(42)
    
    # Features
    age = np.random.randint(18, 95, n_samples)
    gender = np.random.choice(['M', 'F'], n_samples)
    heart_rate = np.random.normal(85, 15, n_samples)
    systolic_bp = np.random.normal(120, 20, n_samples)
    diastolic_bp = np.random.normal(80, 10, n_samples)
    bnp_level = np.random.pareto(a=2, size=n_samples) * 100 + 100  # Skewed distribution
    congestion_signs = np.random.choice([0, 1], n_samples, p=[0.4, 0.6])
    comorbidities_diabetes = np.random.choice([0, 1], n_samples, p=[0.7, 0.3])
    
    # Target (Readmission within 30 days)
    # create logical relationship for target to make model learnable
    prob_readmission = (
        (age > 75) * 0.2 + 
        (bnp_level > 500) * 0.3 + 
        (congestion_signs == 1) * 0.2 +
        (comorbidities_diabetes == 1) * 0.1 +
        np.random.normal(0, 0.1, n_samples)
    )
    prob_readmission = (prob_readmission - prob_readmission.min()) / (prob_readmission.max() - prob_readmission.min())
    readmission_30d = (prob_readmission > 0.6).astype(int)

    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'heart_rate': heart_rate,
        'systolic_bp': systolic_bp,
        'diastolic_bp': diastolic_bp,
        'bnp_level': bnp_level,
        'congestion_signs': congestion_signs,
        'comorbidities_diabetes': comorbidities_diabetes,
        'readmission_30d': readmission_30d
    })

    # Introduce some missing values
    df.loc[np.random.choice(df.index, int(n_samples * 0.1)), 'heart_rate'] = np.nan
    df.loc[np.random.choice(df.index, int(n_samples * 0.05)), 'bnp_level'] = np.nan

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated dummy data at {output_path}")
    return df

# --- Preprocessing Pipeline ---
def preprocess_data(input_path='data/raw_data.csv'):
    if not os.path.exists(input_path):
        print("Data file not found. Generating dummy data...")
        df = generate_dummy_data(output_path=input_path)
    else:
        df = pd.read_csv(input_path)

    # 1. Handling Missing Values (KNN Imputation)
    print("Handling missing values...")
    numerical_cols = ['age', 'heart_rate', 'systolic_bp', 'diastolic_bp', 'bnp_level']
    categorical_cols = ['gender', 'congestion_signs', 'comorbidities_diabetes'] # congestion_signs is binary/categorical

    # Separate categorical for mode imputation
    for col in categorical_cols:
         if col in df.columns and df[col].isnull().sum() > 0:
            df[col].fillna(df[col].mode()[0], inplace=True)

    # KNN Imputer for numerical
    imputer = KNNImputer(n_neighbors=5)
    df[numerical_cols] = imputer.fit_transform(df[numerical_cols])

    # 2. Outlier Handling (IQR Method)
    print("Handling outliers...")
    for col in numerical_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - 1.5 * IQR
        upper_bound = Q3 + 1.5 * IQR
        # Cap outliers
        df[col] = np.where(df[col] < lower_bound, lower_bound, df[col])
        df[col] = np.where(df[col] > upper_bound, upper_bound, df[col])

    # 3. Encoding Categorical Variables
    print("Encoding categorical variables...")
    # Using pd.get_dummies for simplicity in this prototype, 
    # but for production pipeline OneHotEncoder is better to handle unknown categories
    df = pd.get_dummies(df, columns=['gender'], drop_first=True) # drop_first to avoid multicollinearity
    
    # 4. Feature Selection/Preparation
    X = df.drop('readmission_30d', axis=1)
    y = df['readmission_30d']

    # 5. Class Imbalance Handling (SMOTE)
    print(f"Original class distribution: {y.value_counts().to_dict()}")
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X, y)
    print(f"Resampled class distribution: {y_resampled.value_counts().to_dict()}")

    # 6. Normalization (StandardScaler)
    print("Normalizing features...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_resampled)
    X_scaled_df = pd.DataFrame(X_scaled, columns=X.columns) # Keep column names

    return X_scaled_df, y_resampled, scaler, X.columns

if __name__ == "__main__":
    preprocess_data()
