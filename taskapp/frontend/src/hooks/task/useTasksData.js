import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import axios from "../../axiosConfig";

const API_URL = "/api/tasks";

export function useTasksData(selectedDate = null) {
    const queryClient = useQueryClient();

    // --- Date Setup ---
    const today = dayjs();
    const currentMonthStr = today.format("YYYY-MM");
    const nextMonthStr = today.add(1, "month").format("YYYY-MM");

    // If no date is selected, default to current month
    const selectedMonthStr = selectedDate
        ? dayjs(selectedDate).format("YYYY-MM")
        : currentMonthStr;

    // Check if today is within the last 7 days of the month
    const isEndOfMonth = today.date() > (today.daysInMonth() - 7);

    // --- Queries ---

    // 1. OVERDUE: Fetch all active tasks from the past (High Priority)
    const overdueQuery = useQuery({
        queryKey: ["tasks", "overdue"],
        queryFn: () => axios.get(`${API_URL}?status=active&overdue=true`).then(res => res.data.data),
        staleTime: 1000 * 60 * 2,
    });

    // 2. CURRENT MONTH: Always synced (used for Today & Upcoming views)
    const currentMonthQuery = useQuery({
        queryKey: ["tasks", "month", currentMonthStr],
        queryFn: () => axios.get(`${API_URL}/month?month=${currentMonthStr}`).then(res => res.data.data),
        staleTime: 1000 * 60 * 1,
    });

    // 3. SELECTED MONTH: Only fetch if user looks at a different month
    // Note: If selectedMonthStr === currentMonthStr, React Query dedupes this automatically
    const selectedMonthQuery = useQuery({
        queryKey: ["tasks", "month", selectedMonthStr],
        queryFn: () => axios.get(`${API_URL}/month?month=${selectedMonthStr}`).then(res => res.data.data),
        enabled: !!selectedDate && selectedMonthStr !== currentMonthStr,
        staleTime: 1000 * 60 * 5,
    });

    // 4. NEXT MONTH: Prefetch next month only near the end of the current month
    const nextMonthQuery = useQuery({
        queryKey: ["tasks", "month", nextMonthStr],
        queryFn: () => axios.get(`${API_URL}/month?month=${nextMonthStr}`).then(res => res.data.data),
        enabled: isEndOfMonth,
        staleTime: 1000 * 60 * 10, // Low priority, longer cache
    });

    // --- Data Unification ---

    // Determine which month data to return for the Calendar/List view
    const displayMonthTasks = useMemo(() => {
        if (selectedMonthStr === currentMonthStr) {
            return currentMonthQuery.data ?? [];
        }
        return selectedMonthQuery.data ?? [];
    }, [selectedMonthStr, currentMonthStr, currentMonthQuery.data, selectedMonthQuery.data]);

    const invalidateAllTasks = () => {
        // Refresh all task-related queries
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    // Combine loading/error states
    const isLoading = overdueQuery.isLoading || currentMonthQuery.isLoading || selectedMonthQuery.isLoading;
    const isError = overdueQuery.isError || currentMonthQuery.isError || selectedMonthQuery.isError;

    return {
        // Raw Data Sources
        overdueTasks: overdueQuery.data ?? [],         // For Overdue Section
        currentMonthTasks: currentMonthQuery.data ?? [], // For "Today" / "Upcoming" calculation
        nextMonthTasks: nextMonthQuery.data ?? [],     // For "Upcoming" calculation (cross-month)
        displayMonthTasks,                             // For Calendar / Main List View

        // State
        isLoading,
        isError,
        // isPrefetching: nextMonthQuery.isFetching,

        refresh: invalidateAllTasks,
    };
}
