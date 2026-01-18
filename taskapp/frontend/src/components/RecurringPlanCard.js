import {
    alpha,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import dayjs from "dayjs";
import { useMemo } from 'react';
import { formatDateCustom, formatFrequency, getPlanPeriodLabel } from '../utils/planFormatters';
import { PLAN_STATUS_CONFIG } from '../utils/planStatus';

export default function RecurringPlanCard({ recurringPlan, targetTitle = "" }) {
    const plan = recurringPlan;
    const status = plan?.displayStatus || "PAUSED";
    const config = PLAN_STATUS_CONFIG[status] || PLAN_STATUS_CONFIG.PAUSED;

    const periodLabel = useMemo(() =>
        getPlanPeriodLabel(recurringPlan, status),
        [recurringPlan, status]);

    if (!plan) {
        return (
            <Card variant="outlined" sx={{ borderRadius: 2, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">No recurring plan active.</Typography>
            </Card>
        );
    }

    return (
        <Card variant="outlined" sx={{ borderRadius: 2, opacity: status === 'COMPLETED' ? 0.7 : 1 }}>
            <CardHeader
                sx={{ pb: 0, pt: 1.5 }}
                title={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            Recurring Plan
                        </Typography>
                        <Chip
                            icon={config.icon}
                            label={config.label}
                            size="small"
                            variant="soft"
                            sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 700,
                                borderRadius: 1,
                                bgcolor: alpha(config.color, 0.1),
                                color: config.color,
                                '& .MuiChip-icon': { color: 'inherit', fontSize: 12 }
                            }}
                        />
                    </Box>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.2, ml: 0.5 }}>
                        Target: {targetTitle}
                    </Typography>
                }
            />

            <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                <Grid container spacing={1} alignItems="stretch">
                    {/* Left: Frequency Box */}
                    <Grid size={5}>
                        <Box sx={{
                            borderLeft: `3px solid ${config.color} `,
                            bgcolor: alpha(config.color, 0.04),
                            pl: 1, pr: 0.5, py: 1,
                            borderRadius: '0 4px 4px 0',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', letterSpacing: 0.5 }}>
                                Frequency
                            </Typography>
                            <Tooltip title={formatFrequency(plan)} arrow>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    sx={{
                                        lineHeight: 1.2,
                                        fontSize: '0.75rem',
                                        color: config.color,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {formatFrequency(plan)}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Grid>

                    {/* Right: Details */}
                    <Grid size={7}>
                        <Stack spacing={0.5} sx={{ height: '100%', justifyContent: 'center', pl: 0.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Next Run</Typography>
                                <Typography variant="caption" fontWeight={700} color={config.color}>
                                    {formatDateCustom(plan.nextRunAt)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="caption" color="text.secondary">Period</Typography>
                                <Tooltip title={periodLabel} placement="left">
                                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ maxWidth: '70%' }}>
                                        <Box sx={{ display: 'flex', fontSize: 12 }}>{config.icon}</Box>
                                        <Typography variant="caption" fontWeight={600} noWrap sx={{ fontSize: '0.65rem' }}>
                                            {periodLabel}
                                        </Typography>
                                    </Stack>
                                </Tooltip>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Footer */}
                    <Grid size={12}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', textAlign: 'right', fontSize: '0.6rem', mt: 0.5 }}>
                            Last sync: {plan.lastGenerateAt ? dayjs(plan.lastGenerateAt).format("MM/DD HH:mm") : 'Never'}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}