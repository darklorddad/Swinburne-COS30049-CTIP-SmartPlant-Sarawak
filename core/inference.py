import torch
import timm
from torchvision import transforms
from PIL import Image

def classify_image(model_path, image_path, progress_callback=None):
    """
    Loads a trained model and classifies a single image.

    Args:
        model_path (str): Path to the saved .pt model file.
        image_path (str): Path to the image to classify.
        progress_callback (function, optional): Callback for logging.

    Returns:
        tuple: (predicted_class_name, confidence_score)
    """
    def log(message):
        print(message)
        if progress_callback:
            progress_callback(message)

    log("Loading model and image...")
    try:
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
        log(f"Using device: {device}")

        checkpoint = torch.load(model_path, map_location=device)

        model_name = checkpoint['model_name']
        num_classes = checkpoint['num_classes']
        class_names = checkpoint['class_names']
        input_size = checkpoint.get('input_size', 224)
        resize_size = checkpoint.get('resize_size', 256)
        use_imagenet_norm = checkpoint.get('use_imagenet_norm', True)
        mean = checkpoint.get('norm_mean', [0.485, 0.456, 0.406])
        std = checkpoint.get('norm_std', [0.229, 0.224, 0.225])

        log(f"Model: {model_name}, Classes: {num_classes}")

        model = timm.create_model(model_name, pretrained=False, num_classes=num_classes)
        model.load_state_dict(checkpoint['state_dict'])
        model = model.to(device)
        model.eval()

        transform_list = [
            transforms.Resize(resize_size),
            transforms.CenterCrop(input_size),
            transforms.ToTensor(),
        ]
        if use_imagenet_norm:
            transform_list.append(transforms.Normalize(mean, std))
        
        transform = transforms.Compose(transform_list)

        image = Image.open(image_path).convert('RGB')
        image_tensor = transform(image).unsqueeze(0).to(device)

        log("Classifying...")
        with torch.no_grad():
            outputs = model(image_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)
            confidence, pred_index = torch.max(probabilities, 1)
            
        predicted_class = class_names[pred_index.item()]
        confidence_score = confidence.item()
        
        log(f"Prediction: {predicted_class} (Confidence: {confidence_score:.4f})")
        return predicted_class, confidence_score

    except Exception as e:
        log(f"Error during classification: {e}")
        raise e
