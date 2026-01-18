
import {
    Assessment as AssessmentIcon,
    LocalFireDepartment as StreakIcon
} from '@mui/icons-material';
import {
    Box,
    Card, CardContent,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Typography
} from '@mui/material';
import dayjs from 'dayjs';
import * as React from "react";
import { useParams } from "react-router";
import { TargetHeader, TargetHeaderSkeleton } from '../components/TargetHeader';
import TaskScheduleList from '../components/TaskScheduleList';
import { useTarget } from '../hooks/target/useTarget';
import { useTaskSchedules } from '../hooks/TaskSchedules/useTaskSchedules';


function formatDateCustom(dateStr) {
    return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
}

export default function TargetDetail() {
    const { targetId } = useParams();
    const { getTargetById, isLoading } = useTarget();
    const [target, setTarget] = React.useState(null);
    const { taskSchedules, isLoading: isTaskSchedulesLoading, activeFilterCount } = useTaskSchedules({ targetId });

    const getTarget = React.useCallback(() => {
        if (!isLoading) {
            const target = getTargetById(targetId);
            setTarget(target);
        }
    }, [getTargetById, targetId, isLoading]);

    React.useEffect(() => {
        getTarget();
        if (!isTaskSchedulesLoading) {
            console.log("Fetched Task Schedules:", taskSchedules);
        }
    }, [getTarget]);

    const handleEdit = (scheduleItem) => {
        console.log("Edit:", scheduleItem.taskTemplate.id);
        // TODO: 打開編輯 Modal
    };

    const handleDelete = (scheduleItem) => {
        console.log("Delete:", scheduleItem.taskTemplate.id);
        // TODO: 呼叫 useMutation 刪除
    };

    const handleToggle = (scheduleItem) => {
        console.log("Toggle Active:", scheduleItem.recurringPlan.id);
        // TODO: 呼叫 useMutation 更新狀態
    };

    return (
        <Box sx={{ p: 3, width: '100%', flexGrow: 1 }}>
            {/* --- A. HEADER: Target Identity --- */}
            {isLoading ? <TargetHeaderSkeleton /> : <TargetHeader target={target} formatDateCustom={formatDateCustom} />}

            <Divider sx={{ mb: 4 }} />

            <Grid container spacing={4}>
                {/* --- B. METRICS: Progress Analytics --- */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssessmentIcon /> Activity Metrics
                    </Typography>

                    {/* 核心達成率卡片 */}
                    <Card variant="outlined" sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" color="text.secondary">Weekly Target Adherence</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                                <Box sx={{ width: '100%', mr: 1 }}>
                                    {/* 這裡反映的是「本週的執行率」而非「目標總進度」 */}
                                    <LinearProgress
                                        variant="determinate"
                                        value={85} // 範例：本週應做 7 次，做了 6 次
                                        sx={{ height: 10, borderRadius: 5, bgcolor: 'action.selected' }}
                                    />
                                </Box>
                                <Typography variant="body2" fontWeight="bold">85%</Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                6 of 7 tasks completed this week
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* 連續紀錄卡片 (Streaks) */}
                    <Card variant="outlined" sx={{ bgcolor: 'rgba(255, 152, 0, 0.05)', borderColor: 'orange' }}>
                        <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <StreakIcon sx={{ color: 'orange' }} />
                                <Box>
                                    <Typography variant="subtitle2" color="warning.main">Current Streak</Typography>
                                    <Typography variant="h5" fontWeight="bold">12 Days</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* 藍圖統計 */}
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.disabled">
                            Managing {activeFilterCount} Active Blueprints
                        </Typography>
                    </Box>
                </Grid>

                {/* --- C. CONTENT: Task Blueprints --- */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <TaskScheduleList
                        taskSchedules={taskSchedules}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        handleToggle={handleToggle}
                    />
                </Grid>
            </Grid>
        </Box >
    );
}