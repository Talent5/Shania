import os
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle

BASE_DIR = r"C:\Users\Takunda Mundwa\Desktop\School Projects\Shania"
OUT_DIR = os.path.join(BASE_DIR, "figures", "paper_style_ml")
os.makedirs(OUT_DIR, exist_ok=True)

plt.rcParams.update({
    "font.family": "serif",
    "font.size": 10,
    "axes.linewidth": 0.8,
})


def add_box(ax, x, y, w, h, text, fc="#f7f7f7", ec="#1f2937", lw=1.2, fs=9, rounded=True):
    if rounded:
        patch = FancyBboxPatch(
            (x, y), w, h,
            boxstyle="round,pad=0.015,rounding_size=0.02",
            facecolor=fc, edgecolor=ec, linewidth=lw
        )
    else:
        patch = Rectangle((x, y), w, h, facecolor=fc, edgecolor=ec, linewidth=lw)
    ax.add_patch(patch)
    ax.text(x + w / 2, y + h / 2, text, ha="center", va="center", fontsize=fs)


def add_arrow(ax, x1, y1, x2, y2, lw=1.2):
    arr = FancyArrowPatch((x1, y1), (x2, y2), arrowstyle="->", mutation_scale=12, linewidth=lw, color="#111827")
    ax.add_patch(arr)


def save_figure(fig, name):
    png_path = os.path.join(OUT_DIR, f"{name}.png")
    pdf_path = os.path.join(OUT_DIR, f"{name}.pdf")
    fig.savefig(png_path, dpi=600, bbox_inches="tight")
    fig.savefig(pdf_path, bbox_inches="tight")
    plt.close(fig)


def diagram_transformer_overview():
    fig, ax = plt.subplots(figsize=(12.5, 7.2))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    # Inputs
    add_box(ax, 0.03, 0.73, 0.14, 0.12, "Input\nTokens", fc="#eef2ff")
    add_box(ax, 0.03, 0.55, 0.14, 0.12, "Positional\nEncoding", fc="#eef2ff")

    # Encoder stack
    add_box(ax, 0.23, 0.66, 0.2, 0.23, "Encoder Block × N\nMulti-Head Self-Attention\n+ Feed Forward\n+ Residual + LayerNorm", fc="#ecfeff")
    add_box(ax, 0.23, 0.38, 0.2, 0.18, "Encoder Memory\nContextual\nRepresentations", fc="#ecfeff")

    # Decoder stack
    add_box(ax, 0.53, 0.66, 0.2, 0.23, "Decoder Block × N\nMasked Multi-Head Attention\n+ Cross Attention\n+ Feed Forward", fc="#fff7ed")
    add_box(ax, 0.53, 0.43, 0.2, 0.12, "Shifted Target\nEmbeddings", fc="#fff7ed")

    # Output
    add_box(ax, 0.80, 0.66, 0.16, 0.12, "Linear + Softmax", fc="#fef2f2")
    add_box(ax, 0.80, 0.50, 0.16, 0.12, "Output\nProbabilities", fc="#fef2f2")

    # Arrows
    add_arrow(ax, 0.17, 0.79, 0.23, 0.79)
    add_arrow(ax, 0.17, 0.61, 0.23, 0.73)
    add_arrow(ax, 0.43, 0.75, 0.53, 0.75)
    add_arrow(ax, 0.43, 0.47, 0.53, 0.72)
    add_arrow(ax, 0.73, 0.75, 0.80, 0.72)
    add_arrow(ax, 0.88, 0.66, 0.88, 0.62)
    add_arrow(ax, 0.63, 0.55, 0.63, 0.66)

    ax.text(0.5, 0.95, "Transformer Architecture Overview", ha="center", va="center", fontsize=15, fontweight="bold")
    ax.text(0.5, 0.04, "Figure 4.A: Standard encoder-decoder Transformer architecture used in academic ML literature.", ha="center", fontsize=10)

    save_figure(fig, "figure_4A_transformer_overview")


def diagram_multi_head_attention():
    fig, ax = plt.subplots(figsize=(12, 6.8))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    add_box(ax, 0.04, 0.72, 0.14, 0.12, "Input X", fc="#eef2ff")
    add_box(ax, 0.24, 0.78, 0.14, 0.09, "W_Q", fc="#ecfeff")
    add_box(ax, 0.24, 0.66, 0.14, 0.09, "W_K", fc="#ecfeff")
    add_box(ax, 0.24, 0.54, 0.14, 0.09, "W_V", fc="#ecfeff")

    add_box(ax, 0.44, 0.72, 0.18, 0.12, "Head 1\nAttention(Q,K,V)", fc="#fff7ed")
    add_box(ax, 0.44, 0.54, 0.18, 0.12, "Head 2\nAttention(Q,K,V)", fc="#fff7ed")
    add_box(ax, 0.44, 0.36, 0.18, 0.12, "Head h\nAttention(Q,K,V)", fc="#fff7ed")

    add_box(ax, 0.68, 0.54, 0.16, 0.16, "Concatenate", fc="#f3f4f6")
    add_box(ax, 0.86, 0.54, 0.10, 0.16, "W_O", fc="#fef2f2")

    add_arrow(ax, 0.18, 0.78, 0.24, 0.82)
    add_arrow(ax, 0.18, 0.78, 0.24, 0.70)
    add_arrow(ax, 0.18, 0.78, 0.24, 0.58)

    add_arrow(ax, 0.38, 0.82, 0.44, 0.78)
    add_arrow(ax, 0.38, 0.70, 0.44, 0.60)
    add_arrow(ax, 0.38, 0.58, 0.44, 0.42)

    add_arrow(ax, 0.62, 0.78, 0.68, 0.66)
    add_arrow(ax, 0.62, 0.60, 0.68, 0.62)
    add_arrow(ax, 0.62, 0.42, 0.68, 0.58)

    add_arrow(ax, 0.84, 0.62, 0.86, 0.62)

    ax.text(0.5, 0.95, "Multi-Head Attention Block", ha="center", fontsize=15, fontweight="bold")
    ax.text(0.5, 0.06, "Figure 4.B: Academic-style decomposition of multi-head attention with linear projections and output projection.", ha="center", fontsize=10)

    ax.text(0.5, 0.21, r"Attention(Q,K,V) = softmax((QK$^T$/sqrt(d$_k$)))V", ha="center", fontsize=12)

    save_figure(fig, "figure_4B_multi_head_attention")


def diagram_transformer_encoder_block():
    fig, ax = plt.subplots(figsize=(11, 7))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    add_box(ax, 0.1, 0.80, 0.22, 0.09, "Input Embedding", fc="#eef2ff")
    add_box(ax, 0.39, 0.80, 0.22, 0.09, "Multi-Head Self-Attention", fc="#ecfeff")
    add_box(ax, 0.68, 0.80, 0.22, 0.09, "Add + LayerNorm", fc="#f3f4f6")

    add_box(ax, 0.39, 0.58, 0.22, 0.09, "Feed-Forward Network", fc="#fff7ed")
    add_box(ax, 0.68, 0.58, 0.22, 0.09, "Add + LayerNorm", fc="#f3f4f6")
    add_box(ax, 0.68, 0.36, 0.22, 0.09, "Output Representation", fc="#fef2f2")

    add_arrow(ax, 0.32, 0.845, 0.39, 0.845)
    add_arrow(ax, 0.61, 0.845, 0.68, 0.845)
    add_arrow(ax, 0.79, 0.80, 0.50, 0.67)
    add_arrow(ax, 0.61, 0.625, 0.68, 0.625)
    add_arrow(ax, 0.79, 0.58, 0.79, 0.45)

    # Residual skip guides
    ax.plot([0.21, 0.21, 0.70], [0.80, 0.72, 0.72], color="#374151", linewidth=1.0, linestyle="--")
    ax.plot([0.79, 0.79, 0.70], [0.58, 0.50, 0.50], color="#374151", linewidth=1.0, linestyle="--")
    ax.text(0.235, 0.725, "Residual", fontsize=8)
    ax.text(0.735, 0.505, "Residual", fontsize=8)

    ax.text(0.5, 0.95, "Transformer Encoder Block (One Layer)", ha="center", fontsize=15, fontweight="bold")
    ax.text(0.5, 0.06, "Figure 4.C: Canonical encoder layer with self-attention, feed-forward network, residual connections, and normalization.", ha="center", fontsize=10)

    save_figure(fig, "figure_4C_transformer_encoder_block")


def diagram_training_flow():
    fig, ax = plt.subplots(figsize=(13, 6.5))
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    stages = [
        (0.03, "Dataset\nPreparation", "#eef2ff"),
        (0.20, "Tokenization\n/ Feature\nEncoding", "#ecfeff"),
        (0.37, "Model\nForward Pass", "#fff7ed"),
        (0.54, "Loss\nComputation", "#fef2f2"),
        (0.71, "Backpropagation\n+ Optimization", "#f3f4f6"),
        (0.88, "Validation\nMetrics", "#eef2ff"),
    ]

    for x, txt, c in stages:
        add_box(ax, x, 0.42, 0.11, 0.2, txt, fc=c, fs=8.5)

    for i in range(len(stages) - 1):
        add_arrow(ax, stages[i][0] + 0.11, 0.52, stages[i + 1][0], 0.52)

    # Feedback loop
    ax.plot([0.935, 0.935, 0.595], [0.42, 0.25, 0.25], color="#111827", linewidth=1.1)
    add_arrow(ax, 0.595, 0.25, 0.595, 0.42)
    ax.text(0.76, 0.27, "Epoch-wise optimization loop", fontsize=9)

    ax.text(0.5, 0.92, "Training and Evaluation Workflow", ha="center", fontsize=15, fontweight="bold")
    ax.text(0.5, 0.08, "Figure 4.D: Standard model training lifecycle used in academic machine learning experimentation.", ha="center", fontsize=10)

    save_figure(fig, "figure_4D_training_workflow")


def main():
    diagram_transformer_overview()
    diagram_multi_head_attention()
    diagram_transformer_encoder_block()
    diagram_training_flow()

    print("Generated academic diagrams in:")
    print(OUT_DIR)


if __name__ == "__main__":
    main()
