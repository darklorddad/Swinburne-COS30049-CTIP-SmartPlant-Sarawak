import gradio as gr
from gradio_wrapper import (
    classify_plant, show_model_charts, get_model_choices, update_model_choices,
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
