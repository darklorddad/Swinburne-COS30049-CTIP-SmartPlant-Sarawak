import flet as ft
from flet.matplotlib_chart import MatplotlibChart
import matplotlib.pyplot as plt
import numpy as np

def create_plots(history):
    """Creates and returns matplotlib figures for loss and accuracy."""
    plt.style.use('dark_background')

    # Plot for loss
    fig_loss, ax_loss = plt.subplots()
    ax_loss.plot(history.get('train_loss', []), label='Train Loss')
    ax_loss.plot(history.get('val_loss', []), label='Validation Loss')
    ax_loss.set_xlabel('Epoch')
    ax_loss.set_ylabel('Loss')
    ax_loss.legend()
    ax_loss.set_title('Loss over Epochs')
    fig_loss.tight_layout()
    
    # Plot for accuracy
    fig_acc, ax_acc = plt.subplots()
    ax_acc.plot(history.get('train_acc', []), label='Train Accuracy')
    ax_acc.plot(history.get('val_acc', []), label='Validation Accuracy')
    ax_acc.set_xlabel('Epoch')
    ax_acc.set_ylabel('Accuracy')
    ax_acc.legend()
    ax_acc.set_title('Accuracy over Epochs')
    fig_acc.tight_layout()
    
    return fig_loss, fig_acc

def create_confusion_matrix_table(cm, class_names):
    """Creates a Flet DataTable for the confusion matrix."""
    if not cm or not class_names:
        return ft.Text("Confusion matrix not available.")

    columns = [ft.DataColumn(ft.Text("Actual \\ Pred"))] + [ft.DataColumn(ft.Text(name)) for name in class_names]
    
    rows = []
    for i, class_name in enumerate(class_names):
        cells = [ft.DataCell(ft.Text(class_name, weight=ft.FontWeight.BOLD))]
        for j in range(len(class_names)):
            cells.append(ft.DataCell(ft.Text(str(cm[i][j]))))
        rows.append(ft.DataRow(cells=cells))

    return ft.DataTable(columns=columns, rows=rows)

def create_evaluation_view(results, on_save_callback):
    """Creates the Flet view for the Evaluation tab based on results."""
    if not results:
        return ft.Column([ft.Text("No evaluation results available. Run fine-tuning first.", size=16)], alignment=ft.MainAxisAlignment.CENTER, horizontal_alignment=ft.CrossAxisAlignment.CENTER, expand=True)

    history = results.get('history', {})
    val_cm = results.get('val_cm')
    test_cm = results.get('test_cm')
    class_names = results.get('class_names', [])
    val_acc = results.get('val_acc', 0)
    val_loss = results.get('val_loss', 0)
    test_acc = results.get('test_acc')
    test_loss = results.get('test_loss')

    # Create plots
    fig_loss, fig_acc = create_plots(history)
    loss_chart = MatplotlibChart(fig_loss, expand=True)
    acc_chart = MatplotlibChart(fig_acc, expand=True)

    # Create CM tables
    val_cm_table = create_confusion_matrix_table(val_cm, class_names)
    test_cm_table = create_confusion_matrix_table(test_cm, class_names)

    # Summary text
    summary_items = [
        ft.Text(f"Final Validation Accuracy: {val_acc:.4f}", size=16),
        ft.Text(f"Final Validation Loss: {val_loss:.4f}", size=16),
    ]
    if test_acc is not None:
        summary_items.append(ft.Text(f"Final Test Accuracy: {test_acc:.4f}", size=16))
    if test_loss is not None:
        summary_items.append(ft.Text(f"Final Test Loss: {test_loss:.4f}", size=16))

    return ft.Column(
        [
            ft.Row(
                [
                    ft.Text("Evaluation Results", theme_style=ft.TextThemeStyle.HEADLINE_SMALL, expand=True),
                    ft.ElevatedButton("Save Results", icon=ft.icons.SAVE, on_click=on_save_callback)
                ],
                alignment=ft.MainAxisAlignment.SPACE_BETWEEN
            ),
            ft.Divider(),
            *summary_items,
            ft.Divider(),
            ft.Text("Performance Charts", theme_style=ft.TextThemeStyle.TITLE_LARGE),
            ft.Row([loss_chart, acc_chart], alignment=ft.MainAxisAlignment.SPACE_AROUND, vertical_alignment=ft.CrossAxisAlignment.START),
            ft.Divider(),
            ft.Text("Validation Set Confusion Matrix", theme_style=ft.TextThemeStyle.TITLE_LARGE),
            ft.Container(content=val_cm_table, alignment=ft.alignment.center),
            ft.Divider(),
            ft.Text("Test Set Confusion Matrix", theme_style=ft.TextThemeStyle.TITLE_LARGE),
            ft.Container(content=test_cm_table, alignment=ft.alignment.center),
        ],
        spacing=20,
        scroll=ft.ScrollMode.ADAPTIVE,
        horizontal_alignment=ft.CrossAxisAlignment.STRETCH,
    )
