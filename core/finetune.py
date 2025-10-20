import argparse
import copy
import os
import torch
import timm
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from PIL import ImageFile
import pathlib

def main(args, progress_callback=None):
    """Main function to run the fine-tuning script"""
    
    def log(message):
        print(message)
        if progress_callback:
            progress_callback(message)

    log("Starting fine-tuning")

    log("--- Fine-tuning parameters ---")
    args_to_print = {k: v for k, v in args.items() if k != 'cancel_event'}
    for key, value in sorted(args_to_print.items()):
        log(f"{key}: {value}")
    log("-----------------------------")

    load_truncated_images = args.get('load_truncated_images', True)
    ImageFile.LOAD_TRUNCATED_IMAGES = load_truncated_images
    
    cancel_event = args.get('cancel_event')
    data_dir = args['data_dir']
    model_name = args.get('model_name', 'resnet18')
    num_epochs = args.get('num_epochs', 25)
    batch_size = args.get('batch_size', 32)
    body_learning_rate = args.get('body_learning_rate', 1e-5)
    head_learning_rate = args.get('head_learning_rate', 1e-3)
    dropout_rate = args.get('dropout_rate', 0.0)
    optimiser_name = args.get('optimiser', 'adamw')
    sgd_momentum = args.get('sgd_momentum', 0.9)
    adam_beta1 = args.get('adam_beta1', 0.9)
    adam_beta2 = args.get('adam_beta2', 0.999)
    adam_eps = args.get('adam_eps', 1e-8)
    loss_function = args.get('loss_function', 'cross_entropy')
    label_smoothing_factor = args.get('label_smoothing_factor', 0.1)
    weight_decay = args.get('weight_decay', 0.0)
    load_path = args.get('load_path')
    save_path = args.get('save_path')
    early_stopping_patience = args.get('early_stopping_patience', 0)
    early_stopping_min_delta = args.get('early_stopping_min_delta', 0.0)
    early_stopping_metric = args.get('early_stopping_metric', 'loss')
    mixed_precision = args.get('mixed_precision', False)
    use_imagenet_norm = args.get('use_imagenet_norm', True)
    norm_mean_str = args.get('norm_mean', '0.485, 0.456, 0.406')
    norm_std_str = args.get('norm_std', '0.229, 0.224, 0.225')
    input_size = args.get('input_size', 224)
    resize_size_arg = args.get('resize_size')
    resize_size = resize_size_arg if resize_size_arg is not None else int(input_size / 224 * 256)
    num_workers = args.get('num_workers', 0)
    train_from_scratch = args.get('train_from_scratch', False)
    strict_load = args.get('strict_load', False)
    train_dir_name = args.get('train_dir_name', 'train')
    val_dir_name = args.get('val_dir_name', 'val')
    test_dir_name = args.get('test_dir_name', 'test')
    device_str = args.get('device', 'auto')
    lr_scheduler_name = args.get('lr_scheduler', 'none')
    cosine_t_max_arg = args.get('cosine_t_max')
    cosine_t_max = cosine_t_max_arg if cosine_t_max_arg is not None else num_epochs
    
    # Get individual augmentation flags
    aug_random_resized_crop = args.get('aug_random_resized_crop', True)
    aug_horizontal_flip = args.get('aug_horizontal_flip', True)
    aug_rotation = args.get('aug_rotation', True)
    aug_color_jitter = args.get('aug_color_jitter', True)
    aug_rotation_degrees = args.get('aug_rotation_degrees', 15)
    aug_color_jitter_brightness = args.get('aug_color_jitter_brightness', 0.2)
    aug_color_jitter_contrast = args.get('aug_color_jitter_contrast', 0.2)
    aug_color_jitter_saturation = args.get('aug_color_jitter_saturation', 0.2)
    aug_color_jitter_hue = args.get('aug_color_jitter_hue', 0.1)
    aug_crop_scale_min = args.get('aug_crop_scale_min', 0.08)
    aug_crop_scale_max = args.get('aug_crop_scale_max', 1.0)
    aug_crop_ratio_min = args.get('aug_crop_ratio_min', 0.75)
    aug_crop_ratio_max = args.get('aug_crop_ratio_max', 1.33)
    pin_memory = args.get('pin_memory', False)
    use_weighted_loss = args.get('use_weighted_loss', False)
    tuning_strategy = args.get('tuning_strategy', 'full')

    seed = args.get('seed')

    if seed is not None:
        torch.manual_seed(seed)
        log(f"Using random seed: {seed}")

    log("Setting up data transforms...")
    # 1. Set up data transforms
    train_transform_list = []
    if aug_random_resized_crop:
        train_transform_list.append(transforms.RandomResizedCrop(input_size, scale=(aug_crop_scale_min, aug_crop_scale_max), ratio=(aug_crop_ratio_min, aug_crop_ratio_max)))
    else:
        train_transform_list.extend([
            transforms.Resize(resize_size),
            transforms.CenterCrop(input_size),
        ])
    
    if aug_horizontal_flip:
        train_transform_list.append(transforms.RandomHorizontalFlip())
    if aug_rotation:
        train_transform_list.append(transforms.RandomRotation(aug_rotation_degrees))
    if aug_color_jitter:
        train_transform_list.append(transforms.ColorJitter(brightness=aug_color_jitter_brightness, contrast=aug_color_jitter_contrast, saturation=aug_color_jitter_saturation, hue=aug_color_jitter_hue))

    train_transform_list.append(transforms.ToTensor())
    
    val_transform_list = [
        transforms.Resize(resize_size),
        transforms.CenterCrop(input_size),
        transforms.ToTensor(),
    ]

    if use_imagenet_norm:
        try:
            mean = [float(x.strip()) for x in norm_mean_str.split(',')]
            std = [float(x.strip()) for x in norm_std_str.split(',')]
        except ValueError:
            raise ValueError("Invalid format for norm_mean or norm_std. They should be comma-separated floats")
        
        if len(mean) != len(std):
            raise ValueError("norm_mean and norm_std must have the same number of values")

        normalizer = transforms.Normalize(mean, std)
        train_transform_list.append(normalizer)
        val_transform_list.append(normalizer)

    data_transforms = {
        train_dir_name: transforms.Compose(train_transform_list),
        val_dir_name: transforms.Compose(val_transform_list),
        test_dir_name: transforms.Compose(val_transform_list),
    }

    log("Loading image datasets...")
    # 2. Create ImageFolder datasets
    phases = [train_dir_name, val_dir_name]
    if os.path.isdir(os.path.join(data_dir, test_dir_name)):
        phases.append(test_dir_name)
    
    image_datasets = {}
    for x in phases:
        if cancel_event and cancel_event.is_set():
            log("Fine-tuning cancelled")
            return None
        log(f"Loading '{x}' dataset...")
        image_datasets[x] = datasets.ImageFolder(os.path.join(data_dir, x), data_transforms[x])
    
    log("Creating data loaders...")
    # 3. Create DataLoaders
    dataloaders = {x: torch.utils.data.DataLoader(image_datasets[x], batch_size=batch_size, shuffle=(x == train_dir_name), num_workers=num_workers, pin_memory=pin_memory)
                   for x in phases}
    
    dataset_sizes = {x: len(image_datasets[x]) for x in phases}
    class_names = image_datasets[train_dir_name].classes
    num_classes = len(class_names)

    if device_str == 'auto':
        device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    else:
        device = torch.device(device_str)
    log(f"Using device: {device}")

    use_amp = mixed_precision and device.type == 'cuda'
    scaler = torch.amp.GradScaler(device.type, enabled=use_amp)
    if use_amp:
        log("Using mixed precision training (AMP)")

    log("Setting up model...")
    # 4. Load pretrained model from timm
    # This will load a pretrained model and replace the classifier head with a new one for our number of classes.
    model = timm.create_model(model_name, pretrained=not train_from_scratch, num_classes=num_classes, drop_rate=dropout_rate)

    # Apply tuning strategy
    if tuning_strategy == 'head_only':
        log("Applying 'head_only' tuning strategy: freezing all layers except the classifier.")
        for param in model.parameters():
            param.requires_grad = False
        
        # Unfreeze the classifier's parameters. timm models have a get_classifier() method.
        try:
            classifier = model.get_classifier()
            for param in classifier.parameters():
                param.requires_grad = True
        except AttributeError:
            log(f"Warning: Model {model_name} does not have a standard `get_classifier` method. 'head_only' strategy might not work as expected.")

    elif tuning_strategy == 'full':
        log("Applying 'full' tuning strategy: all layers are trainable.")
    else:
        raise ValueError(f"Unsupported tuning strategy: {tuning_strategy}")

    # 5. If a load_path is provided, load the model state
    checkpoint = None
    if load_path:
        # Using strict=False allows loading weights from a checkpoint with a different classifier.
        log(f"Loading checkpoint from {load_path}")
        checkpoint = torch.load(load_path, map_location=device)
        if 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'], strict=strict_load)
        else:
            # For backwards compatibility with old checkpoints
            model.load_state_dict(checkpoint, strict=strict_load)

    model = model.to(device)

    # 7. Define loss function and optimizer
    weights = None
    if use_weighted_loss:
        log("Calculating class weights for weighted loss...")
        class_counts = [0] * num_classes
        # This can be slow for large datasets, but is accurate.
        for _, label in image_datasets[train_dir_name].samples:
            class_counts[label] += 1
    
        num_samples = sum(class_counts)
        # Use a more stable weight calculation: N / (C * n_c)
        # This prevents excessively large weights for rare classes.
        class_weights = [num_samples / (num_classes * class_counts[i]) if class_counts[i] > 0 else 0 for i in range(num_classes)]
        
        # Clip weights to prevent instability from extremely rare classes
        max_weight = 20.0
        class_weights = [min(w, max_weight) for w in class_weights]

        weights = torch.FloatTensor(class_weights).to(device)
        log(f"Applied class weights. Min: {min(w for w in class_weights if w > 0):.2f}, Max: {max(class_weights):.2f}, Mean: {sum(class_weights)/len(class_weights):.2f}")

    # PyTorch's CrossEntropyLoss supports both weights and label smoothing.
    # We use a weighted criterion for training and an unweighted one for validation.
    if loss_function == 'cross_entropy':
        train_criterion = nn.CrossEntropyLoss(weight=weights)
        val_criterion = nn.CrossEntropyLoss()
    elif loss_function == 'label_smoothing':
        train_criterion = nn.CrossEntropyLoss(weight=weights, label_smoothing=label_smoothing_factor)
        val_criterion = nn.CrossEntropyLoss(label_smoothing=label_smoothing_factor)
    else:
        raise ValueError(f"Unsupported loss function: {loss_function}")

    # Set up parameter groups for differential learning rates
    param_groups = []
    try:
        classifier = model.get_classifier()
        head_params = list(classifier.parameters())
        head_param_ids = {id(p) for p in head_params}
        body_params = [p for p in model.parameters() if id(p) not in head_param_ids]

        trainable_body_params = [p for p in body_params if p.requires_grad]
        trainable_head_params = [p for p in head_params if p.requires_grad]

        if trainable_body_params:
            param_groups.append({'params': trainable_body_params, 'lr': body_learning_rate})
        if trainable_head_params:
            param_groups.append({'params': trainable_head_params, 'lr': head_learning_rate})
        
        if not param_groups:
             raise ValueError("No trainable parameters found. Check your tuning strategy and model structure.")

        log(f"Using differential learning rates. Body LR: {body_learning_rate}, Head LR: {head_learning_rate}")

    except AttributeError:
        log(f"Warning: Model {model_name} does not have a standard `get_classifier` method. Using single learning rate ({head_learning_rate}) for all trainable parameters.")
        params_to_update = filter(lambda p: p.requires_grad, model.parameters())
        param_groups = [{'params': list(params_to_update), 'lr': head_learning_rate}]
    
    if optimiser_name == 'adam':
        optimizer = optim.Adam(param_groups, betas=(adam_beta1, adam_beta2), eps=adam_eps, weight_decay=weight_decay)
    elif optimiser_name == 'adamw':
        optimizer = optim.AdamW(param_groups, betas=(adam_beta1, adam_beta2), eps=adam_eps, weight_decay=weight_decay)
    elif optimiser_name == 'sgd':
        optimizer = optim.SGD(param_groups, momentum=sgd_momentum, weight_decay=weight_decay)
    else:
        raise ValueError(f"Unsupported optimiser: {optimiser_name}")

    if checkpoint and 'optimizer_state_dict' in checkpoint:
        optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        log("Loaded optimizer state from checkpoint.")

    # Set up LR scheduler
    scheduler = None
    if lr_scheduler_name == 'cosine':
        log(f"Using Cosine Annealing LR scheduler with T_max={cosine_t_max}")
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=cosine_t_max)

    # 8. Implement the training loop
    best_model_state = copy.deepcopy(model.state_dict())
    best_val_loss = float('inf')
    best_val_acc = 0.0
    epochs_no_improve = 0

    # Get baseline validation metrics before training if early stopping is enabled
    if early_stopping_patience > 0 and val_dir_name in dataloaders:
        log("Calculating initial validation metrics for early stopping baseline...")
        model.eval()
        val_running_loss = 0.0
        val_running_corrects = 0
        with torch.no_grad():
            for inputs, labels in dataloaders[val_dir_name]:
                inputs = inputs.to(device)
                labels = labels.to(device)
                with torch.amp.autocast(device.type, enabled=use_amp):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = val_criterion(outputs, labels)
                val_running_loss += loss.item() * inputs.size(0)
                val_running_corrects += torch.sum(preds == labels.data)
        
        best_val_loss = val_running_loss / dataset_sizes[val_dir_name]
        best_val_acc = (val_running_corrects.double() / dataset_sizes[val_dir_name]).item()
        log(f'Initial validation Loss: {best_val_loss:.4f} Acc: {best_val_acc:.4f}')

    for epoch in range(num_epochs):
        if cancel_event and cancel_event.is_set():
            log("Fine-tuning cancelled")
            return None
        log(f'Epoch {epoch}/{num_epochs - 1}')
        log('-' * 10)

        # --- Training Phase ---
        model.train()
        train_running_loss = 0.0
        train_running_corrects = 0
        num_batches = len(dataloaders[train_dir_name])
        for i, (inputs, labels) in enumerate(dataloaders[train_dir_name]):
            if cancel_event and cancel_event.is_set():
                log("Fine-tuning cancelled")
                return None
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(True):
                with torch.amp.autocast(device.type, enabled=use_amp):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = train_criterion(outputs, labels)

                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()

            if (i + 1) % 10 == 0 or i + 1 == num_batches:
                log(f'Processing {train_dir_name} batch {i+1}/{num_batches}')

            train_running_loss += loss.item() * inputs.size(0)
            train_running_corrects += torch.sum(preds == labels.data)

        train_epoch_loss = train_running_loss / dataset_sizes[train_dir_name]
        train_epoch_acc = train_running_corrects.double() / dataset_sizes[train_dir_name]
        log(f'{train_dir_name} Loss: {train_epoch_loss:.4f} Acc: {train_epoch_acc:.4f}')

        # --- Validation Phase ---
        model.eval()
        val_running_loss = 0.0
        val_running_corrects = 0
        num_batches = len(dataloaders[val_dir_name])
        with torch.no_grad():
            for i, (inputs, labels) in enumerate(dataloaders[val_dir_name]):
                if cancel_event and cancel_event.is_set():
                    log("Fine-tuning cancelled")
                    return None
                inputs = inputs.to(device)
                labels = labels.to(device)

                with torch.amp.autocast(device.type, enabled=use_amp):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = val_criterion(outputs, labels)

                if (i + 1) % 10 == 0 or i + 1 == num_batches:
                    log(f'Processing {val_dir_name} batch {i+1}/{num_batches}')

                val_running_loss += loss.item() * inputs.size(0)
                val_running_corrects += torch.sum(preds == labels.data)

        val_epoch_loss = val_running_loss / dataset_sizes[val_dir_name]
        val_epoch_acc = val_running_corrects.double() / dataset_sizes[val_dir_name]
        log(f'{val_dir_name} Loss: {val_epoch_loss:.4f} Acc: {val_epoch_acc:.4f}')

        # Step the scheduler after validation
        if scheduler:
            scheduler.step()

        # Early stopping logic based on validation metrics
        if early_stopping_patience > 0:
            if early_stopping_metric == 'loss':
                if val_epoch_loss < best_val_loss - early_stopping_min_delta:
                    best_val_loss = val_epoch_loss
                    best_model_state = copy.deepcopy(model.state_dict())
                    epochs_no_improve = 0
                else:
                    epochs_no_improve += 1
            elif early_stopping_metric == 'accuracy':
                if val_epoch_acc > best_val_acc + early_stopping_min_delta:
                    best_val_acc = val_epoch_acc.item()
                    best_model_state = copy.deepcopy(model.state_dict())
                    epochs_no_improve = 0
                else:
                    epochs_no_improve += 1
        
        if early_stopping_patience > 0 and epochs_no_improve >= early_stopping_patience:
            log(f"Early stopping triggered after {epochs_no_improve} epochs with no improvement")
            break

    # 9. After training, load the best model state if early stopping was used
    if early_stopping_patience > 0:
        log("Loading best model state for final evaluation")
        model.load_state_dict(best_model_state)

    # Evaluate on validation set for final metrics
    log("Evaluating on validation set for final metrics...")
    model.eval()
    val_running_loss = 0.0
    val_running_corrects = 0
    with torch.no_grad():
        for inputs, labels in dataloaders[val_dir_name]:
            if cancel_event and cancel_event.is_set():
                log("Fine-tuning cancelled")
                return None
            inputs = inputs.to(device)
            labels = labels.to(device)
            with torch.amp.autocast(device.type, enabled=use_amp):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = val_criterion(outputs, labels)
            val_running_loss += loss.item() * inputs.size(0)
            val_running_corrects += torch.sum(preds == labels.data)
    
    val_final_loss = val_running_loss / dataset_sizes[val_dir_name]
    val_final_acc = val_running_corrects.double() / dataset_sizes[val_dir_name]
    log(f'Final Validation Loss: {val_final_loss:.4f} Acc: {val_final_acc:.4f}')

    # Save the model
    if save_path:
        log(f"Saving model to {save_path}")
        save_data = {
            'state_dict': model.state_dict(),
            'optimizer_state_dict': optimizer.state_dict(),
            'model_name': model_name,
            'num_classes': num_classes,
            'class_names': class_names,
            'input_size': input_size,
            'resize_size': resize_size,
            'use_imagenet_norm': use_imagenet_norm,
            'norm_mean': mean if 'mean' in locals() and use_imagenet_norm else [],
            'norm_std': std if 'std' in locals() and use_imagenet_norm else []
        }
        torch.save(save_data, save_path)

    log("Fine-tuning finished")

    results = {
        'status': 'completed',
        'val_acc': val_final_acc.item()
    }

    # Explicitly clean up to help with memory management in a GUI context
    del model
    del dataloaders
    del image_datasets
    del optimizer
    del train_criterion
    del val_criterion
    if device.type == 'cuda':
        torch.cuda.empty_cache()

    # 11. Return the final validation and test accuracies
    return results

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Fine-tune a model on a new dataset')
    
    parser.add_argument('--data_dir', type=str, required=True, help='Path to the dataset directory')
    parser.add_argument('--model_name', type=str, default='resnet18', help='Name of the model to fine-tune (from timm or Hugging Face)')
    parser.add_argument('--num_epochs', type=int, default=25, help='Number of epochs to train for')
    parser.add_argument('--batch_size', type=int, default=32, help='Batch size for training')
    parser.add_argument('--body_learning_rate', type=float, default=1e-5, help='Learning rate for the model body')
    parser.add_argument('--head_learning_rate', type=float, default=1e-3, help='Learning rate for the classifier head')
    parser.add_argument('--dropout_rate', type=float, default=0.0, help='Dropout rate for the model classifier')
    parser.add_argument('--tuning_strategy', type=str, default='full', choices=['full', 'head_only'], help='Fine-tuning strategy')
    parser.add_argument('--optimiser', type=str, default='adamw', choices=['adam', 'adamw', 'sgd'], help='Optimiser to use for training')
    parser.add_argument('--sgd_momentum', type=float, default=0.9, help='Momentum for SGD optimizer')
    parser.add_argument('--adam_beta1', type=float, default=0.9, help='Beta1 for Adam/AdamW optimizers')
    parser.add_argument('--adam_beta2', type=float, default=0.999, help='Beta2 for Adam/AdamW optimizers')
    parser.add_argument('--adam_eps', type=float, default=1e-8, help='Epsilon for Adam/AdamW optimizers')
    parser.add_argument('--weight_decay', type=float, default=0.0, help='Weight decay for optimizers')
    parser.add_argument('--loss_function', type=str, default='cross_entropy', choices=['cross_entropy', 'label_smoothing'], help='Loss function to use')
    parser.add_argument('--label_smoothing_factor', type=float, default=0.1, help='Label smoothing factor')
    parser.add_argument('--use_weighted_loss', action='store_true', help='Use weighted loss to handle class imbalance')
    parser.add_argument('--early_stopping_patience', type=int, default=0, help='Patience for early stopping (0 to disable)')
    parser.add_argument('--early_stopping_min_delta', type=float, default=0.0, help='Minimum delta for early stopping')
    parser.add_argument('--early_stopping_metric', type=str, default='loss', choices=['loss', 'accuracy'], help='Metric for early stopping')
    parser.add_argument('--mixed_precision', action='store_true', help='Use mixed precision training (AMP)')
    parser.set_defaults(use_imagenet_norm=True)
    parser.add_argument('--no-imagenet-norm', dest='use_imagenet_norm', action='store_false', help='Disable ImageNet normalization')
    parser.add_argument('--norm_mean', type=str, default='0.485, 0.456, 0.406', help='Custom normalization mean')
    parser.add_argument('--norm_std', type=str, default='0.229, 0.224, 0.225', help='Custom normalization standard deviation')
    parser.add_argument('--input_size', type=int, default=224, help='Input image size')
    parser.add_argument('--resize_size', type=int, default=None, help='Size to resize images to before cropping (defaults to 256 for 224 input)')
    parser.add_argument('--num_workers', type=int, default=0, help='Number of data loader workers')
    parser.add_argument('--pin_memory', action='store_true', help='Use pin memory for data loaders')
    parser.add_argument('--train_from_scratch', action='store_true', help='Train model from scratch instead of using pretrained weights')
    parser.add_argument('--strict_load', action='store_true', help='Use strict loading for model state dict')
    parser.add_argument('--train_dir_name', type=str, default='train', help='Name of the training directory')
    parser.add_argument('--val_dir_name', type=str, default='val', help='Name of the validation directory')
    parser.add_argument('--test_dir_name', type=str, default='test', help='Name of the test directory')
    parser.add_argument('--device', type=str, default='auto', help='Device to use for training (e.g., "cpu", "cuda:0")')
    parser.add_argument('--load_path', type=str, default=None, help='Path to load a model state from')
    parser.add_argument('--save_path', type=str, default=None, help='Path to save the trained model state')

    # LR Scheduler args
    parser.add_argument('--lr_scheduler', type=str, default='none', choices=['none', 'cosine'], help='Learning rate scheduler to use')
    parser.add_argument('--cosine_t_max', type=int, default=None, help='T_max for CosineAnnealingLR scheduler (defaults to num_epochs)')
    
    # Augmentation flags
    parser.set_defaults(aug_random_resized_crop=True, aug_horizontal_flip=True, aug_rotation=True, aug_color_jitter=True)
    parser.add_argument('--no-random-resized-crop', dest='aug_random_resized_crop', action='store_false', help='Disable random resized crop and zoom')
    parser.add_argument('--no-horizontal-flip', dest='aug_horizontal_flip', action='store_false', help='Disable random horizontal flip')
    parser.add_argument('--no-rotation', dest='aug_rotation', action='store_false', help='Disable random rotation augmentation')
    parser.add_argument('--no-color-jitter', dest='aug_color_jitter', action='store_false', help='Disable color jitter augmentation')
    parser.add_argument('--aug_rotation_degrees', type=int, default=15, help='Max rotation degrees for augmentation')
    parser.add_argument('--aug_color_jitter_brightness', type=float, default=0.2, help='Brightness for color jitter augmentation')
    parser.add_argument('--aug_color_jitter_contrast', type=float, default=0.2, help='Contrast for color jitter augmentation')
    parser.add_argument('--aug_color_jitter_saturation', type=float, default=0.2, help='Saturation for color jitter augmentation')
    parser.add_argument('--aug_color_jitter_hue', type=float, default=0.1, help='Hue for color jitter augmentation')
    parser.add_argument('--aug_crop_scale_min', type=float, default=0.08, help='Min scale for random resized crop')
    parser.add_argument('--aug_crop_scale_max', type=float, default=1.0, help='Max scale for random resized crop')
    parser.add_argument('--aug_crop_ratio_min', type=float, default=0.75, help='Min aspect ratio for random resized crop')
    parser.add_argument('--aug_crop_ratio_max', type=float, default=1.33, help='Max aspect ratio for random resized crop')

    parser.add_argument('--seed', type=int, default=None, help='Random seed for reproducibility')

    parser.set_defaults(load_truncated_images=True)
    parser.add_argument('--no-load-truncated-images', dest='load_truncated_images', action='store_false', help='Do not attempt to load truncated images')

    args = parser.parse_args()
    main(vars(args))
