import gradio as gr
from transformers import AutoImageProcessor, AutoModelForImageClassification
import torch
from PIL import Image
import os
import subprocess
import sys
import webbrowser
import time
import requests

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


def generate_manifest(directory_path: str):
    """Generates a manifest file listing all subdirectories."""
    if not directory_path or not os.path.isdir(directory_path):
        raise gr.Error("Please provide a valid directory path.")

    manifest_path = os.path.join(directory_path, 'manifest.txt')
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
