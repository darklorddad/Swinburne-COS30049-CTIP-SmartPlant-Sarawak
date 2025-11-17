# retrain_incremental.py
import config
import os
import shutil
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from utils import MultiHeadResNet18, train_and_validate,generate_reference_embeddings,save_versioned_model,SingleImageDataset
import firebase_admin
from firebase_admin import credentials, storage, firestore
import torch
from sklearn.metrics import accuracy_score, classification_report
import numpy as np
import torch.nn.functional as F
import shutil
import random
from math import ceil


#print(f"Current best model path: {config.MODEL_PATH}")
#print(f"Current best EMBEDDING path: {config.EMBEDDING_PATH}")
# -----------------------------
# Firebase initialization
# -----------------------------
SERVICE_ACCOUNT_PATH = "smartplantsarawak-firebase-adminsdk-fbsvc-aee0d5a952.json"
BUCKET_NAME = "smartplantsarawak.firebasestorage.app"

if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred, {"storageBucket": BUCKET_NAME})

bucket = storage.bucket()
db = firestore.client()

# -----------------------------
# Local paths
# -----------------------------
LOCAL_FIREBASE_DIR = "./firebase_downloaded_data"
BASE_DATASET_DIR = "./base_Dataset/plant_species"
MERGED_DATASET_DIR = "./merged_dataset"
TRAIN_DIR = os.path.join(MERGED_DATASET_DIR, "train")
VAL_DIR = os.path.join(MERGED_DATASET_DIR, "val")

# -----------------------------
#Download new images from Firebase Storage
# -----------------------------
def download_new_verified_images(prefix="plant_images/verified/"):
    if os.path.exists(LOCAL_FIREBASE_DIR):
        shutil.rmtree(LOCAL_FIREBASE_DIR)
    os.makedirs(LOCAL_FIREBASE_DIR, exist_ok=True)

    blobs = bucket.list_blobs(prefix=prefix)
    for blob in blobs:
        if blob.name.endswith("/"):
            continue  # skip directories

        parts = blob.name.split("/")
        # Skip any files not in expected class subfolder
        if len(parts) < 3:
            continue

        # Take the last two parts: class folder + filename
        class_name = parts[-2]
        filename = parts[-1]

        class_dir = os.path.join(LOCAL_FIREBASE_DIR, class_name)
        os.makedirs(class_dir, exist_ok=True)

        local_path = os.path.join(class_dir, filename)
        blob.download_to_filename(local_path)

    print(f"Downloaded new images from Firebase into {LOCAL_FIREBASE_DIR}")


def merge_and_split_datasets(train_ratio=0.8, min_val_per_class=1, seed=42):
    """
    Merges BASE_DATASET_DIR and LOCAL_FIREBASE_DIR into a unified dataset,
    shuffles samples, and splits into train/val sets.

    Args:
        train_ratio (float): proportion of images for training
        min_val_per_class (int): minimum validation images per class
        seed (int): random seed for reproducibility
    """
    random.seed(seed)

    # --- Clean previous merged dataset ---
    if os.path.exists(MERGED_DATASET_DIR):
        shutil.rmtree(MERGED_DATASET_DIR)
    os.makedirs(TRAIN_DIR)
    os.makedirs(VAL_DIR)

    all_classes = sorted(os.listdir(BASE_DATASET_DIR))

    for cls in all_classes:
        # --- Collect all images from both sources ---
        base_cls_dir = os.path.join(BASE_DATASET_DIR, cls)
        base_images = [os.path.join(base_cls_dir, f)
                       for f in os.listdir(base_cls_dir)
                       if f.lower().endswith(("png", "jpg", "jpeg"))]

        fb_cls_dir = os.path.join(LOCAL_FIREBASE_DIR, cls)
        fb_images = []
        if os.path.exists(fb_cls_dir):
            fb_images = [os.path.join(fb_cls_dir, f)
                         for f in os.listdir(fb_cls_dir)
                         if f.lower().endswith(("png", "jpg", "jpeg"))]

        all_images = base_images + fb_images

        # --- Skip empty classes ---
        if not all_images:
            print(f"No images found for class '{cls}', skipping.")
            continue

        # --- Shuffle to avoid bias ---
        random.shuffle(all_images)

        # --- Compute split sizes safely ---
        num_total = len(all_images)
        num_train = int(num_total * train_ratio)
        num_val = num_total - num_train

        # Guarantee minimum validation samples
        if num_val < min_val_per_class and num_total > min_val_per_class:
            num_val = min_val_per_class
            num_train = num_total - num_val

        # --- Create class folders ---
        train_cls_dir = os.path.join(TRAIN_DIR, cls)
        val_cls_dir = os.path.join(VAL_DIR, cls)
        os.makedirs(train_cls_dir, exist_ok=True)
        os.makedirs(val_cls_dir, exist_ok=True)

        # --- Split and copy ---
        for i, img_path in enumerate(all_images):
            dest_dir = train_cls_dir if i < num_train else val_cls_dir
            shutil.copy(img_path, dest_dir)

        print(f" Class '{cls}': {num_train} train / {num_total - num_train} val images")

    print(f" Merged and split dataset saved under:\n  Train: {TRAIN_DIR}\n  Val: {VAL_DIR}")

def evaluate_embeddings(model, test_loader, device):
    model.eval()
    embeddings, labels = [], []

    with torch.no_grad():
        for imgs, lbls in test_loader:
            imgs = imgs.to(device)
            embs, _ = model(imgs)
            embeddings.append(embs.cpu())
            labels.append(lbls)

    embeddings = torch.cat(embeddings)
    labels = torch.cat(labels)

    # Compute cosine similarity matrix
    cos_sim = F.cosine_similarity(embeddings.unsqueeze(1), embeddings.unsqueeze(0), dim=-1)

    correct, total = 0, 0
    for i in range(len(labels)):
        # exclude self-similarity
        cos_sim[i, i] = -1
        pred = torch.argmax(cos_sim[i])
        if labels[pred] == labels[i]:
            correct += 1
        total += 1

    acc = correct / total
    print(f"Embedding Retrieval Accuracy (cosine match): {acc * 100:.2f}%")
    return acc

def evaluate_classification(model, test_loader, device):
    model.eval()
    all_preds, all_labels = [], []

    with torch.no_grad():
        for imgs, labels in test_loader:
            imgs, labels = imgs.to(device), labels.to(device)
            _, logits = model(imgs)
            preds = torch.argmax(logits, dim=1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    acc = accuracy_score(all_labels, all_preds)
    print(f" Classification Accuracy: {acc * 100:.2f}%")
    # print("\nClassification Report:")
    # print(classification_report(all_labels, all_preds, digits=4))
    return acc

def evaluate_model(model_ckpt_path, val_dir):
    transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                [0.229, 0.224, 0.225])
        ])
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MultiHeadResNet18(num_classes=12, embedding_dim=128, plantnet_ckpt=config.PLANTNET_PRETRAINED_MODEL)
    checkpoint=torch.load(model_ckpt_path, map_location=device)
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)

    test_dataset = SingleImageDataset(val_dir, transform=transform)
    test_loader = DataLoader(test_dataset, batch_size=64, shuffle=False, num_workers=4)

    # Run both evaluations
    classifier_acc = evaluate_classification(model, test_loader, device)
    embedding_acc= evaluate_embeddings(model, test_loader, device)
    return classifier_acc, embedding_acc


if __name__ == "__main__":
    DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    #download_new_verified_images()
    #merge_and_split_datasets()

    #current_cls_acc, current_emb_acc = evaluate_model(config.MODEL_PATH, VAL_DIR)

    new_model = train_and_validate(
        train_root=TRAIN_DIR,
        val_root=VAL_DIR,
        num_classes=len(os.listdir(TRAIN_DIR)),
        num_epochs=1,
        batch_size=16,
        freeze_backbone=False
    )

    new_model_path = "models/new_model_temp.pth"
    torch.save({
        'model_state_dict': new_model.state_dict(),
        'class_list': os.listdir(TRAIN_DIR),
        'num_classes': len(os.listdir(TRAIN_DIR)),
        'embedding_dim': 128
    }, new_model_path)

    new_cls_acc, new_emb_acc = evaluate_model(new_model_path, VAL_DIR)

    
    if new_cls_acc > current_cls_acc and new_emb_acc > current_emb_acc:
        # Generate embeddings
        reference_embeddings = generate_reference_embeddings(new_model_path, VAL_DIR, DEVICE)

        # Save classifier model
        save_versioned_model(new_model_path, config.MODEL_PATH, label="classifier model")

        # Save embedding model
        save_versioned_model("models/new_embedding.pth", config.EMBEDDING_PATH, label="embedding model")
        exit(0)   # <-- success
    else:
        print("New model did not outperform current best models.")
        exit(1)

