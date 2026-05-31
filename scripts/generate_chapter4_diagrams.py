import os
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

BASE_DIR = r"C:\Users\Takunda Mundwa\Desktop\School Projects\Shania"
OUT_DIR = os.path.join(BASE_DIR, "figures", "chapter4")
os.makedirs(OUT_DIR, exist_ok=True)


def add_box(ax, xy, w, h, text, fc="#e8f1fa", ec="#2d5f8b", fs=10):
    box = FancyBboxPatch(
        xy,
        w,
        h,
        boxstyle="round,pad=0.02,rounding_size=0.03",
        linewidth=1.6,
        edgecolor=ec,
        facecolor=fc,
    )
    ax.add_patch(box)
    ax.text(xy[0] + w / 2, xy[1] + h / 2, text, ha="center", va="center", fontsize=fs)


def add_arrow(ax, start, end):
    arr = FancyArrowPatch(start, end, arrowstyle="->", mutation_scale=16, linewidth=1.6, color="#1f2937")
    ax.add_patch(arr)


def fig_overall_architecture(path):
    fig, ax = plt.subplots(figsize=(14, 6))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    add_box(ax, (0.04, 0.35), 0.18, 0.28, "Data Ingestion\nMIMIC-III + eICU\nADHF Cohort")
    add_box(ax, (0.28, 0.35), 0.18, 0.28, "Preprocessing\nImputation\nEncoding + Scaling\nSMOTE")
    add_box(ax, (0.52, 0.35), 0.18, 0.28, "Predictive Engine\nLogReg | RF | XGBoost\nLACE Baseline")
    add_box(ax, (0.76, 0.35), 0.18, 0.28, "XAI + Output\nSHAP Global/Local\nRisk + Explanation")

    add_arrow(ax, (0.22, 0.49), (0.28, 0.49))
    add_arrow(ax, (0.46, 0.49), (0.52, 0.49))
    add_arrow(ax, (0.70, 0.49), (0.76, 0.49))

    ax.text(0.5, 0.92, "Overall System Architecture for ADHF 30-Day Readmission Prediction", ha="center", fontsize=14, fontweight="bold")
    ax.text(0.5, 0.10, "Figure 4.1: End-to-end architecture from data ingestion to interpretable clinical output", ha="center", fontsize=10)

    plt.tight_layout()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def fig_model_design(path):
    fig, ax = plt.subplots(figsize=(14, 7))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    add_box(ax, (0.05, 0.68), 0.22, 0.2, "Input Feature Vector\nDemographics\nVitals\nBiomarkers\nComorbidities", fc="#f7f3e8", ec="#8b6d2d")
    add_box(ax, (0.38, 0.68), 0.22, 0.2, "Random Forest Core\nBootstrap Sampling\nDecision Tree Ensemble\nProbability Averaging", fc="#e8f7ef", ec="#2d8b57")
    add_box(ax, (0.71, 0.68), 0.22, 0.2, "Output Node\nP(Readmission=1)\nRisk Class", fc="#fce8e8", ec="#8b2d2d")

    add_arrow(ax, (0.27, 0.78), (0.38, 0.78))
    add_arrow(ax, (0.60, 0.78), (0.71, 0.78))

    add_box(ax, (0.10, 0.28), 0.20, 0.2, "Baseline Comparator\nLACE Score", fc="#edf2ff", ec="#3d4d99")
    add_box(ax, (0.40, 0.28), 0.20, 0.2, "Evaluation Layer\nAUROC | Recall | F1\nConfusion Matrix", fc="#edf2ff", ec="#3d4d99")
    add_box(ax, (0.70, 0.28), 0.20, 0.2, "Interpretability Layer\nSHAP Global/Local\nClinical Plausibility", fc="#edf2ff", ec="#3d4d99")

    add_arrow(ax, (0.82, 0.68), (0.82, 0.48))
    add_arrow(ax, (0.49, 0.68), (0.49, 0.48))
    add_arrow(ax, (0.20, 0.48), (0.40, 0.38))
    add_arrow(ax, (0.60, 0.38), (0.70, 0.38))

    ax.text(0.5, 0.95, "Predictive Model Design and Evaluation Architecture", ha="center", fontsize=14, fontweight="bold")
    ax.text(0.5, 0.08, "Figure 4.2: Internal design of predictive module, comparator baseline, and interpretability path", ha="center", fontsize=10)

    plt.tight_layout()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def fig_xai_flow(path):
    fig, ax = plt.subplots(figsize=(13, 6))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    add_box(ax, (0.05, 0.36), 0.2, 0.26, "Trained Model\n(Random Forest)", fc="#eef7ff", ec="#2d5f8b")
    add_box(ax, (0.32, 0.36), 0.2, 0.26, "SHAP Explainer\nBackground Data\nShapley Computation", fc="#eef7ff", ec="#2d5f8b")
    add_box(ax, (0.59, 0.52), 0.16, 0.2, "Global Output\nSummary Plot\nFeature Ranking", fc="#eafaf1", ec="#2d8b57")
    add_box(ax, (0.59, 0.20), 0.16, 0.2, "Local Output\nForce/Waterfall\nPatient-level Insight", fc="#fff4ea", ec="#a35f1f")
    add_box(ax, (0.80, 0.36), 0.15, 0.26, "Clinical Interpretation\nActionable Risk Factors", fc="#fceef7", ec="#8b2d6b")

    add_arrow(ax, (0.25, 0.49), (0.32, 0.49))
    add_arrow(ax, (0.52, 0.49), (0.59, 0.62))
    add_arrow(ax, (0.52, 0.49), (0.59, 0.30))
    add_arrow(ax, (0.75, 0.62), (0.80, 0.49))
    add_arrow(ax, (0.75, 0.30), (0.80, 0.49))

    ax.text(0.5, 0.92, "Explainable AI Integration Flow (SHAP)", ha="center", fontsize=14, fontweight="bold")
    ax.text(0.5, 0.08, "Figure 4.3: SHAP-based mechanism from trained model to clinical interpretation", ha="center", fontsize=10)

    plt.tight_layout()
    plt.savefig(path, dpi=300, bbox_inches="tight")
    plt.close(fig)


def main():
    p1 = os.path.join(OUT_DIR, "figure_4_1_overall_architecture.png")
    p2 = os.path.join(OUT_DIR, "figure_4_2_model_design.png")
    p3 = os.path.join(OUT_DIR, "figure_4_3_xai_flow.png")

    fig_overall_architecture(p1)
    fig_model_design(p2)
    fig_xai_flow(p3)

    print("Generated:")
    print(p1)
    print(p2)
    print(p3)


if __name__ == "__main__":
    main()
