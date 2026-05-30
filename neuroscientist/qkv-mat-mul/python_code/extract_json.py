# extract_vit_goblins.py

import json
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from transformers import ViTImageProcessor, ViTModel


IMAGE_PATH = Path("bear.png")
OUT_PATH = Path("bear_vit_goblins.json")

MODEL_NAME = "google/vit-base-patch16-224"
LAYER_INDEX = 0
MAX_WAVEFORM_DIMS = 768


def to_serializable_vector(x, max_dims=128):
    """
    Convert a tensor/vector to a small JSON-friendly list.
    For visualization we keep the first max_dims dimensions.
    """
    x = x.detach().cpu().float().numpy()
    x = x[:max_dims]
    return [float(v) for v in x]


def normalize_for_display(x):
    """
    Optional: z-score a vector so waveforms are visually comparable.
    This is useful for D3 plotting.
    """
    x = np.asarray(x, dtype=np.float32)
    std = x.std()
    if std < 1e-8:
        return x.tolist()
    return ((x - x.mean()) / std).tolist()


def main():
    device = "cuda" if torch.cuda.is_available() else "cpu"

    processor = ViTImageProcessor.from_pretrained(MODEL_NAME)
    model = ViTModel.from_pretrained(MODEL_NAME, output_attentions=True)
    model.to(device)
    model.eval()

    image = Image.open(IMAGE_PATH).convert("RGB")

    inputs = processor(images=image, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(device)

    # Shape: [batch, channels, height, width], usually [1, 3, 224, 224]
    _, channels, height, width = pixel_values.shape

    with torch.no_grad():
        # ------------------------------------------------------------------
        # 1. Raw patch vectors, before patch projection
        # ------------------------------------------------------------------
        patch_size = model.config.patch_size
        grid_h = height // patch_size
        grid_w = width // patch_size

        # [1, 3, 224, 224] -> [1, 3, 14, 16, 14, 16]
        patches = pixel_values.unfold(2, patch_size, patch_size).unfold(
            3, patch_size, patch_size
        )

        # [1, 3, 14, 14, 16, 16]
        patches = patches.permute(0, 2, 3, 1, 4, 5).contiguous()

        # [1, 196, 3*16*16]
        raw_patch_vectors = patches.view(1, grid_h * grid_w, -1)

        # ------------------------------------------------------------------
        # 2. ViT embeddings
        # ------------------------------------------------------------------
        # Hugging Face ViTEmbeddings:
        # patch embeddings + class token + position embeddings
        embeddings = model.embeddings(pixel_values)

        # embeddings shape: [1, 197, 768]
        # token 0 is CLS, tokens 1: are image patches
        patch_embeddings = embeddings[:, 1:, :]

        # ------------------------------------------------------------------
        # 3. First layer Q, K, V
        # ------------------------------------------------------------------
        layer = model.encoder.layer[LAYER_INDEX]
        attention = layer.attention.attention

        # ViT uses separate linear layers for query, key, value
        q_all = attention.query(embeddings)
        k_all = attention.key(embeddings)
        v_all = attention.value(embeddings)

        # Remove CLS token
        q_patches = q_all[:, 1:, :]
        k_patches = k_all[:, 1:, :]
        v_patches = v_all[:, 1:, :]

        # ------------------------------------------------------------------
        # 4. Also get attention maps from model forward
        # ------------------------------------------------------------------
        outputs = model(pixel_values)

        # attentions[layer] shape:
        # [batch, num_heads, tokens, tokens]
        attn = outputs.attentions[LAYER_INDEX][0]

        # For each patch token, attention to all patch tokens.
        # Remove CLS from both query and key axes.
        patch_to_patch_attn = attn[:, 1:, 1:]  # [heads, 196, 196]

        # Average heads for MVP
        mean_patch_attn = patch_to_patch_attn.mean(dim=0)  # [196, 196]

    patches_json = []

    for idx in range(grid_h * grid_w):
        row = idx // grid_w
        col = idx % grid_w

        raw = to_serializable_vector(raw_patch_vectors[0, idx], MAX_WAVEFORM_DIMS)
        emb = to_serializable_vector(patch_embeddings[0, idx], MAX_WAVEFORM_DIMS)
        q = to_serializable_vector(q_patches[0, idx], MAX_WAVEFORM_DIMS)
        k = to_serializable_vector(k_patches[0, idx], MAX_WAVEFORM_DIMS)
        v = to_serializable_vector(v_patches[0, idx], MAX_WAVEFORM_DIMS)

        # Attention from this patch to every other patch, as 14x14 heatmap.
        attn_vec = mean_patch_attn[idx].detach().cpu().float().numpy()
        attn_grid = attn_vec.reshape(grid_h, grid_w)

        patches_json.append(
            {
                "index": idx,
                "row": row,
                "col": col,
                "x": col * patch_size,
                "y": row * patch_size,
                "raw_waveform": normalize_for_display(raw),
                "embedding": normalize_for_display(emb),
                "q": normalize_for_display(q),
                "k": normalize_for_display(k),
                "v": normalize_for_display(v),
                "attention_grid": attn_grid.tolist(),
            }
        )

    data = {
        "model_name": MODEL_NAME,
        "layer_index": LAYER_INDEX,
        "image_width": int(width),
        "image_height": int(height),
        "patch_size": int(patch_size),
        "grid_height": int(grid_h),
        "grid_width": int(grid_w),
        "waveform_dims": int(MAX_WAVEFORM_DIMS),
        "patches": patches_json,
    }

    OUT_PATH.write_text(json.dumps(data, indent=2))
    print(f"Wrote {OUT_PATH.resolve()}")
    print(f"Extracted {len(patches_json)} patch goblins.")


if __name__ == "__main__":
    main()