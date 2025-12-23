import { useCallback, useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useDialogs } from "./useDialogs/useDialogs";
import { useError } from "./useError";
import useNotifications from "./useNotifications/useNotifications";

const API_URL = "/api/targets";

export function useTargets(type = "all") {
    const [targets, setTargets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getUserFriendlyError } = useError();
    const dialogs = useDialogs();
    const notifications = useNotifications();

    useEffect(() => {
        console.log("Target type in useTargets:", type);
    }, [type]);

    // ---------------- Fetch All Target ----------------
    const fetchTargets = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(API_URL);
            setTargets(res.data);

            // set the checked state to the ids of the completed Targets
            setChecked(
                res.data?.filter?.((t) => t.isCompleted)?.map?.((t) => t.id) ?? []
            );
        } catch (err) {
            console.error(err);
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

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
        fetchTargets();
    }, [fetchTargets]);

    // --------------------- CRUD ----------------------
    // ---------------- Create Target ----------------
    const addTarget = async (data) => {
        try {
            const res = await axios.post(API_URL, data);
            setTargets((prev) => [...prev, res.data]);
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
    //         setTargets((prev) =>
    //             prev.map((Target) => (Target.id === id ? res.data : Target))
    //         );
    //         return res.data;
    //     } catch (err) {
    //         console.error(err);
    //         setError(getUserFriendlyError(err));
    //     }
    // };

    // const updateTargetStatus = async (Target) => {
    //     const isChecked = checked.includes(Target.id);

    //     // ask for confirmation before marking as completed or not completed

    //     const confirmed = await dialogs.confirm(
    //         `Mark Target "${Target.title}" as ${isChecked ? "unCompleted" : "completed"}?`,
    //         {
    //             title: "Update Target",
    //             severity: "info",
    //             okText: "Yes",
    //             cancelText: "Cancel",
    //         }
    //     );

    //     if (!confirmed) return; // user cancelled
    //     const isCompleted = !isChecked;
    //     try {
    //         await updateTarget(Target.id, { isCompleted });
    //         setChecked((prev) =>
    //             prev.includes(Target.id)
    //                 ? prev.filter((TargetId) => TargetId !== Target.id)
    //                 : [...prev, Target.id]
    //         );


    //         notifications.show("Target updated successfully.", {
    //             severity: "success",
    //             autoHideDuration: 3000,
    //         });
    //     } catch (err) {
    //         notifications.show(`Failed to update Target: ${getUserFriendlyError(err)}`, {
    //             severity: "error",
    //             autoHideDuration: 3000,
    //         });
    //     }
    // };

    // ---------------- Delete Targetapp\frontend\src\hooks\useTarget.js ----------------
    // const deleteTarget = async (id) => {
    //     try {
    //         await axios.delete(`${API_URL}/${id}`);
    //         setTargets((prev) => prev.filter((Target) => Target.id !== id));
    //     } catch (err) {
    //         console.error(err);
    //         setError(getUserFriendlyError(err));
    //     }
    // };
    // ----------------- Finish CRUD -----------------

    // // Validation follows the [Standard Schema](https://standardschema.dev/).
    // const validateTarget = (Target) => {
    //     let issues = [];

    //     // Title
    //     if (!Target.title || Target.title.trim() === "") {
    //         issues.push({ message: "Target title is required", path: ["title"] });
    //     }

    //     // Description
    //     if (!Target.description || Target.description.trim() === "") {
    //         issues.push({
    //             message: "Target description is required",
    //             path: ["description"],
    //         });
    //     }

    //     // Due date
    //     if (!Target.due_date) {
    //         issues.push({ message: "Due date is required", path: ["due_date"] });
    //     } else if (isNaN(Date.parse(Target.due_date))) {
    //         issues.push({
    //             message: "Due date must be a valid date",
    //             path: ["due_date"],
    //         });
    //     }

    //     // Priority
    //     if (Target.priority == null) {
    //         issues.push({ message: "Priority is required", path: ["priority"] });
    //     } else if (![1, 2, 3, 4, 5].includes(Target.priority)) {
    //         issues.push({
    //             message: "Priority must be between 1 and 5",
    //             path: ["priority"],
    //         });
    //     }

    //     // isCompleted (optional check for boolean)
    //     // if (Target.isCompleted != null && typeof Target.isCompleted !== 'boolean') {
    //     //   issues.push({ message: 'Completed must be true or false', path: ['isCompleted'] });
    //     // }

    //     return { issues };
    // };

    // ---------------- Effect ----------------
    useEffect(() => {
        fetchTargets();
    }, [fetchTargets]);

    return {
        target,
        isLoading,
        error,
        // validateTarget,
        refresh,
        // fetchTargets,
        // addTarget,
        // updateTarget,
        // deleteTarget,
        getTarget,
    };
}
