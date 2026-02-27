import { keepPreviousData, useQuery } from '@tanstack/react-query';
import axios from "../../axiosConfig";

/**
 * Custom hook to fetch performance metrics.
 * @param {number|null} targetId - The ID of the target. If null, global metrics are fetched.
 * @param {'weekly'|'monthly'} type - The timeframe for metrics (weekly or monthly).
 * @returns {UseQueryResult} The query result containing metrics data, loading state, and error state.
 */
export const useMetrics = (targetId = null, type = 'weekly') => {
    return useQuery({
        // The queryKey includes both type and targetId to ensure the cache invalidates 
        // and refetches when parameters change.
        queryKey: ['metrics', type, targetId],

        queryFn: async () => {
            const response = await axios.get(`/api/metrics/${type}`, {
                params: {
                    // Using undefined ensures the parameter is omitted from the URL if targetId is null
                    targetId: targetId || undefined
                }
            });
            // Extracts data from the standard CommonResponse structure { data: { data: ... } }
            return response.data.data;
        },

        // --- Optimization Parameters ---

        // Data is considered fresh for 5 minutes; prevents redundant network requests.
        staleTime: 1000 * 60 * 5,

        // Keeps data from the previous query while fetching new data
        // This prevents UI flickering when switching between different targetIds.
        placeholderData: keepPreviousData,
    });
};

/**
 * Convenience hook for fetching weekly metrics.
 */
export const useWeeklyMetrics = (targetId) => useMetrics(targetId, 'weekly');

/**
 * Convenience hook for fetching monthly metrics.
 */
export const useMonthlyMetrics = (targetId) => useMetrics(targetId, 'monthly');