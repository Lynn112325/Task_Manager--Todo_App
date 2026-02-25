import { useQuery } from '@tanstack/react-query';
import axios from '../../axiosConfig';

export function useActiveTaskCheck(ids) {
    return useQuery({
        queryKey: ['activeTaskCheck', ids],
        queryFn: async () => {
            const { data } = await axios.get(`/api/tasks/active-check`, {
                params: { ids: ids.join(',') }
            });
            return data?.data || [];
        },
        enabled: !!ids && ids.length > 0,
        staleTime: 0,
    });
}