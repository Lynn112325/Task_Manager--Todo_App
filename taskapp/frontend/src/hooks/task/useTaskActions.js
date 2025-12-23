import { useDialogs } from "../useDialogs/useDialogs";
import useNotifications from "../useNotifications/useNotifications";

export function useTaskActions({ updateTask, deleteTask }) {
    const dialogs = useDialogs();
    const notifications = useNotifications();

    const toggleTaskCompletion = async (task) => {
        const confirmed = await dialogs.confirm(
            `Mark task "${task.title}" as ${task.isCompleted ? "uncompleted" : "completed"}?`
        );

        if (!confirmed) return;

        try {
            await updateTask(task.id, {
                isCompleted: !task.isCompleted,
            });

            notifications.show("Task updated successfully", {
                severity: "success",
            });
        } catch {
            notifications.show("Failed to update task", {
                severity: "error",
            });
        }
    };

    return {
        toggleTaskCompletion,
    };
}

