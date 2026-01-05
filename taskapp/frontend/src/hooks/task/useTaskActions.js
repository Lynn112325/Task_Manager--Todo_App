import { useDialogs } from "../useDialogs/useDialogs";
import useNotifications from "../useNotifications/useNotifications";

export function useTaskActions({ createTask, updateTask, deleteTask }) {
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

    const deleteTaskCompletion = async (task) => {

        if (!task?.id) {
            console.error("Invalid task:", task);
            return false;
        }

        const confirmed = await dialogs.confirm(
            `Are you sure you want to delete the task "${task.title}"? This action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await deleteTask(task.id);

            notifications.show("Task deleted successfully", {
                severity: "success",
            });

            return true;
        } catch (e) {
            notifications.show("Failed to delete task", {
                severity: "error",
            });
            throw e;
        }
    };

    const createTaskCompletion = async (taskData) => {
        try {
            const createdTask = await createTask(taskData);

            notifications.show('Task created successfully.', {
                severity: 'success',
                autoHideDuration: 3000,
            });

            return createdTask;
        } catch (createError) {
            notifications.show(
                `Failed to create task. Reason: ${createError.message}`,
                { severity: "error", autoHideDuration: 3000 }
            );
            throw createError;
        }
    };

    const editTaskCompletion = async (taskData) => {
        try {
            const editedTask = await updateTask(taskData.id, taskData);
            notifications.show('Task edited successfully.', {
                severity: 'success',
                autoHideDuration: 3000,
            });

            return editedTask;
        } catch (editError) {
            notifications.show(`Failed to edit task. Reason: ${editError.message}`, {
                severity: 'error',
                autoHideDuration: 3000,
            });
            throw editError;
        }
    }

    return {
        toggleTaskCompletion,
        deleteTaskCompletion,
        createTaskCompletion,
        editTaskCompletion,
    };
}

