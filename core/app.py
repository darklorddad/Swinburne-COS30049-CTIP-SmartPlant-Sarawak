import os
import gradio as gr
from gradio_wrapper import (
    classify_plant, show_model_charts, get_model_choices, update_model_choices,
    launch_autotrain_ui, stop_autotrain_ui, generate_manifest, organise_dataset_folders,
    split_dataset
)

DEFAULT_MANIFEST_PATH = os.path.join('core', 'manifest.md').replace(os.sep, '/')

# #############################################################################
# GRADIO UI
# #############################################################################

with gr.Blocks(theme=gr.themes.Monochrome(), css="footer {display: none !important}") as demo:

    gr.HTML(
        """
        <script>
            window.addEventListener('load', () => {
                setInterval(() => {
                    const btn = document.getElementById('model_refresh_button');
                    if (btn) {
                        btn.click();
                    }
                }, 5000);
            });
        </script>
        """,
        visible=False
    )
    refresh_button = gr.Button(elem_id="model_refresh_button", visible=False)

    with gr.Tab("Inference"):
        with gr.Row():
            with gr.Column(scale=1):
                inf_model_path = gr.Dropdown(label="Select model", choices=get_model_choices(), value=None)
                inf_input_image = gr.Image(type="pil", label="Upload a plant image")
            with gr.Column(scale=1):
                inf_output_label = gr.Label(num_top_classes=5, label="Predictions")
                inf_button = gr.Button("Classify", variant="primary")
        inf_button.click(classify_plant, inputs=[inf_model_path, inf_input_image], outputs=inf_output_label)

    with gr.Tab("Training metrics"):
        metrics_model_path = gr.Dropdown(label="Select model", choices=get_model_choices(), value=None)
        with gr.Column(visible=False) as inf_plots_container:
            with gr.Row():
                inf_plot_loss = gr.Plot(label="Loss")
                inf_plot_acc = gr.Plot(label="Accuracy")
            with gr.Row():
                inf_plot_lr = gr.Plot(label="Learning rate")
                inf_plot_grad = gr.Plot(label="Gradient norm")
            with gr.Row():
                inf_plot_f1 = gr.Plot(label="F1 scores")
                inf_plot_prec = gr.Plot(label="Precision")
            with gr.Row():
                inf_plot_recall = gr.Plot(label="Recall")
                inf_plot_epoch = gr.Plot(label="Epoch")
            with gr.Row():
                inf_plot_runtime = gr.Plot(label="Eval runtime")
                inf_plot_sps = gr.Plot(label="Eval samples/sec")
            with gr.Row():
                inf_plot_steps_ps = gr.Plot(label="Eval steps/sec")

        inf_plots = [
            inf_plot_loss, inf_plot_acc, inf_plot_lr, inf_plot_grad, inf_plot_f1,
            inf_plot_prec, inf_plot_recall, inf_plot_epoch, inf_plot_runtime,
            inf_plot_sps, inf_plot_steps_ps
        ]
        inf_model_path.change(
            fn=show_model_charts,
            inputs=[inf_model_path],
            outputs=inf_plots + [inf_plots_container, metrics_model_path]
        )
        metrics_model_path.change(
            fn=show_model_charts,
            inputs=[metrics_model_path],
            outputs=inf_plots + [inf_plots_container, inf_model_path]
        )

    with gr.Tab("Training"):
        with gr.Row():
            train_launch_button = gr.Button("Launch AutoTrain UI")
            train_stop_button = gr.Button("Stop AutoTrain UI", visible=False)
        train_launch_log = gr.Textbox(label="Status", interactive=False)
        
        train_launch_button.click(
            fn=launch_autotrain_ui,
            inputs=[],
            outputs=[train_launch_log, train_launch_button, train_stop_button]
        )
        train_stop_button.click(
            fn=stop_autotrain_ui,
            inputs=[],
            outputs=[train_launch_log, train_launch_button, train_stop_button]
        )

    with gr.Tab("Dataset preparation"):
        with gr.Accordion("Generate directory manifest", open=False):
            with gr.Column():
                dp_directory_path = gr.Textbox(
                    label="Directory path"
                )
                dp_manifest_save_path = gr.Textbox(
                    label="Manifest output path"
                )
                dp_manifest_type = gr.Radio(["Directories only", "Directories and files"], label="Manifest content", value="Directories only")
                dp_generate_button = gr.Button("Generate", variant="primary")
                dp_status_message = gr.Textbox(label="Status", interactive=False, lines=5)
            
            dp_generate_button.click(
                fn=generate_manifest,
                inputs=[dp_directory_path, dp_manifest_save_path, dp_manifest_type],
                outputs=[dp_status_message]
            )

        with gr.Accordion("Organise dataset", open=False):
            with gr.Column():
                do_source_dir = gr.Textbox(
                    label="Source directory"
                )
                do_destination_dir = gr.Textbox(
                    label="Destination directory"
                )
                do_create_button = gr.Button("Organise", variant="primary")
                do_status_message = gr.Textbox(label="Status", interactive=False, lines=5)

            do_create_button.click(
                fn=organise_dataset_folders,
                inputs=[do_destination_dir, do_source_dir],
                outputs=[do_status_message]
            )

        with gr.Accordion("Split dataset", open=False):
            with gr.Column():
                ds_source_dir = gr.Textbox(label="Source directory")
                with gr.Row():
                    ds_train_output_dir = gr.Textbox(label="Train zip output path")
                    ds_val_output_dir = gr.Textbox(label="Validate zip output path")
                    ds_test_output_dir = gr.Textbox(label="Test zip output path", visible=False)
                with gr.Row():
                    ds_train_manifest_path = gr.Textbox(label="Train manifest output path")
                    ds_val_manifest_path = gr.Textbox(label="Validate manifest output path")
                    ds_test_manifest_path = gr.Textbox(label="Test manifest output path", visible=False)
                ds_split_type = gr.Radio(["Train/Validate", "Train/Test/Validate"], label="Split type", value="Train/Validate")
                with gr.Row():
                    ds_train_ratio = gr.Slider(0, 100, value=80, step=1, label="Train %")
                    ds_val_ratio = gr.Slider(0, 100, value=20, step=1, label="Validate %", interactive=False)
                    ds_test_ratio = gr.Slider(0, 100, value=0, step=1, label="Test %", visible=False)
                ds_split_button = gr.Button("Split", variant="primary")
                ds_status_message = gr.Textbox(label="Status", interactive=False, lines=5)

            def update_split_type(split_type):
                is_test_visible = 'Test' in split_type
                if is_test_visible:
                    # Set default ratios for Train/Test/Validate
                    return gr.update(visible=True), gr.update(visible=True), gr.update(visible=True), gr.update(value=80), gr.update(value=10), gr.update(value=10)
                else:
                    # Set default ratios for Train/Validate
                    return gr.update(visible=False), gr.update(visible=False), gr.update(visible=False), gr.update(value=80), gr.update(value=20), gr.update(value=0)

            def update_ratios_from_train(train_r, test_r):
                if train_r + test_r > 100:
                    test_r = 100 - train_r
                val_r = 100 - train_r - test_r
                return gr.update(value=val_r), gr.update(value=test_r)

            def update_ratios_from_test(train_r, test_r):
                if train_r + test_r > 100:
                    train_r = 100 - test_r
                val_r = 100 - train_r - test_r
                return gr.update(value=val_r), gr.update(value=train_r)

            ds_split_type.change(
                fn=update_split_type,
                inputs=ds_split_type,
                outputs=[ds_test_ratio, ds_test_output_dir, ds_test_manifest_path, ds_train_ratio, ds_val_ratio, ds_test_ratio]
            )
            ds_train_ratio.input(fn=update_ratios_from_train, inputs=[ds_train_ratio, ds_test_ratio], outputs=[ds_val_ratio, ds_test_ratio])
            ds_test_ratio.input(fn=update_ratios_from_test, inputs=[ds_train_ratio, ds_test_ratio], outputs=[ds_val_ratio, ds_train_ratio])

            ds_split_button.click(
                fn=split_dataset,
                inputs=[ds_source_dir, ds_train_output_dir, ds_val_output_dir, ds_test_output_dir, ds_train_manifest_path, ds_val_manifest_path, ds_test_manifest_path, ds_split_type, ds_train_ratio, ds_val_ratio, ds_test_ratio],
                outputs=ds_status_message
            )

    refresh_button.click(
        fn=update_model_choices,
        inputs=[],
        outputs=[inf_model_path, metrics_model_path]
    )
    demo.load(
        fn=update_model_choices,
        inputs=[],
        outputs=[inf_model_path, metrics_model_path]
    )

if __name__ == "__main__":
    demo.launch()
