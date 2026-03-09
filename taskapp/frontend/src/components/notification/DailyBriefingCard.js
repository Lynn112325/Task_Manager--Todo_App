import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import {
    Box,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Link as MuiLink,
    Typography
} from '@mui/material';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTasksByIds } from '../../hooks/task/useTasksByIds';
import { formatDateCustom } from "../../utils/planFormatters";

const DailyBriefingCard = ({ notification, statsSummary }) => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract IDs from the notification payload to fetch full details from the API
    const missedTaskIds = React.useMemo(() => {
        return notification?.payload?.missedTasks?.map(t => t.id) || [];
    }, [notification]);

    // Fetch full task objects using the list of IDs
    const { data: tasks = [], isLoading } = useTasksByIds(missedTaskIds);

    // Helper to determine if a task is finished (not in 'ACTIVE' state)
    const getIsResolved = (task) => {
        return task.status !== 'ACTIVE';
    };

    // Synchronize API task details with notification metadata (e.g., nextRunDate)
    // Uses a Map for O(N) lookup efficiency instead of O(N^2)
    const combinedTasks = React.useMemo(() => {
        const sourceData = notification?.payload?.missedTasks || [];
        const sourceMap = new Map(sourceData.map(item => [item.id, item]));

        return tasks.map(task => {
            const extraInfo = sourceMap.get(task.id);
            return {
                ...task,
                isRecurring: extraInfo?.isRecurring ?? task.isRecurring,
                nextRunDate: extraInfo?.nextRunDate ?? task.nextRunDate,
                taskLink: extraInfo?.taskLink ?? task.taskLink,
                isResolved: getIsResolved(task) // Pre-calculate resolution status for UI
            };
        });
    }, [tasks, notification]);

    // Sort tasks: Moves unresolved (ACTIVE) tasks to the top, resolved tasks to the bottom
    const sortedTasks = React.useMemo(() => {
        return [...combinedTasks].sort((a, b) => a.isResolved - b.isResolved);
    }, [combinedTasks]);

    // Extract today's stats for display, providing default values (0) if data is missing
    const stats = React.useMemo(() => ({
        active: statsSummary?.today?.active ?? 0,
        completed: statsSummary?.today?.completed ?? 0,
        canceled: statsSummary?.today?.canceled ?? 0,
    }), [statsSummary?.today]);

    // Calculate summary for yesterday based on current task list and historical stats
    const yesterdayStats = React.useMemo(() => {
        const activeMissedCount = tasks.filter(t => t.status === 'ACTIVE').length;

        return {
            completed: statsSummary?.yesterday?.completed ?? 0,
            canceled: statsSummary?.yesterday?.canceled ?? 0,
            missed: activeMissedCount,
            total: statsSummary?.yesterday?.total ?? 0,
        };
    }, [statsSummary?.yesterday, tasks]);

    // Guard clause: Prevent rendering if critical notification data is absent
    if (!notification || !notification.payload) return null;

    const { title, redirectUrl } = notification;
    const { date, dayOfWeek } = notification.payload;

    return (
        <Card
            elevation={0}
            sx={{
                maxWidth: 450,
                mb: 3,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper'
            }}
        >
            <CardContent sx={{ p: 2, pb: '24px !important' }}>
                <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={2}>
                    <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ letterSpacing: '-0.02rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" fontWeight={500}>
                        {date} ({dayOfWeek})
                    </Typography>
                </Box>

                {/* --- Today's Overview --- */}
                <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                        Today's Overview
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 300, textTransform: 'lowercase' }}>
                            ongoing: {stats.active} • completed: {stats.completed} • canceled: {stats.canceled}
                        </Typography>
                        {redirectUrl && (
                            <MuiLink
                                component="button"
                                underline="hover"
                                onClick={() => navigate(redirectUrl)}
                                sx={{ color: 'text.disabled', fontSize: '0.7rem', textTransform: 'lowercase' }}
                            >
                                view tasks →
                            </MuiLink>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                {/* --- Yesterday's Recap --- */}
                <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                    Yesterday's Recap
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5, textTransform: 'lowercase' }}>
                    completed: {yesterdayStats.completed} • canceled: {yesterdayStats.canceled} • missed: {yesterdayStats.missed}
                </Typography>

                {sortedTasks.length > 0 ? (
                    <Box sx={{
                        maxHeight: 180,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '4px' },
                        '&::-webkit-scrollbar-thumb': { background: '#e0e0e0', borderRadius: '4px' }
                    }}>
                        <List dense disablePadding>
                            {sortedTasks.map((task) => {
                                const isRecurring = !!task.isRecurring;

                                return (
                                    <ListItem
                                        key={task.id}
                                        disableGutters
                                        sx={{
                                            py: 0.5, px: 1, borderRadius: 1,
                                            opacity: task.isResolved ? 0.6 : 1,
                                            display: 'flex', // Ensure flex layout
                                            alignItems: 'center', // Vertical center
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                        secondaryAction={
                                            <MuiLink
                                                component="button"
                                                underline="none"
                                                disabled={task.isResolved}
                                                onClick={() => navigate(`/tasks/${task.id}`, {
                                                    state: { from: location.pathname, fromTitle: "Briefing" }
                                                })}
                                                sx={{ color: task.isResolved ? 'text.disabled' : 'text.secondary', fontSize: '0.65rem' }}
                                            >
                                                detail
                                            </MuiLink>
                                        }
                                    >
                                        <ListItemIcon sx={{ minWidth: 24, display: 'flex', alignItems: 'center' }}>
                                            {isRecurring ? (
                                                <EventRepeatIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                            ) : task.isResolved ? (
                                                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                            ) : (
                                                <AssignmentLateIcon sx={{ fontSize: 16, color: 'error.light' }} />
                                            )}
                                        </ListItemIcon>

                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexGrow: 1, minWidth: 0 }}>
                                            <Typography
                                                variant="body2"
                                                noWrap
                                                sx={{
                                                    fontWeight: 500,
                                                    textDecoration: task.isResolved ? 'line-through' : 'none',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {task.title}
                                            </Typography>

                                            {task.nextRunDate && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    next run: {formatDateCustom(task.nextRunDate)}
                                                </Typography>
                                            )}
                                        </Box>
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: 'center', fontStyle: 'italic' }}>
                        All caught up for yesterday. Great job! 🌟
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default DailyBriefingCard;