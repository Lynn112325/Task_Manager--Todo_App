import { useTaskActions } from "./useTaskActions";
import { useTasksData } from "./useTasksData";
import { useTaskSelectors } from "./useTaskSelectors";

export function useTasks(type = "all") {
    // Data
    const {
        tasks,
        isLoading,
        error,
        getTaskDetail,
        getTask,
        createTask,
        updateTask,
        deleteTask,
        fetchTasks,
    } = useTasksData();

    // Actions
    const actions = useTaskActions({
        createTask,
        updateTask,
        // deleteTask,
    });

    // Selectors
    const selectors = useTaskSelectors(tasks, type);

    return {
        // data
        tasks: selectors.tasksFiltered,
        isLoading,
        error,

        // actions
        ...actions,

        // derived
        ...selectors,

        // raw access
        refresh: fetchTasks,
        fetchTasks,
        getTask,
        getTaskDetail,
    };
}
