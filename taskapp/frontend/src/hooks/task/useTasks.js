// hooks/useTasks.js
import dayjs from "dayjs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "../../axiosConfig";
import { useDialogs } from "../useDialogs/useDialogs";
import { useError } from "../useError";
import useNotifications from "../useNotifications/useNotifications";

const API_URL = "/api/tasks";

export function useTasks(type = "all") {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getUserFriendlyError } = useError();
    const [checked, setChecked] = React.useState([]);
    const dialogs = useDialogs();
    const notifications = useNotifications();

    // useEffect(() => {
    //     console.log("Task type in useTasks:", type);
    // }, [type]);

    // ---------------- Fetch All Tasks ----------------
    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(API_URL);
            const list = res.data?.data ?? [];
            setTasks(list);
            // console.log(list);
            // set the checked state to the ids of the completed tasks
            setChecked(
                list.filter(t => t.isCompleted).map(t => t.id)
            );

        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);


    // ---------------- Get Single Task ----------------
    const getTaskDetail = useCallback(async (id) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_URL}/${id}`);
            console.log('Fetched task detail: ', res.data);
            const list = res.data?.data ?? [];
            return list;
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    // const getSubTasks = useCallback(
    //     (parentId) => {
    //         return tasks.filter((task) => task.parentTaskId === parentId);
    //     },
    //     [tasks]
    // );

    const refresh = useCallback(() => {
        fetchTasks();
    }, [fetchTasks]);

    // --------------------- CRUD ----------------------
    // ---------------- Create Task ----------------
    const addTask = async (data) => {
        try {
            const res = await axios.post(API_URL, data);
            const task = res.data.data;
            setTasks((prev) => [...prev, task]);
            return task;
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        }
    };

    // ---------------- Update Task ----------------
    const updateTask = async (id, data) => {
        try {
            const res = await axios.patch(`${API_URL}/${id}`, data);
            const updatedTask = res.data.data;
            setTasks((prev) =>
                prev.map((task) => (task.id === id ? updatedTask : task))
            );
            return updatedTask;
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        }
    };

    const updateTaskStatus = async (task) => {
        const isChecked = checked.includes(task.id);

        // ask for confirmation before marking as completed or not completed

        const confirmed = await dialogs.confirm(
            `Mark task "${task.title}" as ${isChecked ? "unCompleted" : "completed"}?`,
            {
                title: "Update Task",
                severity: "info",
                okText: "Yes",
                cancelText: "Cancel",
            }
        );

        if (!confirmed) return; // user cancelled
        const isCompleted = !isChecked;
        try {
            await updateTask(task.id, { isCompleted });
            setChecked((prev) =>
                prev.includes(task.id)
                    ? prev.filter((taskId) => taskId !== task.id)
                    : [...prev, task.id]
            );


            notifications.show("Task updated successfully.", {
                severity: "success",
                autoHideDuration: 3000,
            });
        } catch (err) {
            notifications.show(`Failed to update task: ${getUserFriendlyError(err)}`, {
                severity: "error",
                autoHideDuration: 3000,
            });
        }
    };

    // ---------------- Delete Task ----------------
    const deleteTask = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        }
    };
    // ----------------- Finish CRUD -----------------

    // ---------------- Filter & Sort ----------------
    const sortAndFilter = useCallback(
        (list) => {
            return [...list]
                .filter((t) => type === "all" || t.type === type)
                .sort((a, b) => {
                    // Incomplete tasks first, then by priority desc, then by due date asc
                    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
                    if (b.priority !== a.priority) return b.priority - a.priority;
                    return dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix();
                });
        },
        [type]
    );

    const tasksFiltered = useMemo(
        () => sortAndFilter(tasks),
        [tasks, sortAndFilter]
    );

    const getTasksByDate = (date) =>
        date
            ? sortAndFilter(
                tasks.filter((t) => dayjs(t.dueDate).isSame(dayjs(date), "day"))
            )
            : tasksFiltered;

    const getUpcomingTasks = () =>
        sortAndFilter(
            tasks.filter(
                (t) =>
                    (dayjs(t.startDate).isBefore(dayjs(), "day") || dayjs(t.startDate).isSame(dayjs(), "day")) &&
                    dayjs(t.dueDate).isAfter(dayjs(), "day")
            )
        );

    const getOverdueTasks = () =>
        sortAndFilter(
            tasks.filter(
                (t) => dayjs(t.dueDate).isBefore(dayjs(), "day") && !t.isCompleted
            )
        );

    // Validation follows the [Standard Schema](https://standardschema.dev/).
    const validateTask = (task) => {
        let issues = [];

        // Title
        if (!task.title || task.title.trim() === "") {
            issues.push({ message: "Task title is required", path: ["title"] });
        }

        // Description
        if (!task.description || task.description.trim() === "") {
            issues.push({
                message: "Task description is required",
                path: ["description"],
            });
        }

        // Due date
        if (!task.due_date) {
            issues.push({ message: "Due date is required", path: ["due_date"] });
        } else if (isNaN(Date.parse(task.due_date))) {
            issues.push({
                message: "Due date must be a valid date",
                path: ["due_date"],
            });
        }

        // Priority
        if (task.priority == null) {
            issues.push({ message: "Priority is required", path: ["priority"] });
        } else if (![1, 2, 3, 4, 5].includes(task.priority)) {
            issues.push({
                message: "Priority must be between 1 and 5",
                path: ["priority"],
            });
        }

        // isCompleted (optional check for boolean)
        // if (task.isCompleted != null && typeof task.isCompleted !== 'boolean') {
        //   issues.push({ message: 'Completed must be true or false', path: ['isCompleted'] });
        // }

        return { issues };
    };

    // ---------------- Effect ----------------
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks: tasksFiltered,
        checked,
        isLoading,
        error,
        // validateTask,
        refresh,
        fetchTasks,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        getTaskDetail,
        getTasksByDate,
        getUpcomingTasks,
        getOverdueTasks,
    };
}
