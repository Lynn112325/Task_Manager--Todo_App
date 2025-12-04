import { useCallback, useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useDialogs } from "./useDialogs/useDialogs";
import { useError } from "./useError";
import useNotifications from "./useNotifications/useNotifications";

const API_URL = "/api/targets";

export function useTasks(type = "all") {
    const [targets, setTargets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getUserFriendlyError } = useError();
    const dialogs = useDialogs();
    const notifications = useNotifications();

    // useEffect(() => {
    //     console.log("Task type in useTasks:", type);
    // }, [type]);

    // ---------------- Fetch All Target ----------------
    // const fetchTargets = useCallback(async () => {
    //     try {
    //         setIsLoading(true);
    //         const res = await axios.get(API_URL);
    //         setTasks(res.data);

    //         // set the checked state to the ids of the completed tasks
    //         setChecked(
    //             res.data?.filter?.((t) => t.isCompleted)?.map?.((t) => t.id) ?? []
    //         );
    //     } catch (err) {
    //         console.error(err);
    //         setError(getUserFriendlyError(err));
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, []);

    // ---------------- Get Single Target ----------------
    const getTarget = useCallback(async (id) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_URL}/${id}`);
            return res.data;
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refresh = useCallback(() => {
        fetchTasks();
    }, [fetchTasks]);

    // --------------------- CRUD ----------------------
    // ---------------- Create Task ----------------
    const addTarget = async (data) => {
        try {
            const res = await axios.post(API_URL, data);
            setTasks((prev) => [...prev, res.data]);
            return res.data;
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        }
    };

    // ---------------- Update Target ----------------
    // const updateTarget = async (id, data) => {
    //     try {
    //         const res = await axios.patch(`${API_URL}/${id}`, data);
    //         setTasks((prev) =>
    //             prev.map((task) => (task.id === id ? res.data : task))
    //         );
    //         return res.data;
    //     } catch (err) {
    //         console.error(err);
    //         setError(getUserFriendlyError(err));
    //     }
    // };

    // const updateTaskStatus = async (task) => {
    //     const isChecked = checked.includes(task.id);

    //     // ask for confirmation before marking as completed or not completed

    //     const confirmed = await dialogs.confirm(
    //         `Mark task "${task.title}" as ${isChecked ? "unCompleted" : "completed"}?`,
    //         {
    //             title: "Update Task",
    //             severity: "info",
    //             okText: "Yes",
    //             cancelText: "Cancel",
    //         }
    //     );

    //     if (!confirmed) return; // user cancelled
    //     const isCompleted = !isChecked;
    //     try {
    //         await updateTask(task.id, { isCompleted });
    //         setChecked((prev) =>
    //             prev.includes(task.id)
    //                 ? prev.filter((taskId) => taskId !== task.id)
    //                 : [...prev, task.id]
    //         );


    //         notifications.show("Task updated successfully.", {
    //             severity: "success",
    //             autoHideDuration: 3000,
    //         });
    //     } catch (err) {
    //         notifications.show(`Failed to update task: ${getUserFriendlyError(err)}`, {
    //             severity: "error",
    //             autoHideDuration: 3000,
    //         });
    //     }
    // };

    // ---------------- Delete Target ----------------
    // const deleteTask = async (id) => {
    //     try {
    //         await axios.delete(`${API_URL}/${id}`);
    //         setTasks((prev) => prev.filter((task) => task.id !== id));
    //     } catch (err) {
    //         console.error(err);
    //         setError(getUserFriendlyError(err));
    //     }
    // };
    // ----------------- Finish CRUD -----------------

    // ---------------- Filter & Sort ----------------
    // const sortAndFilter = useCallback(
    //     (list) => {
    //         return [...list]
    //             .filter((t) => type === "all" || t.type === type)
    //             .sort((a, b) => {
    //                 // Incomplete tasks first, then by priority desc, then by due date asc
    //                 if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    //                 if (b.priority !== a.priority) return b.priority - a.priority;
    //                 return dayjs(a.dueDate).unix() - dayjs(b.dueDate).unix();
    //             });
    //     },
    //     [type]
    // );

    // // Validation follows the [Standard Schema](https://standardschema.dev/).
    // const validateTask = (task) => {
    //     let issues = [];

    //     // Title
    //     if (!task.title || task.title.trim() === "") {
    //         issues.push({ message: "Task title is required", path: ["title"] });
    //     }

    //     // Description
    //     if (!task.description || task.description.trim() === "") {
    //         issues.push({
    //             message: "Task description is required",
    //             path: ["description"],
    //         });
    //     }

    //     // Due date
    //     if (!task.due_date) {
    //         issues.push({ message: "Due date is required", path: ["due_date"] });
    //     } else if (isNaN(Date.parse(task.due_date))) {
    //         issues.push({
    //             message: "Due date must be a valid date",
    //             path: ["due_date"],
    //         });
    //     }

    //     // Priority
    //     if (task.priority == null) {
    //         issues.push({ message: "Priority is required", path: ["priority"] });
    //     } else if (![1, 2, 3, 4, 5].includes(task.priority)) {
    //         issues.push({
    //             message: "Priority must be between 1 and 5",
    //             path: ["priority"],
    //         });
    //     }

    //     // isCompleted (optional check for boolean)
    //     // if (task.isCompleted != null && typeof task.isCompleted !== 'boolean') {
    //     //   issues.push({ message: 'Completed must be true or false', path: ['isCompleted'] });
    //     // }

    //     return { issues };
    // };

    // ---------------- Effect ----------------
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        target,
        isLoading,
        error,
        // validateTask,
        refresh,
        // fetchTargets,
        // addTarget,
        // updateTarget,
        // deleteTarget,
        getTarget,
    };
}
