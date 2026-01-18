import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import axios from "../../axiosConfig";

const API_URL = "/api/targets";
export function useTargetsData() {
    const queryClient = useQueryClient();

    // Read
    const { data: targets = [], isLoading, error } = useQuery({
        queryKey: ["targets"],
        queryFn: async () => {
            const res = await axios.get(API_URL);
            return res.data?.data ?? [];
        },
        staleTime: 1000 * 60,
    });

    // Create
    const createMutation = useMutation({
        mutationFn: (newTarget) => axios.post(API_URL, newTarget),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["targets"] });
        },
    });

    // Delete
    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["targets"] });
        },
    });

    const getTargetById = useCallback((id) => {
        const found = targets.find(t => String(t.id) === String(id));
        // console.log("getTargetById:", id, found);
        return found || null;
    }, [targets]);

    return {
        targets,
        isLoading,
        error,
        createTarget: createMutation.mutate,
        deleteTarget: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        getTargetById,
    };
}