import os
import sys
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
from PIL import Image, ImageFile
import numpy as np
import config

ImageFile.LOAD_TRUNCATED_IMAGES = True

#--- 0. Model Definition (Copied from Training Script) ---
class MultiHeadResNet18(nn.Module):
    # Simplified init for inference (assuming weights are loaded)
    def __init__(self, num_classes=12, embedding_dim=128):
        super().__init__()
        base = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        self.backbone = nn.Sequential(*list(base.children())[:-1])  # remove FC layer
        in_features = base.fc.in_features
        
        # self.embedding_head = nn.Sequential(
        #     nn.Linear(in_features, embedding_dim),
        #     nn.BatchNorm1d(embedding_dim)
        # )
        # self.classifier_head = nn.Linear(in_features, num_classes)
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

# --- 1. Setup and Initialization (Corrected Block) ---
# Define paths and parameters
NUM_CLASSES = 12
EMBEDDING_DIM = 128
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# Initialize model and load checkpoint
# 1. Load the checkpoint file
checkpoint = torch.load(config.MODEL_PATH, map_location=DEVICE) 
#print(f"Checkpoint loaded")

# 2. Instantiate the model
model = MultiHeadResNet18(num_classes=NUM_CLASSES, embedding_dim=EMBEDDING_DIM).to(DEVICE)

# 3. Load the weights into the model
model.load_state_dict(checkpoint['model_state_dict'])

model.eval()

# Load class list
CLASS_LIST = checkpoint['class_list']
#print(f"Loaded {len(CLASS_LIST)} species names.")

# Load reference embeddings
if os.path.exists(config.EMBEDDING_PATH ):
    reference_embeddings = torch.load(config.EMBEDDING_PATH , map_location=DEVICE)
    #print(f"Loaded reference embeddings ")
else:
    #print(f"Reference embedding file not found. Using Classification only.")
    reference_embeddings = None # Set to None if only using classifier

# --- 2. Hybrid Prediction Function (New Logic) ---
# def predict(image_path, topk=3, classification_threshold=0.7):
#     try:
#         img = Image.open(image_path).convert('RGB')
#     except Exception as e:
#         return {"error": f"Could not open image: {str(e)}"}

#     img_tensor = transform(img).unsqueeze(0).to(DEVICE)
    
#     with torch.no_grad():
#         query_emb, logits = model(img_tensor)
#         probs = F.softmax(logits, dim=1)[0]
        
#         # Get Top-K predictions from the Classification Head
#         top_probs, top_idxs = probs.topk(topk)
        
#         top_probs = top_probs.cpu().numpy()
#         top_idxs = top_idxs.cpu().numpy()

#         results = []
#         for i in range(topk):
#             species = CLASS_LIST[top_idxs[i]]
#             confidence = float(top_probs[i])
            
#             # Use the Embedding Head as a secondary check if confidence is low
#             if reference_embeddings is not None and confidence < classification_threshold:
#                 # Calculate similarity for the top classification prediction
#                 cls_idx_tensor = torch.tensor([top_idxs[i]], device=DEVICE)
#                 ref_emb_for_cls = reference_embeddings[cls_idx_tensor]
                
#                 sim_score = F.cosine_similarity(query_emb, ref_emb_for_cls).item()
                
#                 # If similarity is also very low, the classification is likely wrong/out-of-distribution
#                 # This is where more complex logic (like switching to kNN prediction) would go.
#                 # For this top-K list, we append the classification result but note the low confidence.
#                 results.append({
#                     "class": species,
#                     "confidence": round(confidence, 4),
#                     "note": f"Low Cls Confidence. Ref Sim: {round(sim_score, 4)}"
#                 })
#             else:
#                 results.append({
#                     "class": species,
#                     "confidence": round(confidence, 4)
#                 })

#     return results

def predict(image_path, topk=3):
    try:
        img = Image.open(image_path).convert('RGB')
    except Exception as e:
        return {"error": f"Could not open image: {str(e)}"}

    img_tensor = transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        query_emb, logits = model(img_tensor)
        probs = F.softmax(logits, dim=1)[0]

        top_idxs = []
        final_scores = []

        # Compute fusion score for each class
        for cls_idx in range(len(CLASS_LIST)):
            cls_prob = probs[cls_idx].item()

            if reference_embeddings is not None:
                ref_emb = reference_embeddings[cls_idx].unsqueeze(0)  # shape: 1 x embedding_dim
                sim_score = F.cosine_similarity(query_emb, ref_emb).item()
                sim_norm = (sim_score + 1) / 2  # normalize cosine similarity to [0,1]
            else:
                sim_norm = 0.0

            # Weighted fusion: α = 0.5
            fusion_score = 0.5 * cls_prob + 0.5 * sim_norm
            top_idxs.append(cls_idx)
            final_scores.append(fusion_score)

        # Get top-K classes based on fusion score
        top_scores, top_indices = torch.topk(torch.tensor(final_scores), topk)

        results = []
        for i in range(topk):
            cls_idx = top_indices[i].item()
            results.append({
                "class": CLASS_LIST[cls_idx],
                "fusion_score": round(top_scores[i].item(), 4),
                "confidence": round(probs[cls_idx].item(), 4),
                "embedding_sim": round(((F.cosine_similarity(query_emb, reference_embeddings[cls_idx].unsqueeze(0)).item() + 1)/2), 4)
            })

    return results



if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Standard error response for command line usage
        print(json.dumps({"error": "No image paths provided. Usage: python hybrid_predictor.py <image_path>"}))
        sys.exit(1)

    # Note: This modification assumes you only process *one* image path 
    # as per your desired output format, which is a single list of results.
    image_path = sys.argv[1] 

    # Only one prediction call is needed
    preds = predict(image_path, topk=3)
    
    # --- DESIRED JSON OUTPUT ---
    # The 'preds' variable is already the list of dictionaries you want.
    # Print the list directly as JSON.
    print(json.dumps(preds, indent=2))
    
    sys.exit(0)