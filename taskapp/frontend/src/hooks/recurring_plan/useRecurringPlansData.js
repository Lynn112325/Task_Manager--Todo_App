import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import axios from "../../axiosConfig";

const API_URL = "/api/recurringPlans";
export function useRecurringPlansData(targetId = null) {
    const queryClient = useQueryClient();

    // Read all recurringPlans
    const allPlansQuery = useQuery({
        queryKey: ["recurringPlans", "all"],
        queryFn: async () => {
            const res = await axios.get(API_URL);
            return res.data?.data ?? [];
        },
        staleTime: 1000 * 60,
        enabled: !targetId, // when targetId is provided, disable this query
    });

    // Read recurringPlans by target
    const targetPlansQuery = useQuery({
        queryKey: ["recurringPlans", "target", targetId],
        queryFn: async () => {
            const res = await axios.get(`${API_URL}/target/${targetId}`);
            return res.data?.data ?? [];
        },
        staleTime: 1000 * 60,
        enabled: !!targetId, // only enable when targetId is provided
    });

    const activeQuery = targetId ? targetPlansQuery : allPlansQuery;

    const recurringPlans = activeQuery.data ?? [];
    const isLoading = activeQuery.isLoading;
    const error = activeQuery.error;

    // Create
    const createMutation = useMutation({
        mutationFn: (newRecurringPlan) => axios.post(API_URL, newRecurringPlan),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });
        },
    });

    // Delete
    const deleteMutation = useMutation({
        mutationFn: (id) => axios.delete(`${API_URL}/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["recurringPlans"] });
        },
    });

    const getRecurringPlanById = useCallback((id) => {
        const found = recurringPlans.find(t => String(t.id) === String(id));
        console.log("getRecurringPlanById:", id, found);
        return found || null;
    }, [recurringPlans]);

    return {
        recurringPlans,
        isLoading,
        error,
        createRecurringPlan: createMutation.mutate,
        deleteRecurringPlan: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        getRecurringPlanById,
    };
}