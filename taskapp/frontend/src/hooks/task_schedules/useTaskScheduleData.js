import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
import { useDialogs } from "../useDialogs/useDialogs";
import useNotifications from "../useNotifications/useNotifications";

const API_URL = "/api/task_schedules";
const TASK_KEY = "task-schedules"; // Unified Query Key definition

/**
 * Custom hook to manage task schedule data (CRUD operations).
 * Integrates data fetching, state updates, notifications, and confirmation dialogs.
 * * @param {Object} options - Configuration options for the hook.
 * @param {string|number} options.targetId - The ID used to filter task schedules (e.g., specific project or user).
 * @param {boolean} [options.enabled=true] - Whether the initial query should be automatically executed.
 * @returns {Object} An object containing the query status, task data, and action handlers.
 */
export function useTaskScheduleData({ targetId, enabled = true } = {}) {
    const queryClient = useQueryClient();
    const notifications = useNotifications();
    const dialogs = useDialogs();

    // --- 1. Data Fetching (Query) ---
    const queryKey = [TASK_KEY, { targetId }];

    /**
     * Main query to fetch task schedules from the server.
     */
    const query = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const res = await axios.get(API_URL, {
                params: { target_id: targetId }
            });
            return res.data?.data ?? [];
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    });

    // --- 2. Shared Refresh Logic ---
    /**
     * Invalidates related queries to trigger a UI re-fetch.
     */
    const refreshData = () => {
        // Refresh current list
        queryClient.invalidateQueries({ queryKey: [TASK_KEY] });
        // Synchronously refresh related metrics data
        queryClient.invalidateQueries({ queryKey: ['metrics'] });
    };

    // --- 3. Mutations ---

    /** Update status (Active/Paused) */
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }) => {
            const response = await axios.patch(`${API_URL}/${id}/status`, { status });
            return response.data.data;
        },
        onSuccess: (data) => {
            refreshData();
            notifications.show(data?.systemMessage || "Status updated", {
                severity: 'success',
                autoHideDuration: 3000,
            });
        },
        onError: () => notifications.show("Failed to update status", {
            severity: 'error',
            autoHideDuration: 3000,
        })
    });

    /** Create new schedule */
    const createMutation = useMutation({
        mutationFn: async (data) => {
            const response = await axios.post(API_URL, data);
            return response.data.data;
        },
        onSuccess: () => {
            refreshData();
            notifications.show("Schedule created successfully", {
                severity: 'success',
                autoHideDuration: 3000,
            });
        },
        onError: (err) => notifications.show(err.response?.data?.message || "Creation failed", {
            severity: 'error',
            autoHideDuration: 3000,
        })
    });

    /** Update existing schedule (Full update) */
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await axios.put(`${API_URL}/${id}`, data);
            return response.data.data;
        },
        onSuccess: () => {
            notifications.show("Schedule updated successfully", {
                severity: 'success',
                autoHideDuration: 3000,
            });
            refreshData();
        },
        onError: () => notifications.show("Update failed", {
            severity: 'error',
            autoHideDuration: 3000,
        })
    });

    /** Delete a schedule */
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            await axios.delete(`${API_URL}/${id}`);
        },
        onSuccess: () => {
            refreshData();
            notifications.show("Schedule deleted successfully", {
                severity: 'success',
                autoHideDuration: 3000,
            });
        },
        onError: () => notifications.show("Delete failed", {
            severity: 'error',
            autoHideDuration: 3000,
        })
    });

    // --- 4. Encapsulated Action Handlers ---

    /**
     * Unified save handler for both Create and Update operations.
     * @param {string|number|null} id - The ID of the schedule (null for creation).
     * @param {Object} payload - The form data to be saved.
     */
    const saveAction = async (id, payload) => {
        // Defensive check to prevent accidental object passing to ID
        if (id && typeof id === 'object') {
            console.error("Critical Error: 'id' passed to saveAction is an object.", id);
            return Promise.reject(new Error("Invalid ID format"));
        }

        return id
            ? updateMutation.mutateAsync({ id, data: payload })
            : createMutation.mutateAsync(payload);
    };

    /**
     * Toggles the active status with a user confirmation dialog.
     * @param {Object} schedule - The schedule object to toggle.
     */
    const toggleStatusAction = async (schedule) => {
        const { taskTemplate, recurringPlan } = schedule;
        if (!taskTemplate?.id) return;
        const nextStatus = recurringPlan.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';

        const confirmed = await dialogs.confirm(
            nextStatus === 'PAUSED'
                ? `Pause "${taskTemplate.title}"? New tasks will stop generating.`
                : `Resume "${taskTemplate.title}"?`
        );

        if (confirmed) {
            return updateStatusMutation.mutateAsync({ id: taskTemplate?.id, status: nextStatus });
        }
    };

    /**
     * Deletes a schedule with a user confirmation dialog.
     * @param {Object} schedule - The schedule object to delete.
     */
    const deleteAction = async (schedule) => {
        const { taskTemplate } = schedule;
        const confirmed = await dialogs.confirm(`Delete "${taskTemplate.title}"? This cannot be undone.`);
        if (confirmed) {
            return deleteMutation.mutateAsync(taskTemplate.id);
        }
    };

    // --- 5. Hook Returns ---
    return {
        // Data and Query states
        ...query,
        taskSchedules: query.data || [],

        // Public Action Methods
        saveAction,
        toggleStatusAction,
        deleteAction,
        refresh: refreshData,

        // Global updating state (useful for showing loading overlays)
        isUpdating:
            updateStatusMutation.isPending ||
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending
    };
}