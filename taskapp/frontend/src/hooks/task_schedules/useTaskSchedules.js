import { useCallback, useMemo, useState } from 'react';
import { useTaskScheduleData } from "./useTaskScheduleData";
import { useTaskScheduleFilters } from "./useTaskScheduleFilters";

/**
 * Custom hook to fetch and manage task schedules.
 * Supports filtering and status toggling.
 */
export function useTaskSchedules(queryOptions = {}, enabled) {
    // Extract targetId and initialData from queryOptions
    const { targetId, initialData } = queryOptions;

    // Fetch data using TaskScheduleData hook
    const {
        taskSchedules: fetchedData,
        isLoading: isFetching,
        error,
        refresh
    } = useTaskScheduleData({ targetId, enabled });

    // Use fetched data if available, otherwise fall back to initialData or empty array
    const sourceData = fetchedData.length > 0 ? fetchedData : (initialData || []);

    // Filter Logic: Filter data based on internal state
    const filterTools = useTaskScheduleFilters(sourceData);

    // State to track if a mutation (e.g., status change) is in progress
    const [isMutating, setIsMutating] = useState(false);

    // Actions: Toggle schedule status (Active/Paused)
    const handleToggleStatus = useCallback(async (id, currentStatus) => {
        setIsMutating(true);
        try {
            // [TODO] Call actual API here
            // await api.toggleTaskScheduleStatus(id, !currentStatus);

            // Refresh data after successful mutation
            await refresh();
        } catch (err) {
            console.error("Toggle failed:", err);
        } finally {
            setIsMutating(false);
        }
    }, [refresh]);

    // Use useMemo to avoid unnecessary re-renders of consuming components
    const returnValue = useMemo(() => ({
        // Data: Filtered schedules based on filter state
        taskSchedules: filterTools.filteredSchedules,
        totalCount: sourceData.length,

        // Status: Loading and mutation states
        isLoading: isFetching,
        isMutating,
        error,

        // Filter Tools: Contains filter state and setters
        ...filterTools,

        // Actions: Methods to interact with data
        refresh,
        handleToggleStatus
    }), [
        filterTools,
        sourceData,
        isFetching,
        isMutating,
        error,
        refresh,
        handleToggleStatus
    ]);

    return returnValue;
}