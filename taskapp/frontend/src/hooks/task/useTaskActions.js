import { useDialogs } from "../useDialogs/useDialogs";
import useNotifications from "../useNotifications/useNotifications";

export function useTaskActions({ createTask, updateTask }) {
    const dialogs = useDialogs();
    const notifications = useNotifications();

    // 
    const toggleTaskAction = async (task, requestedStatus = null) => {
        if (!task?.id) return;
        console.log(requestedStatus);
        let targetStatus;

        // Determine the target status to change
        if (requestedStatus) {
            targetStatus = requestedStatus; // Use forced status if provided
        } else {
            // Toggle logic: If completed, revert to ACTIVE
            if (task.status === "COMPLETED") {
                targetStatus = "ACTIVE";
            } else {
                // Otherwise, mark as completed
                targetStatus = "COMPLETED";
            }
        }

        const messages = {
            COMPLETED: `Mark "${task.title}" as completed?`,
            CANCELED: `Are you sure you want to discard "${task.title}"?`,
            ACTIVE: `Mark "${task.title}" as incomplete?`,
        };

        const confirmed = await dialogs.confirm(messages[targetStatus] || "Update task status?");
        if (!confirmed) return;

        try {
            await updateTask(task.id, {
                status: targetStatus,
            });

            notifications.show(`Task marked as ${targetStatus.toLowerCase()}`, {
                severity: targetStatus === "COMPLETED" ? "success" : "info",
            });

            return true;
        } catch (e) {
            notifications.show("Failed to update task", {
                severity: "error",
            });
            return false;
        }
    };

    /**
     * Logically cancels a task instead of deleting it from the database.
     */
    const cancelTaskAction = async (task) => {
        if (!task?.id) {
            console.error("Invalid task:", task);
            return false;
        }

        const confirmed = await dialogs.confirm(
            `Do you want to drop the task "${task.title}"? It will be marked as Canceled but stay in your records.`
        );

        if (!confirmed) return false;

        try {
            await updateTask(task.id, "CANCELED");

            notifications.show("Task has been canceled", {
                severity: "info",
            });
            return true;
        } catch (e) {
            notifications.show("Failed to cancel task", {
                severity: "error",
            });
            throw e;
        }
    };

    const createTaskAction = async (taskData) => {
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

    const editTaskAction = async (taskData) => {
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
        toggleTaskAction,
        cancelTaskAction,
        createTaskAction,
        editTaskAction,
    };
}

