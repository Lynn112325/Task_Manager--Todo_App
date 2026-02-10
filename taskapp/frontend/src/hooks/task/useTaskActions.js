import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { useDialogs } from "../useDialogs/useDialogs";
import useNotifications from "../useNotifications/useNotifications";

const API_URL = "/api/tasks";

export function useTaskActions() {
    const dialogs = useDialogs();
    const notifications = useNotifications();
    const queryClient = useQueryClient();

    const invalidateAllTasks = () => {
        return queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    /**
     * Action to manually refresh all task data
     */
    const refreshAction = async () => {
        try {
            await invalidateAllTasks();
            notifications.show("Tasks updated", {
                severity: "success",
                autoHideDuration: 2000,
            });
            return true;
        } catch (error) {
            notifications.show("Failed to refresh tasks", {
                severity: "error",
            });
            return false;
        }
    };

    const createTaskMutation = useMutation({
        mutationFn: (data) => axios.post(API_URL, data).then(r => r.data.data),
        onSuccess: invalidateAllTasks
    });

    const updateTaskMutation = useMutation({
        mutationFn: ({ id, data }) => axios.patch(`${API_URL}/${id}`, data).then(r => r.data.data),
        onSuccess: invalidateAllTasks
    });

    // const deleteTaskMutation = useMutation({
    //     mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
    //     onSuccess: invalidateAllTasks
    // });
    // 

    const toggleTaskAction = async (task, requestedStatus = null) => {
        if (!task?.id) return;

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
            CANCELED: `Mark "${task.title} as canceled?`,
            ACTIVE: `Mark "${task.title}" as incomplete?`,
        };

        const confirmed = await dialogs.confirm(messages[targetStatus] || "Update task status?");
        if (!confirmed) return;

        try {
            const updatedTask = await updateTaskMutation.mutateAsync({
                id: task.id,
                data: { status: targetStatus }
            });

            const msg = updatedTask.systemMessage;
            notifications.show(msg, {
                severity: 'success',
                autoHideDuration: 3000,
            });

            return true;
        } catch (e) {
            notifications.show("Failed to update task", {
                severity: "error",
                autoHideDuration: 3000,
            });
            return false;
        }
    };

    /**
     * Logically cancels a task instead of deleting it from the database.
     * not on use
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
            await updateTaskMutation.mutateAsync({
                id: task.id,
                data: { status: "CANCELED" }
            });

            notifications.show("Task has been canceled", {
                severity: "info",
                autoHideDuration: 3000,
            });
            return true;
        } catch (e) {
            notifications.show("Failed to cancel task", {
                severity: "error",
                autoHideDuration: 3000,
            });
            throw e;
        }
    };

    const createTaskAction = async (taskData) => {
        try {
            const createdTask = await createTaskMutation.mutateAsync(taskData);;

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
            const editedTask = await updateTaskMutation.mutateAsync({
                id: taskData.id,
                data: taskData
            });

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
        // cancelTaskAction,
        createTaskAction,
        editTaskAction,
        refreshAction
    };
}

