"""
A script to fine-tune an EfficientViT model for image classification.

This script uses PyTorch and the 'timm' library to fine-tune a pre-trained
EfficientViT model on a custom dataset. The dataset is expected to be in a
folder structure compatible with torchvision's ImageFolder dataset class.

Example usage:
    python core\\finetune_efficientvit.py --data-dir path\\to\\dataset --epochs 20 --lr 0.001
"""
import argparse
import os
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
import timm
from timm.data import resolve_data_config
from timm.data.transforms_factory import create_transform

def main(args):
    """Main function to run the fine-tuning."""
    print("Starting fine-tuning process...")
    print(f"Arguments: {args}")

    # --- 1. Setup Device ---
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # --- 2. Data Preprocessing ---
    # The model name is used to get the appropriate transforms
    model_name = args.model_name
    
    # Create transforms using timm's factory, which are specific to the model
    # This ensures the input data is preprocessed in the same way as during original training
    data_config = resolve_data_config({}, model=model_name)
    train_transform = create_transform(**data_config, is_training=True)
    val_transform = create_transform(**data_config, is_training=False)

    print("Train transforms:")
    print(train_transform)
    print("\nValidation transforms:")
    print(val_transform)

    # --- 3. Datasets and DataLoaders ---
    train_dir = os.path.join(args.data_dir, 'train')
    val_dir = os.path.join(args.data_dir, 'val')

    if not os.path.isdir(train_dir) or not os.path.isdir(val_dir):
        print(f"Error: Training ('{train_dir}') or validation ('{val_dir}') directory not found.")
        print("Please ensure your data directory is structured with 'train' and 'val' subdirectories.")
        return

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    val_dataset = datasets.ImageFolder(val_dir, transform=val_transform)

    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=4, pin_memory=True)
    val_loader = torch.utils.data.DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=4, pin_memory=True)

    num_classes = len(train_dataset.classes)
    print(f"\nFound {num_classes} classes in the dataset.")
    print(f"Class names: {train_dataset.classes}")

    # --- 4. Model Loading ---
    print(f"\nLoading model: {model_name}")
    model = timm.create_model(
        model_name,
        pretrained=True,
        num_classes=num_classes  # timm automatically replaces the classifier head
    )
    model = model.to(device)

    # --- 5. Loss Function and Optimizer ---
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    
    # --- 6. Training Loop ---
    best_acc = 0.0
    os.makedirs(args.output_dir, exist_ok=True)

    print("\nStarting training...")
    for epoch in range(args.epochs):
        print(f"\n--- Epoch {epoch+1}/{args.epochs} ---")
        
        # Training phase
        model.train()
        running_loss = 0.0
        running_corrects = 0
        
        for i, (inputs, labels) in enumerate(train_loader):
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)
                
                loss.backward()
                optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)
            
            if (i + 1) % 20 == 0:
                print(f"  [Train] Batch {i+1}/{len(train_loader)} Loss: {loss.item():.4f}")

        epoch_loss = running_loss / len(train_dataset)
        epoch_acc = running_corrects.double() / len(train_dataset)
        print(f"  [Train] Epoch Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

        # Validation phase
        model.eval()
        val_running_loss = 0.0
        val_running_corrects = 0

        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs = inputs.to(device)
                labels = labels.to(device)

                outputs = model(inputs)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)

                val_running_loss += loss.item() * inputs.size(0)
                val_running_corrects += torch.sum(preds == labels.data)

        val_epoch_loss = val_running_loss / len(val_dataset)
        val_epoch_acc = val_running_corrects.double() / len(val_dataset)
        print(f"  [Val]   Epoch Loss: {val_epoch_loss:.4f} Acc: {val_epoch_acc:.4f}")

        # Save the best model
        if val_epoch_acc > best_acc:
            best_acc = val_epoch_acc
            best_model_path = os.path.join(args.output_dir, f"{model_name}_best.pth")
            torch.save(model.state_dict(), best_model_path)
            print(f"  -> New best model saved to {best_model_path} (Acc: {best_acc:.4f})")

    print("\nFine-tuning complete.")
    print(f"Best validation accuracy: {best_acc:.4f}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Fine-tune an EfficientViT model.")
    parser.add_argument('--data-dir', type=str, required=True,
                        help="Path to the root dataset directory (containing 'train' and 'val' sub-folders).")
    parser.add_argument('--model-name', type=str, default='efficientvit_m4.r224_in1k',
                        help="Name of the model to use from timm library.")
    parser.add_argument('--epochs', type=int, default=25,
                        help="Number of training epochs.")
    parser.add_argument('--batch-size', type=int, default=32,
                        help="Batch size for training and validation.")
    parser.add_argument('--lr', type=float, default=0.001,
                        help="Learning rate for the optimizer.")
    parser.add_argument('--output-dir', type=str, default='models',
                        help="Directory to save the best model checkpoint.")

    args = parser.parse_args()
    main(args)
