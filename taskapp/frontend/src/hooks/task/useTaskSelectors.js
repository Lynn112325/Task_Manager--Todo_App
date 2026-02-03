import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

export function useTaskSelectors(allData, type = "all") {
    // Destructure data from useTasksData
    const {
        overdueTasks = [],
        currentMonthTasks = [],
        nextMonthTasks = [],
        displayMonthTasks = []
    } = allData;

    /**
     * 1. Specific Date Selector
     * Uses displayMonthTasks because it adapts to the calendar view.
     */
    const getTasksByDate = useCallback((date) => {
        const filtered = displayMonthTasks.filter(t =>
            dayjs(t.dueDate).isSame(date, "day")
        );
        return type === "all" ? filtered : filtered.filter(t => t.type === type);
    }, [displayMonthTasks, type]);

    /**
     * 2. Overdue Selector
     * We use the specific overdueTasks array from the backend.
     * It's already filtered for status='ACTIVE' and sorted by the DB.
     */
    const overdue = useMemo(() => {
        if (type === "all") return overdueTasks;
        return overdueTasks.filter(t => t.type === type);
    }, [overdueTasks, type]);

    /**
     * 3. Upcoming Selector (Next 14 Days)
     * Combines current and next month to ensure no "end-of-month" gaps.
     */
    const upcoming = useMemo(() => {
        const today = dayjs().startOf("day");
        const horizon = today.add(14, "day").endOf("day");

        const combined = [...currentMonthTasks, ...nextMonthTasks];

        return combined.filter(t => {
            const d = dayjs(t.dueDate);
            // const isActive = t.status === "ACTIVE";
            const isUpcomingDate = d.isAfter(today, "day") && d.isBefore(horizon);
            const matchesType = type === "all" || t.type === type;

            // return isActive && isUpcomingDate && matchesType;
            return isUpcomingDate && matchesType;

        });
    }, [currentMonthTasks, nextMonthTasks, type]);

    return {
        getTasksByDate,
        overdueTasks: overdue,
        upcomingTasks: upcoming
    };
}

