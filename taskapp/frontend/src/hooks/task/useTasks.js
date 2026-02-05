import { useTaskActions } from "./useTaskActions";
import { useTaskFilters } from "./useTaskFilters";
import { useTasksData } from "./useTasksData";
import { useTaskSelectors } from "./useTaskSelectors";

export function useTasks(selectedDate = null) {
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

    } = useTasksData(selectedDate);

    // Actions
    const actions = useTaskActions();

    const filterProps = useTaskFilters();

    // Selectors
    const selectors = useTaskSelectors({
        overdueTasks,
        currentMonthTasks,
        nextMonthTasks,
        displayMonthTasks
    }, {
        status: filterProps.filterStatus,
        type: filterProps.filterType,
        search: filterProps.searchTerm
    });

    return {
        // Data for the UI
        ...selectors,

        // Status for the UI
        isLoading,
        error: isError,
        // isPrefetching,

        filterProps,

        // Methods for the UI
        ...actions,

    };
}
