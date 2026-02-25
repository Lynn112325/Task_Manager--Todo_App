import { Box, CircularProgress, Stack } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
import DailyBriefingCard from '../components/notification/DailyBriefingCard';
import PageContainer from "../components/PageContainer";
import useNotifications from '../hooks/notification/useNotifications';
import { useDailyStats } from '../hooks/task/useDailyStats';

const Dashboard = () => {
    const { latestBriefing, markAsRead, loading } = useNotifications();
    const date = dayjs().format('YYYY-MM-DD');
    const { data: todayStats, isLoading: isTodayLoading } = useDailyStats(date);
    const { data: yesterdayStats, isLoading: isYesterdayLoading } = useDailyStats(
        dayjs(date).subtract(1, 'day').format('YYYY-MM-DD')
    );

    const statsSummary = useMemo(() => ({
        today: {
            active: todayStats?.active ?? 0,
            completed: todayStats?.completed ?? 0,
            canceled: todayStats?.canceled ?? 0
        },
        yesterday: {
            completed: yesterdayStats?.completed ?? 0,
            canceled: yesterdayStats?.canceled ?? 0,
            total: yesterdayStats?.total ?? 0
        }
    }), [todayStats, yesterdayStats]);

    const markedRef = useRef(false);
    const pageTitle = "Dashboard";

    useEffect(() => {
        if (!loading && latestBriefing && !latestBriefing.read && !markedRef.current) {
            markAsRead(latestBriefing.id);
            markedRef.current = true;
        }
    }, [loading, latestBriefing, markAsRead]);

    if (loading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <>
            <PageContainer
                title={pageTitle}
                breadcrumbs={[{ title: pageTitle }]}
                actions={
                    <Stack direction="row" alignItems="center" spacing={1}>

                    </ Stack>
                }
            >

                <Box p={3}>

                    <DailyBriefingCard
                        notification={latestBriefing}
                        statsSummary={statsSummary}
                    />

                </Box>
            </PageContainer >
        </>
    );
};

export default Dashboard;