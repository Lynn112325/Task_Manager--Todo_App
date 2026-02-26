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
import { useActiveTaskCheck } from '../../hooks/task/useActiveTaskCheck';

const DailyBriefingCard = ({ notification, statsSummary }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const missedTaskIds = React.useMemo(() => {
        return notification?.payload?.missedTasks?.map(t => t.id) || [];
    }, [notification]);

    const { data: ActiveIds = [], isLoading: isLoadingActiveCheck } = useActiveTaskCheck(missedTaskIds);

    const stats = React.useMemo(() => ({
        active: statsSummary?.today?.active ?? 0,
        completed: statsSummary?.today?.completed ?? 0,
        canceled: statsSummary?.today?.canceled ?? 0,
    }), [statsSummary?.today]);

    const sortedMissedTasks = React.useMemo(() => {
        if (!notification?.payload?.missedTasks) return [];

        return [...notification.payload.missedTasks].sort((a, b) => {
            const aIsResolved = !a.isRecurring && ActiveIds && !ActiveIds.includes(a.id);
            const bIsResolved = !b.isRecurring && ActiveIds && !ActiveIds.includes(b.id);

            if (aIsResolved === bIsResolved) return 0;
            return aIsResolved ? 1 : -1;
        });
    }, [notification?.payload?.missedTasks, ActiveIds]);

    const recurringMissedCount = notification?.payload?.missedTasks?.filter(
        task => task.isRecurring === true || task.taskTemplateId != null
    ).length || 0;

    const yesterdayStats = React.useMemo(() => ({
        completed: statsSummary?.yesterday?.completed ?? 0,
        canceled: statsSummary?.yesterday?.canceled ?? 0,
        missed: ActiveIds.length + recurringMissedCount,
        total: statsSummary?.yesterday?.total ?? 0,
    }), [statsSummary?.yesterday, ActiveIds]);
    if (!notification || !notification.payload) return null;


    const { title, redirectUrl } = notification;
    const { date, dayOfWeek, missedTasks } = notification.payload;

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

                {/* --- 今日狀態 (Today) --- */}
                <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                        Today's Overview
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 300,
                                letterSpacing: '0.02rem',
                                textTransform: 'lowercase'
                            }}
                        >
                            ongoing: {stats.active} • completed: {stats.completed} • canceled: {stats.canceled}
                        </Typography>

                        {redirectUrl && (
                            <MuiLink
                                component="button"
                                underline="hover"
                                onClick={() => navigate(redirectUrl)}
                                sx={{
                                    color: 'text.disabled',
                                    fontSize: '0.7rem',
                                    fontWeight: 300,
                                    letterSpacing: '0.05rem',
                                    textTransform: 'lowercase',
                                    '&:hover': { color: 'primary.main', opacity: 0.8 }
                                }}
                            >
                                view tasks →
                            </MuiLink>
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                {sortedMissedTasks.length > 0 ? (
                    <>
                        <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                            Yesterday's Recap
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontWeight: 300,
                                letterSpacing: '0.02rem',
                                textTransform: 'lowercase',
                                display: 'block',
                                mb: 1.5
                            }}>
                            completed: {yesterdayStats.completed} • canceled: {yesterdayStats.canceled} • missed: {yesterdayStats.missed}
                        </Typography>

                        <Box sx={{
                            maxHeight: 180,
                            overflowY: 'auto',
                            pr: 1,
                            '&::-webkit-scrollbar': { width: '4px' },
                            '&::-webkit-scrollbar-track': { background: 'transparent' },
                            '&::-webkit-scrollbar-thumb': { background: '#e0e0e0', borderRadius: '4px' },
                            '&::-webkit-scrollbar-thumb:hover': { background: '#bdbdbd' }
                        }}>
                            <List dense disablePadding>
                                {sortedMissedTasks.map((task) => {
                                    // if it's not recurring and not in ActiveIds, it means it's resolved (completed or canceled)
                                    const isResolved = !task.isRecurring && ActiveIds && !ActiveIds.includes(task.id);

                                    return (
                                        <ListItem
                                            key={task.id}
                                            disableGutters
                                            sx={{
                                                py: 0.5,
                                                px: 1,
                                                borderRadius: 1,
                                                opacity: isResolved ? 0.6 : 1,
                                                transition: 'opacity 0.3s ease',
                                                '&:hover': { bgcolor: 'action.hover', '& .detail-btn': { opacity: 0.8 } }
                                            }}
                                            secondaryAction={
                                                <Box textAlign="right" mr={1}>
                                                    <MuiLink
                                                        className="detail-btn"
                                                        component="button"
                                                        underline="none"
                                                        disabled={isResolved}
                                                        onClick={() => navigate(task.taskLink, { state: { from: location.pathname, fromTitle: "Dashboard" } })}
                                                        sx={{
                                                            color: isResolved ? 'text.disabled' : 'text.secondary',
                                                            fontSize: '0.65rem',
                                                            fontWeight: 300,
                                                            letterSpacing: '0.05rem',
                                                            textTransform: 'lowercase',
                                                            opacity: 0.6,
                                                            '&:hover': { color: isResolved ? 'text.disabled' : 'primary.main', opacity: 0.8 }
                                                        }}
                                                    >
                                                        detail
                                                    </MuiLink>
                                                </Box>
                                            }
                                        >
                                            <ListItemIcon sx={{ minWidth: 28, mt: 0.5, alignSelf: 'flex-start' }}>
                                                {task.isRecurring ? (
                                                    <EventRepeatIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                                                ) : isResolved ? (
                                                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                                ) : (
                                                    <AssignmentLateIcon sx={{ fontSize: 16, color: 'error.light', opacity: 0.8 }} />
                                                )}
                                            </ListItemIcon>

                                            <ListItemText
                                                primary={task.title}
                                                secondary={
                                                    task.isRecurring
                                                        ? `next run: ${task.nextRunDate}`
                                                        : isResolved
                                                            ? 'resolved'
                                                            : 'action required'
                                                }
                                                primaryTypographyProps={{
                                                    variant: 'body2',
                                                    color: 'text.primary',
                                                    sx: {
                                                        fontWeight: 500,
                                                        lineHeight: 1.2,
                                                        textDecoration: isResolved ? 'line-through' : 'none',
                                                    }
                                                }}
                                                secondaryTypographyProps={{
                                                    variant: 'caption',
                                                    sx: {
                                                        fontSize: '0.65rem',
                                                        color: task.isRecurring || isResolved ? 'text.disabled' : 'error.main',
                                                        opacity: task.isRecurring ? 0.7 : 0.6,
                                                        textTransform: 'lowercase',
                                                        mt: 0.2
                                                    }
                                                }}
                                                sx={{ pr: 3, my: 0 }}
                                            />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        </Box>
                    </>
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', fontWeight: 300 }}>
                        All caught up for yesterday. Great job! 🌟
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default DailyBriefingCard;