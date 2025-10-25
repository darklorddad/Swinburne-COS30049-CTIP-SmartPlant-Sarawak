import gradio as gr
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
from PIL import Image
import os
import subprocess
import sys
import webbrowser
import time
import shutil
import requests
import random
import zipfile
import math

from utils import (
    util_plot_training_metrics
)

AUTOTRAIN_PROCESS = None


def classify_plant(model_path: str, input_image: Image.Image) -> dict:
    if not model_path:
        raise gr.Error("Please select a model directory.")

    model_dir = model_path
    if os.path.isfile(model_path):
        model_dir = os.path.dirname(model_path)

    try:
        image_processor = AutoImageProcessor.from_pretrained(model_dir)
        model = AutoModelForImageClassification.from_pretrained(model_dir)
    except Exception as e:
        raise gr.Error(f"Error loading model from {model_dir}. Check path and files. Original error: {e}")
    inputs = image_processor(images=input_image, return_tensors="pt")
    with torch.no_grad(): outputs = model(**inputs)
    probabilities = torch.nn.functional.softmax(outputs.logits, dim=-1)[0]
    top5_prob, top5_indices = torch.topk(probabilities, 5)
    return {model.config.id2label[i.item()]: p.item() for i, p in zip(top5_indices, top5_prob)}


def launch_autotrain_ui():
    """Launches the AutoTrain Gradio UI and opens it in a new browser tab."""
    global AUTOTRAIN_PROCESS
    command = [sys.executable, "launch_autotrain.py"]
    autotrain_url = "http://localhost:7861"
    try:
        # Redirect stdout/stderr to prevent blocking and hide console window on Windows
        startupinfo = None
        if sys.platform == "win32":
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW

        AUTOTRAIN_PROCESS = subprocess.Popen(
            command,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            startupinfo=startupinfo
        )
        
        # Poll for the server to be ready
        start_time = time.time()
        timeout = 30  # seconds
        server_ready = False
        
        print("Waiting for AutoTrain UI to start...")
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(autotrain_url, timeout=1)
                if response.status_code == 200:
                    print("AutoTrain UI is ready.")
                    server_ready = True
                    break
            except requests.ConnectionError:
                time.sleep(1)
            except requests.Timeout:
                pass # Ignore timeouts and continue polling
        
        if server_ready:
            webbrowser.open(autotrain_url)
            message = f"Successfully launched AutoTrain UI. It should now be open in your web browser at {autotrain_url}."
            print(message)
            return message, gr.update(visible=False), gr.update(visible=True)
        else:
            # Server failed to start within timeout, so we should stop the zombie process.
            stop_autotrain_ui()
            message = f"AutoTrain UI failed to start within {timeout} seconds. The process has been stopped."
            print(message)
            return message, gr.update(visible=True), gr.update(visible=False)

    except Exception as e:
        message = f"Failed to launch AutoTrain UI: {e}"
        print(message)
        return message, gr.update(visible=True), gr.update(visible=False)

def stop_autotrain_ui():
    """Stops the AutoTrain UI process."""
    global AUTOTRAIN_PROCESS
    process = AUTOTRAIN_PROCESS
    if process and process.poll() is None:
        try:
            process.terminate()
            process.wait(timeout=5)
            message = "AutoTrain UI process has been stopped."
        except subprocess.TimeoutExpired:
            process.kill()
            message = "AutoTrain UI process did not stop gracefully and was killed."
        except Exception as e:
            message = f"Error stopping AutoTrain UI: {e}"
            print(message)
            return message, gr.update(visible=False), gr.update(visible=True)
        
        print(message)
        AUTOTRAIN_PROCESS = None
        return message, gr.update(visible=True), gr.update(visible=False)
    else:
        message = "AutoTrain UI process is not running or was already stopped."
        print(message)
        AUTOTRAIN_PROCESS = None
        return message, gr.update(visible=True), gr.update(visible=False)

def show_model_charts(model_dir):
    """Finds trainer_state.json, returns metric plots, and the model_dir for sync."""
    if not model_dir:
        return (None,) * 11 + (gr.update(visible=False), None)

    json_path = None
    for root, _, files in os.walk(model_dir):
        if 'trainer_state.json' in files:
            json_path = os.path.join(root, 'trainer_state.json')
            break

    if not json_path:
        print(f"trainer_state.json not found in {model_dir}")
        return (None,) * 11 + (gr.update(visible=False), model_dir)

    try:
        figures = util_plot_training_metrics(json_path)
        return (
            figures.get('Loss'), figures.get('Accuracy'), figures.get('Learning Rate'),
            figures.get('Gradient Norm'), figures.get('F1 Scores'), figures.get('Precision'),
            figures.get('Recall'), figures.get('Epoch'), figures.get('Eval Runtime'),
            figures.get('Eval Samples/sec'), figures.get('Eval Steps/sec'),
            gr.update(visible=True),
            model_dir
        )
    except Exception as e:
        print(f"Error generating plots for {json_path}: {e}")
        return (None,) * 11 + (gr.update(visible=False), model_dir)


def generate_manifest(directory_path: str, manifest_save_path: str):
    """Generates a manifest file listing all subdirectories."""
    if not directory_path or not os.path.isdir(directory_path):
        raise gr.Error("Please provide a valid directory path.")

    if manifest_save_path:
        # If the provided path is a directory, append the default filename.
        if os.path.isdir(manifest_save_path):
            manifest_path = os.path.join(manifest_save_path, 'manifest.txt')
        else:
            manifest_path = manifest_save_path
    else:
        # Default to saving manifest.txt in the same directory as app.py
        app_dir = os.path.dirname(os.path.abspath(__file__))
        manifest_path = os.path.join(app_dir, 'manifest.txt')

    # Ensure the directory for the manifest file exists
    manifest_dir = os.path.dirname(manifest_path)
    if manifest_dir:
        os.makedirs(manifest_dir, exist_ok=True)

    try:
        subfolders = []
        for root, dirs, _ in os.walk(directory_path):
            dirs.sort()  # Sort in-place for deterministic order
            for d in dirs:
                full_path = os.path.join(root, d)
                relative_path = os.path.relpath(full_path, directory_path)
                subfolders.append(relative_path.replace(os.sep, '/'))

        with open(manifest_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(subfolders))
        
        return f"Successfully generated manifest file at: {manifest_path}"
    except Exception as e:
        raise gr.Error(f"Failed to generate manifest file: {e}")


def organise_dataset_folders(destination_dir: str, source_dir: str):
    """Creates a directory structure for a new dataset by scanning leaf directories from a source and copying files."""
    if not destination_dir:
        raise gr.Error("Please provide a destination directory path.")
    if not source_dir or not os.path.isdir(source_dir):
        raise gr.Error("Please provide a valid source directory path.")

    try:
        leaf_dirs = []
        for root, dirs, _ in os.walk(source_dir):
            # A leaf directory has no subdirectories.
            if not dirs:
                # Exclude the source directory itself if it's a leaf.
                if os.path.abspath(root) != os.path.abspath(source_dir):
                    leaf_dirs.append(root)

        if not leaf_dirs:
            raise gr.Error("No leaf subdirectories found in the source directory. These are needed for class names.")

        # Get unique class names from leaf directory basenames
        class_names = sorted(list(set(os.path.basename(d) for d in leaf_dirs)))

        # Create class directories in destination
        created_folders = []
        for class_name in class_names:
            class_path = os.path.join(destination_dir, class_name)
            os.makedirs(class_path, exist_ok=True)
            created_folders.append(class_name)
        
        copied_files_count = 0
        # Copy files from each leaf directory to the corresponding new class directory
        for src_leaf_dir in leaf_dirs:
            class_name = os.path.basename(src_leaf_dir)
            dest_class_dir = os.path.join(destination_dir, class_name)
            
            for filename in os.listdir(src_leaf_dir):
                src_file_path = os.path.join(src_leaf_dir, filename)
                if os.path.isfile(src_file_path):
                    shutil.copy2(src_file_path, dest_class_dir)
                    copied_files_count += 1
        
        return f"Successfully organised dataset at: {destination_dir}\nCreated subfolders: {', '.join(created_folders)}\nCopied {copied_files_count} files."
    except Exception as e:
        raise gr.Error(f"Failed to organise dataset: {e}")


def split_dataset(source_dir, output_dir, split_type, train_ratio, val_ratio, test_ratio):
    """Splits a dataset into train, validation, and optional test sets."""
    # --- 1. Input Validation ---
    if not source_dir or not os.path.isdir(source_dir): raise gr.Error("Please provide a valid source directory.")
    if not output_dir: raise gr.Error("Please provide a valid output directory.")
    os.makedirs(output_dir, exist_ok=True)

    train_r, val_r, test_r = train_ratio / 100.0, val_ratio / 100.0, test_ratio / 100.0
    total_ratio = train_r + val_r + (test_r if 'Test' in split_type else 0)
    if not math.isclose(total_ratio, 1.0): raise gr.Error(f"Ratios must sum to 100. Current sum is {total_ratio*100:.0f}.")

    # --- 2. Scan for classes and image files ---
    class_files = {}
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff']
    for root, dirs, files in os.walk(source_dir):
        if not dirs:  # It's a leaf directory
            class_name = os.path.basename(root)
            image_files = [os.path.join(root, f) for f in files if os.path.splitext(f)[1].lower() in image_extensions]
            if image_files: class_files[class_name] = image_files

    if not class_files: raise gr.Error("No leaf directories with images found in the source directory.")

    # --- 3. Split files for each class ---
    final_splits = {'train': {}, 'validate': {}}
    if 'Test' in split_type: final_splits['test'] = {}
    min_items_per_class, min_classes_per_set = 5, 2

    for class_name, files in class_files.items():
        random.shuffle(files)
        n_total, start_index = len(files), 0

        # Test split
        if 'Test' in split_type:
            n_test = round(n_total * test_r)
            if 0 < n_test < min_items_per_class: n_test = min_items_per_class
            if n_total - start_index >= n_test and n_test > 0:
                final_splits['test'][class_name] = files[start_index : start_index + n_test]
                start_index += n_test
        
        # Validation split
        n_val = round(n_total * val_r)
        if 0 < n_val < min_items_per_class: n_val = min_items_per_class
        if n_total - start_index >= n_val and n_val > 0:
            final_splits['validate'][class_name] = files[start_index : start_index + n_val]
            start_index += n_val

        # Train split (remaining files)
        n_train = n_total - start_index
        if n_train >= min_items_per_class:
            final_splits['train'][class_name] = files[start_index:]

    # --- 4. Post-split validation ---
    for set_name, classes in final_splits.items():
        if 0 < len(classes) < min_classes_per_set:
            raise gr.Error(f"Could not create '{set_name}' split. It would have only {len(classes)} class(es), but the minimum is {min_classes_per_set}.")

    # --- 5. Create zip archives ---
    temp_base_dir = os.path.join(output_dir, f"temp_split_{int(time.time())}")
    os.makedirs(temp_base_dir, exist_ok=True)
    created_zips = []

    try:
        for set_name, classes in final_splits.items():
            if not classes: continue
            
            set_dir = os.path.join(temp_base_dir, set_name)
            os.makedirs(set_dir, exist_ok=True)
            manifest_content = []

            for class_name, files_to_copy in classes.items():
                class_dir = os.path.join(set_dir, class_name)
                os.makedirs(class_dir)
                manifest_content.append(class_name)
                for f in files_to_copy: shutil.copy2(f, class_dir)
            
            # Write manifest
            with open(os.path.join(set_dir, 'manifest.txt'), 'w', encoding='utf-8') as f:
                f.write('\n'.join(sorted(manifest_content)))

            # Create zip
            zip_path = os.path.join(output_dir, set_name)
            shutil.make_archive(zip_path, 'zip', set_dir)
            created_zips.append(f"{zip_path}.zip")

    finally:
        if os.path.exists(temp_base_dir): shutil.rmtree(temp_base_dir)

    if not created_zips: return "No datasets were created. Check source data and split ratios."
    return f"Successfully created dataset splits: {', '.join(created_zips)}"


def get_model_choices():
    """Returns a list of directories in the current directory that start with 'Model-'."""
    try:
        return [d for d in os.listdir('.') if os.path.isdir(d) and d.startswith('Model-')]
    except FileNotFoundError:
        print("Warning: Could not find the current directory to scan for models.")
        return []

def update_model_choices():
    """Refreshes the list of available models in the dropdowns."""
    choices = get_model_choices()
    return gr.update(choices=choices), gr.update(choices=choices)
