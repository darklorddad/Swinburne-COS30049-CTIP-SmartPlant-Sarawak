import os
import sys
import json
import torch
import torch.nn as nn
import torch.nn.functional as F
import config
import cv2
import numpy as np
from torchvision import models, transforms
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

# Global variable and config (Adjust paths as needed)
CHECKPOINT_PATH = config.MODEL_PATH
OUTPUT_DIR = "heatmaps"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- 0. Model Definition (Must be present to load weights) ---
class MultiHeadResNet18(nn.Module):
    def __init__(self, num_classes=12, embedding_dim=128):
        super().__init__()
        base = models.resnet18(weights=models.ResNet18_Weights.IMAGENET1K_V1)
        self.backbone = nn.Sequential(*list(base.children())[:-1])
        in_features = base.fc.in_features
        
        self.embedding_head = nn.Sequential(
            nn.Linear(in_features, embedding_dim),
            nn.BatchNorm1d(embedding_dim)
        )
        self.classifier_head = nn.Linear(in_features, num_classes)

    def forward(self, x):
        feats = self.backbone(x)
        feats = feats.view(feats.size(0), -1)
        embeddings = self.embedding_head(feats)
        embeddings = F.normalize(embeddings, p=2, dim=1)
        logits = self.classifier_head(feats)
        return embeddings, logits


# ===============================================================
# 1️⃣ Grad-CAM Utility Class
# ===============================================================
class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()
        def backward_hook(module, grad_in, grad_out):
            self.gradients = grad_out[0].detach()
        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor, target_class=None):
        self.model.eval()
        
        _, logits = self.model(input_tensor)
        
        if target_class is None:
            target_class = logits.argmax(dim=1).item()

        loss = logits[:, target_class].sum()
        self.model.zero_grad()
        loss.backward()

        grads = self.gradients
        acts = self.activations
        weights = grads.mean(dim=(2, 3), keepdim=True)
        cam = torch.relu((weights * acts).sum(dim=1, keepdim=True))
        
        cam = F.interpolate(cam, size=input_tensor.shape[2:], mode='bilinear', align_corners=False)
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        
        return cam.squeeze().cpu().numpy(), target_class

# ===============================================================
# 2️⃣ Helper Functions (Adapted to use PIL/CV2 together)
# ===============================================================
def preprocess_image(img_path):
    """Loads image and applies standard normalization/resizing."""
    config = {"size": 224, "norm_mean": [0.485,0.456,0.406], "norm_std": [0.229,0.224,0.225]}
    img = Image.open(img_path).convert("RGB")
    
    transform = transforms.Compose([
        transforms.Resize((config["size"], config["size"])),
        transforms.ToTensor(),
        transforms.Normalize(mean=config["norm_mean"], std=config["norm_std"])
    ])
    
    return transform(img).unsqueeze(0), img # Return tensor and original PIL image

def overlay_heatmap(img_path, heatmap, alpha=0.4):
    """Overlays the heatmap on the original CV2-loaded image."""
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Could not load image using cv2 at {img_path}")
        
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    # The default addWeighted assumes BGR color space for cv2.imread
    superimposed = cv2.addWeighted(img, 1 - alpha, heatmap, alpha, 0)
    return superimposed

# ===============================================================
# 3️⃣ Main Execution Logic (The desired output format)
# ===============================================================
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Please provide an image path."}))
        sys.exit(1)
        
    image_path = sys.argv[1] 

    try:
        # Load the checkpoint dictionary
        checkpoint = torch.load(CHECKPOINT_PATH, map_location="cpu")
        class_list = checkpoint['class_list']
        num_classes = len(class_list)
        embedding_dim = checkpoint.get('embedding_dim', 128)
        
        # Initialize and load MultiHead model
        model = MultiHeadResNet18(num_classes=num_classes, embedding_dim=embedding_dim)
        model.load_state_dict(checkpoint["model_state_dict"])
        model.eval()
        
    except Exception as e:
        print(json.dumps({"error": f"Model loading failed: {str(e)}"}))
        sys.exit(1)
        
    # Preprocess (returns tensor and original PIL image, though only tensor is used here)
    try:
        img_tensor, _ = preprocess_image(image_path)
    except Exception as e:
        print(json.dumps({"error": f"Image preprocessing failed: {str(e)}"}))
        sys.exit(1)

    # --- Grad-CAM Logic ---
    # Target the last convolution layer of the last ResNet block (layer4)
    target_layer = model.backbone[7][-1].conv2
    gradcam = GradCAM(model, target_layer)

    # Generate CAM and get predicted index
    heatmap, class_index = gradcam.generate(img_tensor)
    
    # --- Save Output ---
    output_img = overlay_heatmap(image_path, heatmap)
    
    # Determine the output filename
    filename_base = os.path.splitext(os.path.basename(image_path))[0]
    output_filename = os.path.join(OUTPUT_DIR, f"{filename_base}_heatmap.jpg")
    
    cv2.imwrite(output_filename, output_img)

    # --- DESIRED JSON OUTPUT ---
    print(json.dumps({"heatmap_path": output_filename})) 
    sys.exit(0)