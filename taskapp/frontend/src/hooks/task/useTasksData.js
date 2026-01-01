import { useCallback, useEffect, useState } from "react";
import axios from "../../axiosConfig";
import { useError } from "../useError";

const API_URL = "/api/tasks";
export function useTasksData(type = "all") {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const { getUserFriendlyError } = useError();

    const fetchTasks = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.get(API_URL);
            setTasks(res.data?.data ?? []);
            // console.log("Fetched tasks:", res.data?.data ?? []);
        } catch (err) {
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getTaskDetail = async (id) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${API_URL}/${id}`);
            return res.data.data;
        } catch (err) {
            setError(getUserFriendlyError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const createTask = async (data) => {
        const res = await axios.post(API_URL, data);
        const created = res.data.data;
        console.log("Created task:", created);
        setTasks(prev => [...prev, created]);
        return created;
    };

    const updateTask = async (id, data) => {
        const res = await axios.patch(`${API_URL}/${id}`, data);
        const updated = res.data.data;
        setTasks(prev =>
            prev.map(t => (t.id === id ? updated : t))
        );
        return updated;
    };

    const deleteTask = async (id) => {
        if (!id) {
            throw new Error("deleteTask called without id");
        }
        await axios.delete(`${API_URL}/${id}`);
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return {
        tasks,
        isLoading,
        error,
        fetchTasks,
        getTaskDetail,
        createTask,
        updateTask,
        deleteTask,
    };
}
