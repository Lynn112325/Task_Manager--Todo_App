import { useQuery } from '@tanstack/react-query';
import axios from '../../axiosConfig';

export function useTasksByIds(ids) {
    return useQuery({
        queryKey: ['getTasksByIds', ids],
        queryFn: async () => {
            const { data } = await axios.get(`/api/tasks/search`, {
                params: { ids: ids.join(',') }
            });
            return data || [];
        },
        enabled: !!ids && ids.length > 0,
        staleTime: 0,
    });
}