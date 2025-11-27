import pickle
import json
import numpy as np
from sklearn.decomposition import PCA
import os

# --- Paths ---
VIT_PATH = '/home/maria/Documents/HuggingMouseData/MouseViTEmbeddings/google_vit-base-patch16-224_embeddings_logits.pkl'
IMAGE_DIR = '/home/maria/D3JSHeaven/ThesisVisualizationPrototypes/data_dev'
OUTPUT_JSON = os.path.join(IMAGE_DIR, "vit_pca.json")

# --- 1. Load ViT logits ---
print("🔹 Loading ViT logits...")
with open(VIT_PATH, "rb") as f:
    data = pickle.load(f)

# You probably have: data['natural_scenes'] or similar
logits = np.array(data['natural_scenes'])   # shape: (118, 1000)
N, D = logits.shape
print(f"Loaded logits shape: {logits.shape}")

# --- 2. Run PCA on logits ---
print("🔹 Running PCA...")
pca = PCA(n_components=3)
pcs = pca.fit_transform(logits)  # shape (118, 3)

eigenvectors = pca.components_       # shape (3, 1000)
eigenvalues  = pca.explained_variance_

print("PCA components shape:", eigenvectors.shape)

# --- 3. Compute eigenlogit curves (v_j * sqrt(lambda)) ---
eigenlogits = (eigenvectors.T * np.sqrt(eigenvalues)).T

# --- 4. Map each image filename to its logits & PCs ---
records = []

for i in range(N):
    img_name = f"scene_{i:03d}.png"  # matches your folder!
    img_path = os.path.join(IMAGE_DIR, img_name)

    if not os.path.exists(img_path):
        print(f"⚠ Missing image: {img_path}")

    record = {
        "id": i,
        "image": img_name,
        "logits": logits[i].tolist(),
        "pc": pcs[i].tolist(),       # [PC1, PC2, PC3]
    }
    records.append(record)

# --- 5. Final JSON package ---
output = {
    "images": records,
    "eigenlogits": eigenlogits.tolist(),   # shape (3, 1000)
    "eigenvectors": eigenvectors.tolist(),
    "eigenvalues": eigenvalues.tolist()
}

print("🔹 Saving JSON:", OUTPUT_JSON)
with open(OUTPUT_JSON, "w") as f:
    json.dump(output, f, indent=2)

print("✅ Done. Ready for D3!")
