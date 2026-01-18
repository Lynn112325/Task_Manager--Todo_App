import { useCallback, useMemo, useState } from 'react';
import { useTaskScheduleData } from "./useTaskScheduleData";
import { useTaskScheduleFilters } from "./useTaskScheduleFilters";

export function useTaskSchedules(options = {}) {
    const { targetId, initialData } = options;

    const {
        taskSchedules: fetchedData,
        isLoading: isFetching,
        error,
        refresh
    } = useTaskScheduleData({ targetId, enabled: !initialData });

    // Use fetched data if available, otherwise fall back to initialData
    const sourceData = fetchedData.length > 0 ? fetchedData : (initialData || []);

    // Filters Logic
    const filterTools = useTaskScheduleFilters(sourceData);

    const [isMutating, setIsMutating] = useState(false);

    // Actions 
    const handleToggleStatus = useCallback(async (id, currentStatus) => {
        setIsMutating(true);
        try {
            // [優化 4] 呼叫真實 API
            // 這裡可以做「樂觀更新 (Optimistic Update)」：先改本地 state，失敗再改回來 (進階)
            // 為了簡單起見，這裡展示標準的 "Await -> Refresh" 流程
            // await api.toggleTaskScheduleStatus(id, !currentStatus);

            await refresh();
        } catch (err) {
            console.error("Toggle failed:", err);
        } finally {
            setIsMutating(false);
        }
    }, [refresh]);

    // use useMemo to avoid unnecessary re-renders
    const returnValue = useMemo(() => ({
        // Data
        taskSchedules: filterTools.filteredSchedules,
        totalCount: sourceData.length,

        // Status
        isLoading: isFetching,
        isMutating, // added mutation state
        error,

        // Filters
        ...filterTools,

        // Actions
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