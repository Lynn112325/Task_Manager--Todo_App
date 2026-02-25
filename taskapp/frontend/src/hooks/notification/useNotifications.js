import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const useNotifications = (page = 0, size = 10) => {
    const queryClient = useQueryClient();

    // --- Queries ---

    // Fetch notification list (paginated)
    const notificationsQuery = useQuery({
        queryKey: ['notifications', page, size],
        queryFn: async () => {
            const res = await axios.get(`/api/notifications?page=${page}&size=${size}`);
            // Parse content JSON string into object
            const rawPageData = res.data?.data || res.data;

            if (!rawPageData) {
                return {
                    content: [],
                    totalElements: 0,
                    totalPages: 0
                };
            }
            return {
                ...rawPageData,
                content: rawPageData.content.map(n => ({
                    ...n,
                    payload: n.type === 'DAILY_BRIEFING' ? JSON.parse(n.content) : n.content
                }))
            };
        },
        // Keep previous data when fetching next page for better UX
        keepPreviousData: true
    });

    // Fetch count of unread notifications
    const unreadCountQuery = useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: async () => {
            const { data } = await axios.get('/api/notifications/unread-count');
            return data.data;
        },
        // Auto-refresh unread count every 2 minutes
        refetchInterval: 1000 * 60 * 2,
    });

    // --- Mutations ---

    // Mark a specific notification as read
    const markAsRead = useMutation({
        mutationFn: (id) => axios.patch(`/api/notifications/${id}/read`),
        onSuccess: () => {
            // Invalidate both list and count to trigger refetch
            queryClient.invalidateQueries(['notifications']);
            queryClient.invalidateQueries(['notifications', 'unread-count']);
        }
    });

    // Mark all notifications as read for current user
    const markAllAsRead = useMutation({
        mutationFn: () => axios.patch('/api/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries(['notifications']);
        }
    });

    // --- Derived Data ---
    // Extract the most recent daily briefing from the current notifications list
    const latestBriefing = notificationsQuery.data?.content
        ?.filter(n => n.type === 'DAILY_BRIEFING')
        ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

    return {
        // Data
        notifications: notificationsQuery.data?.content || [],
        pagination: {
            totalElements: notificationsQuery.data?.totalElements || 0,
            totalPages: notificationsQuery.data?.totalPages || 0,
            isLast: notificationsQuery.data?.last
        },
        unreadCount: unreadCountQuery.data || 0,
        latestBriefing,

        // Status
        isLoading: notificationsQuery.isLoading,
        isError: notificationsQuery.isError,

        // Actions
        markAsRead: markAsRead.mutate,
        markAllAsRead: markAllAsRead.mutate,
        refresh: notificationsQuery.refetch
    };
};

export default useNotifications;