"""
utils.py
Complete Siamese Network using ResNet18 backbone with:
- Triplet loss head (for embedding learning)
- Classification head (for Grad-CAM + class supervision)
- Validation via cosine similarity
"""

import os
import random
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
from tqdm import tqdm
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import config


PLANTNET_CKPT = config.PLANTNET_PRETRAINED_MODEL
# ===============================================================
# Dataset: TripletDataset
# ===============================================================
class TripletDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform

        # Get class folders
        self.classes = sorted(os.listdir(root_dir))
        self.class_to_idx = {cls_name: idx for idx, cls_name in enumerate(self.classes)}

        # Group image paths by class
        self.image_paths = {
            cls: [os.path.join(root_dir, cls, f) for f in os.listdir(os.path.join(root_dir, cls))
                  if f.lower().endswith(('png', 'jpg', 'jpeg'))]
            for cls in self.classes
        }

        # Flatten list
        self.all_images = [
            (img, self.class_to_idx[cls])
            for cls, imgs in self.image_paths.items()
            for img in imgs
        ]

    def __len__(self):
        return len(self.all_images)

    def __getitem__(self, idx):
        anchor_path, anchor_label = self.all_images[idx]
        pos_path = random.choice(self.image_paths[self.classes[anchor_label]])
        while pos_path == anchor_path:
            pos_path = random.choice(self.image_paths[self.classes[anchor_label]])

        neg_class = random.choice([c for c in self.classes if c != self.classes[anchor_label]])
        neg_path = random.choice(self.image_paths[neg_class])

        # Load
        anchor = Image.open(anchor_path).convert("RGB")
        positive = Image.open(pos_path).convert("RGB")
        negative = Image.open(neg_path).convert("RGB")

        if self.transform:
            anchor = self.transform(anchor)
            positive = self.transform(positive)
            negative = self.transform(negative)

        return anchor, positive, negative, anchor_label


# ===============================================================
# Dataset: SingleImageDataset (for validation / Grad-CAM)
# ===============================================================
class SingleImageDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.classes = sorted(os.listdir(root_dir))
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}

        self.samples = [
            (os.path.join(root_dir, c, img), self.class_to_idx[c])
            for c in self.classes
            for img in os.listdir(os.path.join(root_dir, c))
            if img.lower().endswith(('png', 'jpg', 'jpeg'))
        ]

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        img = Image.open(path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, label


# ===============================================================
# Model: Multi-Head ResNet18
# ===============================================================

class MultiHeadResNet18(nn.Module):
    def __init__(self, num_classes=5, embedding_dim=128, plantnet_ckpt="/kaggle/input/resnet18model/resnet18_weights_best_acc.tar",freeze_backbone=False ):
        super().__init__()

        # ---- 1. Load a ResNet18 backbone ----
        base = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        self.backbone = nn.Sequential(*list(base.children())[:-1])  # remove FC layer

        # ---- 2. Optionally load pretrained PlantNet weights ----
        if plantnet_ckpt is not None and os.path.exists(plantnet_ckpt):
            print(f"Loading PlantNet checkpoint from: {plantnet_ckpt}")
            ckpt = torch.load(plantnet_ckpt, map_location="cpu")

            # handle checkpoint format
            if "model" in ckpt:
                ckpt = ckpt["model"]
            elif "state_dict" in ckpt:
                ckpt = ckpt["model_state_dict"]

            # initialize a temporary resnet18 for loading
            pretrained_model = models.resnet18(weights=None)
            pretrained_dict = pretrained_model.state_dict()

            # filter out classifier & non-matching keys
            filtered = {}
            for k, v in ckpt.items():
                clean_key = k.replace("module.", "")
                if clean_key in pretrained_dict and "fc" not in clean_key:
                    filtered[clean_key] = v

            pretrained_dict.update(filtered)
            pretrained_model.load_state_dict(pretrained_dict, strict=False)

            # ---- copy backbone weights ----
            backbone_dict = dict(pretrained_model.named_children())
            for name, module in self.backbone.named_children():
                if name in backbone_dict:
                    module.load_state_dict(backbone_dict[name].state_dict())
            print(f" Loaded {len(filtered)} backbone weights from PlantNet.")
        else:
            print("No PlantNet checkpoint found, using ImageNet pretrained weights.")

        if freeze_backbone:
            for param in self.backbone.parameters():
                param.requires_grad = False
            print("Backbone frozen — acts as fixed feature extractor.")
        else:
            print("Backbone trainable — fine-tuning enabled.")

        # ---- 3. Define Heads ----
        in_features = base.fc.in_features

        self.embedding_head = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(0.3),
            nn.Linear(512, embedding_dim),   # embedding_dim = 128
            nn.BatchNorm1d(embedding_dim)
        )
        
        self.classifier_head = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes)
        )

    def forward(self, x):
        feats = self.backbone(x)
        feats = feats.view(feats.size(0), -1)

        embeddings = self.embedding_head(feats)
        embeddings = F.normalize(embeddings, p=2, dim=1)

        logits = self.classifier_head(feats)
        return embeddings, logits


# ===============================================================
# Training + Validation
# ===============================================================

def train_and_validate(
    train_root="/kaggle/working/Plant_dataset/train",
    val_root="/kaggle/working/Plant_dataset/val",
    num_classes=5,
    embedding_dim=128,
    num_epochs=10,
    batch_size=16,
    lr=1e-4,
    lambda_triplet=1.0,
    lambda_class=0.5,
    freeze_backbone=True
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.1),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    train_dataset = TripletDataset(train_root, transform=train_transform)
    val_dataset = SingleImageDataset(val_root, transform=transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4)

    model = MultiHeadResNet18(num_classes=num_classes, embedding_dim=embedding_dim, plantnet_ckpt=PLANTNET_CKPT,freeze_backbone=freeze_backbone).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    triplet_loss_fn = nn.TripletMarginLoss(margin=1.0)
    ce_loss_fn = nn.CrossEntropyLoss()

    # Training loop
    for epoch in range(num_epochs):
        model.train()
        total_loss = 0

        loop = tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}", unit="batch")
        for anchor, pos, neg, labels in loop:
            anchor, pos, neg, labels = anchor.to(device), pos.to(device), neg.to(device), labels.to(device)

            emb_a, logit_a = model(anchor)
            emb_p, _ = model(pos)
            emb_n, _ = model(neg)

            triplet_loss = triplet_loss_fn(emb_a, emb_p, emb_n)
            class_loss = ce_loss_fn(logit_a, labels)
            loss = lambda_triplet * triplet_loss + lambda_class * class_loss

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            loop.set_postfix(loss=total_loss / (loop.n + 1))  # update progress bar with average loss

        print(f"Epoch [{epoch+1}/{num_epochs}] | Avg Loss: {total_loss/len(train_loader):.4f}")

        # Validation (embedding similarity)
        validate_embeddings(model, val_loader, device)

    # --- Save final model and class mapping ---
    model_state = model.state_dict()
    class_list = val_dataset.classes
    save_dict = {
        'model_state_dict': model_state,
        'class_list': class_list,
        'num_classes': num_classes,
        'embedding_dim': embedding_dim
    }
    #torch.save(save_dict, "new_models/multihead_resnet18_ckpt.pth")
    #print("Training complete. Model and class mapping saved as multihead_resnet18_ckpt.pth")

    return model


# ===============================================================
#Validation Function
# ===============================================================
def validate_embeddings(model, val_loader, device):
    model.eval()
    embeddings, labels = [], []

    with torch.no_grad():
        for imgs, lbls in val_loader:
            imgs = imgs.to(device)
            emb, _ = model(imgs)
            embeddings.append(emb.cpu())
            labels.append(lbls)

    embeddings = torch.cat(embeddings)
    labels = torch.cat(labels)

    # Compute pairwise cosine similarity
    sims = F.cosine_similarity(embeddings.unsqueeze(1), embeddings.unsqueeze(0), dim=-1)
    preds = sims.argmax(dim=1)
    acc = (labels[preds] == labels).float().mean().item()

    print(f"Validation Embedding Accuracy (cosine match): {acc*100:.2f}%")

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
    print(f" Embedding Retrieval Accuracy (cosine match): {acc * 100:.2f}%")

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
    print(f"Classification Accuracy: {acc * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, digits=4))

def generate_reference_embeddings(model, data_loader, device):
    """Generates and averages embeddings for each class."""
    model.eval()
    all_embeddings = []
    all_labels = []

    with torch.no_grad():
        for imgs, lbls in data_loader:
            imgs = imgs.to(device)
            emb, _ = model(imgs)
            all_embeddings.append(emb.cpu())
            all_labels.append(lbls)

    embeddings = torch.cat(all_embeddings)
    labels = torch.cat(all_labels)

    # Calculate mean embedding for each class
    num_classes = labels.max().item() + 1
    reference_embeddings = torch.zeros(num_classes, embeddings.shape[1])
    class_indices = []

    for i in range(num_classes):
        # Select all embeddings belonging to class i
        class_embeddings = embeddings[labels == i]
        if len(class_embeddings) > 0:
            reference_embeddings[i] = class_embeddings.mean(dim=0)
            class_indices.append(i)

    # Normalize the reference embeddings (important for cosine similarity)
    reference_embeddings = F.normalize(reference_embeddings, p=2, dim=1)

    print(f"Generated {reference_embeddings.shape[0]} reference embeddings.")
    return reference_embeddings

import os
import re
import shutil

def save_versioned_model(new_model_path, target_model_path, label="model/embedding"):
    """
    Replaces the existing model with a new one and versions the old one.

    Args:
        new_model_path (str): Path of the new trained model (.pth)
        target_model_path (str): The deploy model path (e.g. ./models/bestmodel.pth)
        label (str): Used for logging (e.g. "classifier", "embedding")
    """
    if os.path.exists(target_model_path):
        models_dir = os.path.dirname(target_model_path)
        base_name = os.path.basename(target_model_path)
        name, ext = os.path.splitext(base_name)

        # find existing versions
        existing_versions = [
            int(re.search(r'_v(\d+)', f).group(1))
            for f in os.listdir(models_dir)
            if re.match(rf"{re.escape(name)}_v\d+{re.escape(ext)}$", f)
        ]
        next_version = max(existing_versions, default=0) + 1
        backup_path = os.path.join(models_dir, f"{name}_v{next_version}{ext}")

        os.rename(target_model_path, backup_path)
        print(f"Old {label} backed up as {backup_path}")

    # replace with new one
    shutil.move(new_model_path, target_model_path)
    print(f" New {label} deployed at {target_model_path}")


def check_species_num(EMBEDDING_PATH):
    try:
        # Load the tensor. This assumes the file was saved using torch.save(reference_embeddings, path)
        reference_embeddings = torch.load(EMBEDDING_PATH)
        print("Successfully loaded the reference embeddings tensor.")
    except FileNotFoundError:
        print(f"Error: Reference embeddings file not found at {EMBEDDING_PATH}")
        exit()
    # The shape will be (Number of Species, Embedding Dimension)
    # Example shape: torch.Size([200, 128]) 
    num_species = reference_embeddings.shape[0]

    print(f"Total Number of Species (Classes) in the embeddings: {num_species}")
    print(f"Embedding Dimension (Feature Size): {reference_embeddings.shape[1]}")
    return num_species