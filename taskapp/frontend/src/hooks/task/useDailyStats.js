import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import axios from '../../axiosConfig';

// Define constants for API paths to avoid Magic Strings across the codebase
const API_BASE = '/api/tasks';

/**
 * Custom Hook to fetch daily statistics data
 * @param {Date | string} date - Date object or date string
 */
export function useDailyStats(date) {
    // Optimization: Ensure robust date string conversion using dayjs
    const dateStr = date ? dayjs(date).format("YYYY-MM-DD") : null;

    return useQuery({
        // queryKey: Using an object-style or explicit hierarchical array for better cache management
        queryKey: ['tasks', 'stats', 'daily', dateStr],

        queryFn: async ({ signal }) => {
            // Optimization 1: Pass parameters as an object for better readability
            // Optimization 2: Support AbortSignal for automatic request cancellation by React Query
            const { data } = await axios.get(`${API_BASE}/stats/daily`, {
                params: { date: dateStr },
                signal
            });

            // Return data based on CommonResponse structure, providing fallback defaults
            return data?.data ?? { active: 0, completed: 0, canceled: 0 };
        },

        // Only trigger the query if a valid date string exists
        enabled: Boolean(dateStr),

        // Cache Configuration
        staleTime: 1000 * 60 * 5, // 5 minutes: Data is considered fresh for this duration
        gcTime: 1000 * 60 * 30,    // 30 minutes: Garbage collection timeout for inactive queries

        // UX Enhancement: Keep previous data while fetching new data to prevent UI flickering
        placeholderData: (previousData) => previousData,
    });
}