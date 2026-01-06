import { Box, Card, CardContent, CardHeader, Chip, Grid, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";

function formatDateCustom(dateStr) {
    return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
}

// Frequency formatter (保持原本邏輯，UI層面處理換行)
function formatFrequency(plan) {
    const t = plan.recurrenceType;
    if (t === "DAILY") return "Every day";

    const interval = plan.recurrenceInterval;
    const base = t === "WEEKLY" ? "week"
        : t === "MONTHLY" ? "month"
            : t === "YEARLY" ? "year"
                : t.toLowerCase();

    let weekDays = "";
    if (plan.recurrenceDays.length > 0) {
        weekDays = " on " + plan.recurrenceDays.map(d => d).join(", ")
    }
    return interval === 1
        ? `Every ${base}` + weekDays
        : `Every ${interval} ${base}s` + weekDays;
}

export default function RecurringPlanCard({ recurringPlan, targetTitle }) {
    const plan = recurringPlan;

    const periodText = (!plan?.recurrenceStart && !plan?.recurrenceEnd)
        ? "∞"
        : `${plan?.recurrenceStart ? formatDateCustom(plan.recurrenceStart) : 'Now'} — ${plan?.recurrenceEnd ? formatDateCustom(plan.recurrenceEnd) : '∞'}`;

    if (!plan) {
        return (
            <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        No recurring plan active.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardHeader
                sx={{}}
                title={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            🔄 Recurring Plan
                        </Typography>
                        <Chip
                            label={plan.isActive ? "Active" : "Inactive"}
                            color={plan.isActive ? "success" : "default"}
                            size="small"
                            variant="soft"
                            sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, borderRadius: 1 }}
                        />
                    </Box>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
                        Target: {targetTitle}
                    </Typography>
                }
            />

            <CardContent sx={{ p: 1 }}>
                <Grid container spacing={1.5} alignItems="stretch">

                    <Grid item size={5}>
                        <Box sx={{
                            borderLeft: `3px solid`,
                            borderColor: 'primary.main',
                            bgcolor: 'action.hover',
                            pl: 1, pr: 0.5, py: 1,
                            borderRadius: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                        }}>
                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, mb: 0.5 }}>
                                Frequency
                            </Typography>
                            <Tooltip title={formatFrequency(plan)} placement="top">
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    sx={{
                                        lineHeight: 1.2,
                                        fontSize: '0.8rem',
                                        wordBreak: 'break-word',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {formatFrequency(plan)}
                                </Typography>
                            </Tooltip>
                        </Box>
                    </Grid>

                    <Grid item size={7}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            height: '100%',
                            gap: 0.8
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', mr: 1 }}>
                                    Next Run
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="primary.main" noWrap>
                                    {formatDateCustom(plan.nextRunAt)}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 0 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', mr: 1 }}>
                                    Period
                                </Typography>
                                <Tooltip title={periodText} placement="left">
                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        sx={{
                                            color: 'text.primary',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '100%',
                                            textAlign: 'right'
                                        }}
                                    >
                                        {periodText}
                                    </Typography>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Grid>

                    {/* Footer */}
                    <Grid item size={12} sx={{ pt: '4px !important' }}>
                        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic', display: 'block', textAlign: 'right', fontSize: '0.65rem' }}>
                            Last generated: {dayjs(plan.lastGenerateAt).format("YYYY/MM/DD (ddd) HH:mm")}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}