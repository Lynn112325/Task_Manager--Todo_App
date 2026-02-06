import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

const matchesAllFilters = (task, { status, type, searchTerm }) => {

    const s = status?.toUpperCase() || 'ALL';
    const taskStatus = task.status?.toUpperCase();
    const matchesStatus = s === 'ALL' || taskStatus === s;

    const t = type?.toLowerCase() || 'all';
    const taskType = task.type?.toLowerCase() || 'none';
    const matchesType = t === 'all' || taskType === t;

    const matchesSearch = !searchTerm ||
        task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesType && matchesSearch;
};

export function useTaskSelectors(dataSources, filters) {
    // Destructure data from useTasksData
    const {
        overdueTasks = [],
        currentMonthTasks = [],
        nextMonthTasks = [],
        displayMonthTasks = []
    } = dataSources;

    const {
        status = 'ALL',
        type = 'all',
        search = ''
    } = filters || {};

    const filterConfig = useMemo(() => ({
        status,
        type,
        searchTerm: search
    }), [status, type, search]);

    /**
     * 1. Specific Date Selector
     * Uses displayMonthTasks because it adapts to the calendar view.
     */
    const getTasksByDate = useCallback((date) => {
        return displayMonthTasks.filter(t =>
            dayjs(t.dueDate).isSame(date, "day") &&
            matchesAllFilters(t, filterConfig)

        );
    }, [displayMonthTasks, filterConfig]);

    /**
     * 2. Overdue Selector
     * We use the specific overdueTasks array from the backend.
     * It's already filtered for status='ACTIVE' and sorted by the DB.
     */
    const overdue = useMemo(() => {
        return overdueTasks.filter(t => matchesAllFilters(t, filterConfig));
    }, [overdueTasks, filterConfig]);

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
            const isUpcomingDate = d.isAfter(today, "day") && d.isBefore(horizon);
            return isUpcomingDate && matchesAllFilters(t, filterConfig);
        });
    }, [currentMonthTasks, nextMonthTasks, filterConfig]);

    return {
        getTasksByDate,
        overdueTasks: overdue,
        upcomingTasks: upcoming
    };
}

