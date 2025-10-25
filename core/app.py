import gradio as gr
from gradio_wrapper import (
    classify_plant, run_organise_dataset, run_normalise_class_names,
    run_normalise_image_names, run_split_dataset, run_generate_manifest,
    run_check_balance, save_balance_analysis, run_count_classes,
    show_model_charts, get_model_choices, update_model_choices,
    launch_autotrain_ui, stop_autotrain_ui
)

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

    with gr.Tab("Training"):
        with gr.Row():
            train_launch_button = gr.Button("Launch autotrain ui")
            train_stop_button = gr.Button("Stop autotrain ui", visible=False)
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
    with gr.Tab("Data preparation"):
        with gr.Accordion("Organise raw dataset", open=False):
            with gr.Row():
                prep_org_train_zip = gr.File(label="Train images zip file")
                prep_org_test_zip = gr.File(label="Test images zip file")
            with gr.Row():
                prep_org_train_txt = gr.File(label="Train annotations file")
                prep_org_test_txt = gr.File(label="Test annotations file")
            prep_org_output_dir = gr.Textbox(label="Output directory name", value="processed_dataset", placeholder="A name for the output directory")
            prep_org_button = gr.Button("Organise dataset")
            prep_org_log = gr.Textbox(label="Log", interactive=False, lines=10)
            prep_org_button.click(run_organise_dataset, inputs=[prep_org_train_zip, prep_org_test_zip, prep_org_train_txt, prep_org_test_txt, prep_org_output_dir], outputs=prep_org_log)
        with gr.Accordion("Normalise class directory names", open=False):
            prep_norm_class_dir = gr.Textbox(label="Target directory name", value="processed_dataset", placeholder="Enter the name of the directory containing class subdirectories")
            prep_norm_class_button = gr.Button("Normalise class names")
            prep_norm_class_log = gr.Textbox(label="Log", interactive=False, lines=10)
            prep_norm_class_button.click(run_normalise_class_names, inputs=[prep_norm_class_dir], outputs=prep_norm_class_log)
        with gr.Accordion("Normalise image filenames", open=False):
            prep_norm_img_dir = gr.Textbox(label="Target directory name", value="processed_dataset", placeholder="Enter the name of the directory to process")
            prep_norm_img_lower = gr.Checkbox(label="Convert filenames to lowercase", value=True)
            prep_norm_img_std = gr.Checkbox(label="Standardise filenames (e.g., class_0001.jpg)", value=True)
            prep_norm_img_button = gr.Button("Process image names")
            prep_norm_img_log = gr.Textbox(label="Log", interactive=False, lines=10)
            prep_norm_img_button.click(run_normalise_image_names, inputs=[prep_norm_img_dir, prep_norm_img_lower, prep_norm_img_std], outputs=prep_norm_img_log)
        with gr.Accordion("Split dataset for autotrain", open=False):
            prep_split_source = gr.Textbox(label="Source directory name", value="processed_dataset", placeholder="Enter the name of the directory to split")
            prep_split_output = gr.Textbox(label="Output directory name", placeholder="e.g., 'autotrain_dataset'")
            prep_split_min = gr.Number(label="Min images per split", value=5)
            prep_split_button = gr.Button("Split dataset")
            prep_split_log = gr.Textbox(label="Log", interactive=False, lines=10)
            prep_split_button.click(run_split_dataset, inputs=[prep_split_source, prep_split_output, prep_split_min], outputs=prep_split_log)

    with gr.Tab("Analysis and utilities"):
        with gr.Accordion("Check dataset balance", open=False):
            analysis_balance_path = gr.Textbox(label="Path to manifest file", placeholder="e.g., 'autotrain_dataset/Dataset-manifest.json'")
            analysis_balance_button = gr.Button("Analyse balance")
            analysis_balance_summary = gr.Textbox(label="Summary", interactive=False, lines=10)
            analysis_balance_plot = gr.Plot(label="Class distribution")
            
            analysis_summary_state = gr.State()
            analysis_plot_state = gr.State()

            with gr.Column(visible=False) as analysis_save_container:
                analysis_save_path = gr.Textbox(label="Save basename", value="analysis_balance", placeholder="e.g., my_dataset_balance")
                analysis_save_button = gr.Button("Save analysis")
                analysis_save_log = gr.Textbox(label="Save log", interactive=False, lines=3)

            analysis_balance_button.click(
                fn=run_check_balance,
                inputs=[analysis_balance_path],
                outputs=[analysis_balance_summary, analysis_balance_plot, analysis_summary_state, analysis_plot_state, analysis_save_container]
            )
            analysis_save_button.click(
                fn=save_balance_analysis,
                inputs=[analysis_summary_state, analysis_plot_state, analysis_save_path],
                outputs=[analysis_save_log]
            )
        with gr.Accordion("Count classes in directory", open=False):
            util_count_dir = gr.Textbox(label="Dataset directory name", value="processed_dataset", placeholder="Enter the name of the directory to count")
            util_count_save = gr.Checkbox(label="Save to manifest file")
            util_count_path = gr.Textbox(label="Manifest file path", value="class_counts.md")
            util_count_button = gr.Button("Count classes")
            util_count_log = gr.Textbox(label="Log", interactive=False, lines=10)
            util_count_button.click(run_count_classes, inputs=[util_count_dir, util_count_save, util_count_path], outputs=util_count_log)
        with gr.Accordion("Generate directory manifest", open=False):
            util_manifest_dir = gr.Textbox(label="Target directory name", value=".", placeholder="Enter the name of the directory to scan")
            util_manifest_save = gr.Checkbox(label="Save manifest to file", value=False)
            util_manifest_path = gr.Textbox(label="Save manifest as", value="manifest.md", visible=False)
            util_manifest_button = gr.Button("Generate manifest")
            util_manifest_log = gr.Textbox(label="Manifest content and log", interactive=False, lines=20)
            util_manifest_save.change(fn=lambda x: gr.update(visible=x), inputs=util_manifest_save, outputs=util_manifest_path)
            util_manifest_button.click(run_generate_manifest, inputs=[util_manifest_dir, util_manifest_save, util_manifest_path], outputs=util_manifest_log)

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
