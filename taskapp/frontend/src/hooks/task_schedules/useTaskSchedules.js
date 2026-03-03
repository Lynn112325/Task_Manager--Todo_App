import { useMemo } from 'react';
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
        refresh,

        saveAction,
        toggleStatusAction,
        deleteAction,
        isUpdating,
    } = useTaskScheduleData({ targetId, enabled });

    // Use fetched data if available, otherwise fall back to initialData or empty array
    const sourceData = fetchedData.length > 0 ? fetchedData : (initialData || []);

    // Filter Logic: Filter data based on internal state
    const filterTools = useTaskScheduleFilters(sourceData);

    // Use useMemo to avoid unnecessary re-renders of consuming components
    const returnValue = useMemo(() => ({
        // Data: Filtered schedules based on filter state
        taskSchedules: filterTools.filteredSchedules,
        totalCount: sourceData.length,

        // Status: Loading and mutation states
        isLoading: isFetching,
        error,
        isUpdating,

        // Filter Tools: Contains filter state and setters
        ...filterTools,

        // Actions: Methods to interact with data
        refresh,
        saveAction,
        toggleStatusAction,
        deleteAction,
        isUpdating,
    }), [
        filterTools,
        sourceData,
        isFetching,
        isUpdating,
        error,
        refresh,
        saveAction,
        toggleStatusAction,
        deleteAction,
    ]);

    return returnValue;
}