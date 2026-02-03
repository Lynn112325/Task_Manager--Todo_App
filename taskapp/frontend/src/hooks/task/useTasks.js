import { useTaskActions } from "./useTaskActions";
import { useTasksData } from "./useTasksData";
import { useTaskSelectors } from "./useTaskSelectors";

export function useTasks(selectedDate = null, type = "all") {
    // Data
    const {
        // Raw Data Sources
        overdueTasks,        // For Overdue Section
        currentMonthTasks,   // For "Today" / "Upcoming" calculation
        nextMonthTasks,      // For "Upcoming" calculation (cross-month)
        displayMonthTasks,   // For Calendar / Main List View

        // State
        isLoading,
        isError,
        isPrefetching,

        refresh,
    } = useTasksData(selectedDate);

    // Actions
    const actions = useTaskActions();

    // Selectors
    const selectors = useTaskSelectors({
        overdueTasks,
        currentMonthTasks,
        nextMonthTasks,
        displayMonthTasks
    }, type);

    return {
        // Data for the UI
        ...selectors,

        // Status for the UI
        isLoading,
        error: isError,
        // isPrefetching,

        // Methods for the UI
        ...actions,

        // raw access
        refresh,
    };
}
