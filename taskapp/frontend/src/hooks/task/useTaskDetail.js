import { useQuery } from "@tanstack/react-query";
import axios from "../../axiosConfig";

const API_URL = "/api/tasks";
/**
 * use to get task by id
 */
export function useTaskDetail(taskId) {
    // GET /api/tasks/{id}
    const basicQuery = useQuery({
        queryKey: ["tasks", "item", taskId],
        queryFn: () => axios.get(`${API_URL}/${taskId}`).then(res => res.data.data),
        enabled: !!taskId,
    });

    // GET /api/tasks/{id}/detail
    const detailQuery = useQuery({
        queryKey: ["tasks", "detail", taskId],
        queryFn: () => axios.get(`${API_URL}/${taskId}/detail`).then(res => res.data.data),
        enabled: !!taskId,
    });

    return {
        task: basicQuery.data,
        detail: detailQuery.data,
        isLoading: basicQuery.isLoading || detailQuery.isLoading,
        isError: basicQuery.isError || detailQuery.isError,
        refresh: () => {
            basicQuery.refetch();
            detailQuery.refetch();
        }
    };
}