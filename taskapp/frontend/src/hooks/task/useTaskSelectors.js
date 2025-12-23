import dayjs from "dayjs";
import { useMemo } from "react";

export function useTaskSelectors(tasks, type = "all") {
    const tasksFiltered = useMemo(() => {
        return [...tasks]
            .filter(t => type === "all" || t.type === type)
            .sort((a, b) => {
                // incomplete first
                if (a.isCompleted !== b.isCompleted) {
                    return a.isCompleted ? 1 : -1;
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

    function toListData(rows = []) {
        return {
            rows,
            rowCount: rows.length,
        };
    }

    console.log(tasksFiltered);

    return {
        tasksFiltered,
        getTasksByDate,
        getOverdueTasks,
        getUpcomingTasks
    };
}
