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
import matplotlib.pyplot as plt

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


def generate_manifest(directory_path: str, manifest_save_path: str, manifest_type: str):
    """Generates a manifest file listing all subdirectories and/or files."""
    if not directory_path or not os.path.isdir(directory_path):
        raise gr.Error("Please provide a valid directory path.")
    if not manifest_save_path:
        raise gr.Error("Please provide a manifest output path.")

    manifest_path = manifest_save_path
    if os.path.isdir(manifest_path):
        manifest_path = os.path.join(manifest_path, 'manifest.md')

    # Ensure the directory for the manifest file exists
    manifest_dir = os.path.dirname(manifest_path)
    if manifest_dir:
        os.makedirs(manifest_dir, exist_ok=True)

    try:
        manifest_items = []
        for root, dirs, files in os.walk(directory_path):
            # To ensure deterministic output, sort dirs and files
            dirs.sort()
            files.sort()
            
            # Add directories to manifest
            for d in dirs:
                full_path = os.path.join(root, d)
                relative_path = os.path.relpath(full_path, directory_path)
                manifest_items.append(relative_path.replace(os.sep, '/'))
            
            # Add files to manifest if requested
            if manifest_type == "Directories and files":
                for f in files:
                    full_path = os.path.join(root, f)
                    relative_path = os.path.relpath(full_path, directory_path)
                    if relative_path != '.':
                        manifest_items.append(relative_path.replace(os.sep, '/'))

        with open(manifest_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sorted(manifest_items)))
        
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


def split_dataset(source_dir, train_zip_path, val_zip_path, test_zip_path, train_manifest_path, val_manifest_path, test_manifest_path, split_type, train_ratio, val_ratio, test_ratio):
    """Splits a dataset into train, validation, and optional test sets."""
    # --- 1. Input Validation ---
    if not source_dir or not os.path.isdir(source_dir): raise gr.Error("Please provide a valid source directory.")
    if not train_zip_path: raise gr.Error("Please provide a training set output path.")
    if not val_zip_path: raise gr.Error("Please provide a validation set output path.")
    if 'Test' in split_type and not test_zip_path: raise gr.Error("Please provide a test set output path.")
    if not train_manifest_path: raise gr.Error("Please provide a train manifest output path.")
    if not val_manifest_path: raise gr.Error("Please provide a validate manifest output path.")
    if 'Test' in split_type and not test_manifest_path: raise gr.Error("Please provide a test manifest output path.")

    output_paths = {'train': train_zip_path, 'validate': val_zip_path}
    manifest_paths = {'train': train_manifest_path, 'validate': val_manifest_path}
    if 'Test' in split_type:
        output_paths['test'] = test_zip_path
        manifest_paths['test'] = test_manifest_path

    for p in list(output_paths.values()) + list(manifest_paths.values()):
        if p:
            os.makedirs(os.path.dirname(p), exist_ok=True)

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

    included_classes, skipped_classes = [], []

    for class_name, files in class_files.items():
        random.shuffle(files)
        n_total = len(files)
        
        # Calculate required items for each split
        n_test = 0
        if 'Test' in split_type:
            n_test = round(n_total * test_r)
            if 0 < n_test < min_items_per_class: n_test = min_items_per_class

        n_val = round(n_total * val_r)
        if 0 < n_val < min_items_per_class: n_val = min_items_per_class
        
        # Calculate remaining for train
        n_train = n_total - n_test - n_val

        # "All-or-nothing" check: A class is included only if every requested set
        # (i.e., ratio > 0) can be created with the minimum number of items.
        is_test_valid = (test_r == 0) or (n_test >= min_items_per_class)
        is_val_valid = (val_r == 0) or (n_val >= min_items_per_class)
        is_train_valid = ((train_r == 0) or (n_train >= min_items_per_class)) and n_train >= 0

        if is_test_valid and is_val_valid and is_train_valid:
            start_index = 0
            if n_test > 0:
                final_splits['test'][class_name] = files[start_index : start_index + n_test]
                start_index += n_test
            if n_val > 0:
                final_splits['validate'][class_name] = files[start_index : start_index + n_val]
                start_index += n_val
            if n_train > 0:
                final_splits['train'][class_name] = files[start_index:]
            included_classes.append(class_name)
        else:
            skipped_classes.append(class_name)

    split_summary = {
        set_name: {'included': included_classes, 'skipped': skipped_classes}
        for set_name in final_splits.keys()
    }

    # --- 4. Post-split validation ---
    for set_name, classes in final_splits.items():
        if 0 < len(classes) < min_classes_per_set:
            raise gr.Error(f"Could not create '{set_name}' split. It would have only {len(classes)} class(es), but the minimum is {min_classes_per_set}.")

    # --- 5. Create zip archives ---
    temp_parent_dir = os.path.join(os.path.dirname(train_zip_path), f"temp_split_{int(time.time())}")
    os.makedirs(temp_parent_dir, exist_ok=True)
    created_zips = []

    try:
        for set_name, classes in final_splits.items():
            if not classes: continue
            
            set_dir = os.path.join(temp_parent_dir, set_name)
            os.makedirs(set_dir, exist_ok=True)
            manifest_files = []

            for class_name, files_to_copy in classes.items():
                class_dir = os.path.join(set_dir, class_name)
                os.makedirs(class_dir)
                for f in files_to_copy:
                    shutil.copy2(f, class_dir)
                    file_name = os.path.basename(f)
                    manifest_path_in_zip = f"{class_name}/{file_name}".replace(os.sep, '/')
                    manifest_files.append(manifest_path_in_zip)
            
            # Build manifest content with summary
            manifest_content = []
            manifest_content.append(f"# {set_name.capitalize()} Set Manifest")
            manifest_content.append("\n## Included Classes")
            manifest_content.extend(sorted(split_summary[set_name]['included']))
            
            if split_summary[set_name]['skipped']:
                manifest_content.append("\n## Skipped Classes (due to minimum item rule)")
                manifest_content.extend(sorted(split_summary[set_name]['skipped']))

            manifest_content.append("\n## File List")
            manifest_content.extend(sorted(manifest_files))

            # Write manifest with relative file paths
            with open(os.path.join(set_dir, 'manifest.md'), 'w', encoding='utf-8') as f:
                f.write('\n'.join(manifest_content))

            # Write manifest to external directory
            external_manifest_path = manifest_paths[set_name]
            with open(external_manifest_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(manifest_content))

            # Create zip in its designated output directory
            zip_path = output_paths[set_name]
            zip_path_base = os.path.splitext(zip_path)[0]
            archive_path = shutil.make_archive(zip_path_base, 'zip', set_dir)
            created_zips.append(archive_path)

    finally:
        if os.path.exists(temp_parent_dir): shutil.rmtree(temp_parent_dir)

    if not created_zips: return "No datasets were created. Check source data and split ratios."
    return f"Successfully created dataset splits: {', '.join(created_zips)}"


def check_dataset_balance(source_dir: str, save_files: bool, chart_save_path: str, manifest_save_path: str):
    """Checks the balance of a dataset by counting files in leaf directories."""
    if not source_dir or not os.path.isdir(source_dir):
        raise gr.Error("Please provide a valid source directory.")

    try:
        class_counts = {}
        for root, dirs, files in os.walk(source_dir):
            if not dirs:  # Leaf directory
                if os.path.abspath(root) != os.path.abspath(source_dir):
                    class_name = os.path.basename(root)
                    class_counts[class_name] = len(files)

        if not class_counts:
            return None, "No leaf directories with items found in the source directory."

        # Sort by count (descending) for the report
        sorted_class_counts = sorted(class_counts.items(), key=lambda item: item[1], reverse=True)
        total_items = sum(class_counts.values())

        # Create plot with classes sorted alphabetically
        plot_classes, plot_counts = zip(*sorted(class_counts.items()))
        fig, ax = plt.subplots(figsize=(12, 7))
        ax.bar(plot_classes, plot_counts)
        ax.set_title('Dataset Class Distribution')
        ax.set_xlabel('Class')
        ax.set_ylabel('Number of Items')
        ax.grid(True, axis='y', linestyle='--', alpha=0.7)
        plt.xticks(rotation=45, ha='right')
        plt.tight_layout()

        status_messages = ["Successfully generated balance chart and statistics."]
        
        # Generate report content
        report_lines = ["\n## Dataset Statistics"]
        if total_items > 0:
            report_lines.append(f"Total Classes: {len(sorted_class_counts)}")
            report_lines.append(f"Total Items: {total_items}")
            
            # Add most and least common classes
            most_common_name, most_common_count = sorted_class_counts[0]
            least_common_name, least_common_count = sorted_class_counts[-1]
            most_common_ratio = (most_common_count / total_items) * 100
            least_common_ratio = (least_common_count / total_items) * 100
            report_lines.append(f"Most Common: '{most_common_name}' with {most_common_count} items ({most_common_ratio:.2f}%)")
            report_lines.append(f"Least Common: '{least_common_name}' with {least_common_count} items ({least_common_ratio:.2f}%)")
            if least_common_count > 0:
                imbalance_ratio = most_common_count / least_common_count
                report_lines.append(f"Imbalance Ratio (Most/Least): {imbalance_ratio:.1f}:1")

            report_lines.append("\n### Class Counts and Ratios")
            for class_name, count in sorted_class_counts:
                ratio = (count / total_items) * 100
                report_lines.append(f"- {class_name}: {count} items ({ratio:.2f}%)")
        else:
            report_lines.append("No items found.")
        
        status_messages.extend(report_lines)

        # Save chart and manifest if requested
        if save_files:
            if chart_save_path:
                try:
                    chart_dir = os.path.dirname(chart_save_path)
                    if chart_dir:
                        os.makedirs(chart_dir, exist_ok=True)
                    fig.savefig(chart_save_path)
                    status_messages.append(f"Chart saved to: {chart_save_path}")
                except Exception as e:
                    status_messages.append(f"Warning: Could not save chart: {e}")

            if manifest_save_path:
                try:
                    manifest_dir = os.path.dirname(manifest_save_path)
                    if manifest_dir:
                        os.makedirs(manifest_dir, exist_ok=True)

                    manifest_content = ["# Dataset Balance Manifest"] + report_lines

                    with open(manifest_save_path, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(manifest_content))
                    status_messages.append(f"Manifest saved to: {manifest_save_path}")
                except Exception as e:
                    status_messages.append(f"Warning: Could not save manifest: {e}")

        return fig, '\n'.join(status_messages)

    except Exception as e:
        raise gr.Error(f"Failed to check dataset balance: {e}")


def check_dataset_splittability(source_dir, split_type, train_ratio, val_ratio, test_ratio):
    """Simulates dataset splitting and provides a detailed report on included and skipped classes."""
    
    def _generate_category_stats(class_dict, category_name):
        """Helper to generate summary statistics for a dictionary of classes."""
        report_lines = [f"\n## {category_name} Classes"]
        if not class_dict:
            report_lines.append("None.")
            return report_lines

        num_classes = len(class_dict)
        total_items = sum(d['count'] for d in class_dict.values())
        
        report_lines.append(f"Total Classes: {num_classes}")
        report_lines.append(f"Total Items: {total_items}")

        if num_classes > 1:
            sorted_by_count = sorted(class_dict.items(), key=lambda item: item[1]['count'], reverse=True)
            most_common_name, most_common_data = sorted_by_count[0]
            least_common_name, least_common_data = sorted_by_count[-1]
            
            report_lines.append(f"Most Common: '{most_common_name}' with {most_common_data['count']} items")
            report_lines.append(f"Least Common: '{least_common_name}' with {least_common_data['count']} items")
            
            if least_common_data['count'] > 0:
                ratio = most_common_data['count'] / least_common_data['count']
                report_lines.append(f"Imbalance Ratio (Most/Least): {ratio:.1f}:1")
        elif num_classes == 1:
            class_name, data = list(class_dict.items())[0]
            report_lines.append(f"Only one class: '{class_name}' with {data['count']} items")

        return report_lines

    # --- 1. Input Validation ---
    if not source_dir or not os.path.isdir(source_dir):
        raise gr.Error("Please provide a valid source directory.")
    
    train_r, val_r, test_r = train_ratio / 100.0, val_ratio / 100.0, test_ratio / 100.0
    total_ratio = train_r + val_r + (test_r if 'Test' in split_type else 0)
    if not math.isclose(total_ratio, 1.0):
        raise gr.Error(f"Ratios must sum to 100. Current sum is {total_ratio*100:.0f}.")

    # --- 2. Scan for classes and file counts ---
    class_counts = {}
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.tiff']
    for root, dirs, files in os.walk(source_dir):
        if not dirs:  # It's a leaf directory
            class_name = os.path.basename(root)
            image_files = [f for f in files if os.path.splitext(f)[1].lower() in image_extensions]
            if image_files:
                class_counts[class_name] = len(image_files)

    if not class_counts:
        return "No leaf directories with images found in the source directory."

    # --- 3. Simulate splitting to categorise classes ---
    included_classes, skipped_classes = {}, {}
    min_items_per_class, min_classes_per_set = 5, 2

    for class_name, n_total in class_counts.items():
        # Calculate required items for each split, storing raw ratio-based values
        n_test, n_test_raw = 0, 0
        if 'Test' in split_type:
            n_test_raw = round(n_total * test_r)
            n_test = n_test_raw
            if 0 < n_test < min_items_per_class: n_test = min_items_per_class

        n_val_raw = round(n_total * val_r)
        n_val = n_val_raw
        if 0 < n_val < min_items_per_class: n_val = min_items_per_class
        
        n_train = n_total - n_test - n_val

        # "All-or-nothing" check
        is_test_valid = (test_r == 0) or (n_test >= min_items_per_class)
        is_val_valid = (val_r == 0) or (n_val >= min_items_per_class)
        is_train_valid = ((train_r == 0) or (n_train >= min_items_per_class)) and n_train >= 0

        if is_test_valid and is_val_valid and is_train_valid:
            included_classes[class_name] = {'count': n_total, 'splits': {'train': n_train, 'validate': n_val, 'test': n_test}}
        else:
            reasons = []
            if n_train < 0:
                reasons.append(f"total items are too low (needs {n_test + n_val} for test/val, has {n_total})")
            else:
                if test_r > 0 and not is_test_valid:
                    reason = f"test set needs {min_items_per_class}"
                    if n_test_raw < min_items_per_class:
                        reason += f" (ratio gave {n_test_raw})"
                    reasons.append(reason)
                if val_r > 0 and not is_val_valid:
                    reason = f"validation set needs {min_items_per_class}"
                    if n_val_raw < min_items_per_class:
                        reason += f" (ratio gave {n_val_raw})"
                    reasons.append(reason)
                if train_r > 0 and not is_train_valid:
                    reasons.append(f"train set needs {min_items_per_class} (only {n_train} left)")
            
            reason_str = "insufficient items: " + ", ".join(reasons) if reasons else "an unknown reason"
            skipped_classes[class_name] = {'count': n_total, 'reason': reason_str}

    # --- 4. Generate report ---
    report_lines = ["# Splittability Report"]
    report_lines.extend(_generate_category_stats(included_classes, "Included"))
    report_lines.extend(_generate_category_stats(skipped_classes, "Skipped"))

    if included_classes:
        report_lines.append("\n## Included Set Breakdown")
        set_names = ['train', 'validate']
        if 'Test' in split_type: set_names.append('test')

        for set_name in set_names:
            report_lines.append(f"\n### {set_name.capitalize()} Set")
            set_class_counts = {name: data['splits'][set_name] for name, data in included_classes.items() if data['splits'][set_name] > 0}
            
            num_included = len(set_class_counts)
            if 0 < num_included < min_classes_per_set:
                report_lines.append(f"WARNING: This set would not be created. It has only {num_included} class(es), but the minimum is {min_classes_per_set}.")
            
            if not set_class_counts:
                report_lines.append("No classes will be included in this set.")
                continue

            report_lines.append(f"Total classes: {num_included}")
            report_lines.append(f"Total items: {sum(set_class_counts.values())}")
            report_lines.append("\n#### Class Counts")
            for class_name, count in sorted(set_class_counts.items()):
                report_lines.append(f"- {class_name}: {count} items")

    if skipped_classes:
        report_lines.append("\n## Skipped Class Details")
        report_lines.append("Classes are skipped if they don't have enough items for the required splits.")
        for name, data in sorted(skipped_classes.items()):
            report_lines.append(f"- {name} ({data['count']} items): Skipped because it {data['reason']}")

    return '\n'.join(report_lines)


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
