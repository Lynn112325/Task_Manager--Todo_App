import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../axiosConfig";
/**
 * hook to fetch task schedule data, optionally filtered by targetId
 * @param {Object} params
 * @param {number} [params.targetId]
 */
export function useTaskScheduleData({ targetId, enabled = true } = {}) {
    const queryClient = useQueryClient();

    // Query Key contains targetId for caching
    const queryKey = ["task-schedules", { targetId }];

    const query = useQuery({
        queryKey: queryKey,
        queryFn: async () => {
            const res = await axios.get('/api/task_schedules', {
                params: {
                    target_id: targetId
                }
            });
            return res.data?.data ?? [];
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 2,
    });

    const toggleMutation = useMutation({
        // mutationFn: ({ id, newStatus }) => api.toggleStatus(id, newStatus),
        onSuccess: () => {
            // 成功後自動刷新資料
            queryClient.invalidateQueries(queryKey);
        },
    });

    return {
        ...query, // return data, isLoading, error
        taskSchedules: query.data || [],
        refresh: () => queryClient.invalidateQueries(queryKey),
        toggleMutation,
    };
}