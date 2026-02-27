import {
    Assessment as AssessmentIcon,
    ErrorOutline as ErrorIcon,
    LocalFireDepartment as StreakIcon,
    TipsAndUpdatesOutlined as TipsAndUpdatesOutlinedIcon
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card, CardContent, Divider, Grid, LinearProgress,
    Skeleton,
    Stack, Typography
} from '@mui/material';
import * as React from "react";
import { useParams } from "react-router";
import PageContainer from "../components/PageContainer";
import { TargetHeaderActions, TargetHeaderActionsSkeleton, TargetHeaderContent, TargetHeaderContentSkeleton } from '../components/TargetHeader';
import TaskBlueprintList from '../components/TaskBlueprintList';
import { useWeeklyMetrics } from '../hooks/metrics/useMetrics';
import { useTarget } from '../hooks/target/useTarget';
import { useTaskSchedules } from '../hooks/TaskSchedules/useTaskSchedules';

export default function TargetDetail() {
    const { targetId } = useParams();

    // 1. Data Fetching: Added 'enabled' check to prevent unnecessary requests if targetId is missing
    const { getTargetById, isLoading: isTargetLoading } = useTarget();

    const isEnabled = !!targetId;
    const {
        taskSchedules,
        isLoading: isTaskSchedulesLoading,
        isError: isSchedulesError,
        refetch: refetchSchedules,
        activeFilterCount
    } = useTaskSchedules({ targetId }, isEnabled);

    const {
        data: metrics,
        isLoading: isMetricsLoading,
        isError: isMetricsError,
        refetch: refetchMetrics
    } = useWeeklyMetrics(targetId, { enabled: !!targetId });

    // Memoize target data to prevent redundant calculations on re-renders
    const target = React.useMemo(() => {
        return getTargetById ? getTargetById(targetId) : null;
    }, [getTargetById, targetId]);

    // Global Error Handling State
    if (isMetricsError || isSchedulesError) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2 }}>
                    Failed to load dashboard data. Please check your connection.
                </Alert>
                <Button variant="outlined" onClick={() => { refetchMetrics(); refetchSchedules(); }}>
                    Retry Loading
                </Button>
            </Box>
        );
    }

    return (
        <PageContainer
            title={
                isTargetLoading ?
                    <TargetHeaderContentSkeleton /> :
                    <TargetHeaderContent target={target} />
            }
            // breadcrumbs={[{ title: target.title }]}
            actions={
                isTargetLoading ?
                    <TargetHeaderActionsSkeleton /> :
                    <TargetHeaderActions target={target} />
            }
        >

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
                {/* --- SECTION B: METRICS (Progress & Analytics) --- */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon /> Activity Metrics
                    </Typography>

                    {/* Weekly Target Adherence Card */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Weekly Target Adherence</Typography>
                            {isMetricsLoading ? (
                                <Box sx={{ mt: 2 }}>
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="rectangular" height={10} sx={{ my: 1, borderRadius: 5 }} />
                                    <Skeleton variant="text" width="40%" />
                                </Box>
                            ) : (
                                <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(metrics?.completionRate || 0) * 100}
                                                sx={{
                                                    height: 10,
                                                    borderRadius: 5,
                                                    bgcolor: 'action.hover',
                                                    '& .MuiLinearProgress-bar': {
                                                        bgcolor: metrics?.completionRate >= 1 ? 'success.main' : 'primary.main'
                                                    }
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" fontWeight="bold">
                                            {Math.round((metrics?.completionRate || 0) * 100)}%
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {metrics?.weeklyCompleted || 0} of {metrics?.weeklyTotalExpected || 0} tasks completed this week
                                        {metrics?.extraTasksCompleted > 0 && ` (+${metrics.extraTasksCompleted} extra!)`}
                                    </Typography>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Streak Progress Card */}
                    <Card variant="outlined" sx={{ bgcolor: 'rgba(255, 152, 0, 0.05)', borderColor: 'orange' }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <StreakIcon sx={{ color: 'orange', fontSize: 40 }} />
                                <Box>
                                    <Typography variant="subtitle2" color="warning.main">Current Streak</Typography>
                                    {isMetricsLoading ? (
                                        <Skeleton width={80} height={40} />
                                    ) : (
                                        <Typography variant="h5" fontWeight="bold">
                                            {metrics?.currentStreak || 0} Weeks
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* AI-Driven Dynamic Insight Message */}
                    {isMetricsLoading ? (
                        <Skeleton variant="rectangular" height={50} sx={{ mt: 2, borderRadius: 2 }} />
                    ) : (
                        metrics?.insightMessage && (
                            <Box sx={{
                                mt: 2.5,
                                p: 1.5,
                                border: '1px solid',
                                borderColor: 'primary.light',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',    // Vertical centering
                                justifyContent: 'center', // Horizontal centering
                                gap: 1.2,
                                opacity: 0.9,
                            }}>
                                <TipsAndUpdatesOutlinedIcon
                                    sx={{
                                        fontSize: 14,
                                        color: 'primary.main',
                                        flexShrink: 0
                                    }}
                                />

                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        lineHeight: 1.2,
                                        fontWeight: 500,
                                        letterSpacing: '0.01rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    {metrics.insightMessage}
                                </Typography>
                            </Box>
                        )
                    )}

                    {/* Secondary Stat Indicators */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', px: 1 }}>
                        <Typography variant="caption" color="text.disabled">
                            {metrics?.activeBlueprintsCount || 0} Active Blueprints
                        </Typography>
                        <Typography variant="caption" color="primary.main" fontWeight="bold">
                            Total XP: {metrics?.totalExperiencePoints || 0}
                        </Typography>
                    </Box>
                </Grid>

                {/* --- SECTION C: CONTENT (Task Blueprints List) --- */}
                <Grid size={{ xs: 12, md: 8 }}>
                    {isTaskSchedulesLoading ? (
                        <Stack spacing={2}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                            ))}
                        </Stack>
                    ) : (
                        <TaskBlueprintList
                            taskSchedules={taskSchedules}
                            handleEdit={() => { }}
                            handleDelete={() => { }}
                            handleToggle={() => { }}
                        />
                    )}
                </Grid>
            </Grid>
        </PageContainer >
    );
}