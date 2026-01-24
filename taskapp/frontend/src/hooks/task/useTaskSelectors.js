import dayjs from "dayjs";
import { useMemo } from "react";

const statusWeight = {
    ACTIVE: 1,
    CANCELED: 2,
    COMPLETED: 3
};
export function useTaskSelectors(tasks, type = "all") {

    const tasksFiltered = useMemo(() => {
        return [...tasks]
            .filter(t => type === "all" || t.type === type)
            .sort((a, b) => {
                // sort tasks based on status weight
                if (a.status !== b.status) {
                    return (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
                }
                // priority desc
                if (a.priority !== b.priority) {
                    return b.priority - a.priority;
                }
                // due date asc
                return dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix();
            });
    }, [tasks, type]);

    const getTasksByDate = (date) =>
        tasksFiltered.filter(
            t => dayjs(t.dueDate).isSame(date, "day")
        );
    const getOverdueTasks = () =>
        tasksFiltered.filter(
            t => dayjs(t.dueDate).isBefore(dayjs(), "day") && !t.isCompleted
        );

    const getUpcomingTasks = () =>
        tasksFiltered.filter(
            t => dayjs(t.dueDate).isAfter(dayjs(), "day")
        );

    return {
        tasksFiltered,
        getTasksByDate,
        getOverdueTasks,
        getUpcomingTasks
    };
}
