import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import { Grid } from "@mui/system";
import dayjs from "dayjs";

// Weekday mapping
const WEEKDAY_MAP = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
};

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return dayjs(dateStr).format("YYYY/MM/DD (ddd)");
}

// Frequency formatter
function formatFrequency(plan) {
    const t = plan.recurrenceType;
    const interval = plan.recurrenceInterval;

    if (t === "DAILY") return "Every day";

    const base =
        t === "WEEKLY" ? "week"
            : t === "MONTHLY" ? "month"
                : t === "YEARLY" ? "year"
                    : t.toLowerCase();

    return interval === 1
        ? `Every ${base}`
        : `Every ${interval} ${base}s`;
}

export default function RecurringPlanCard({ recurringPlan }) {
    if (!recurringPlan) return null;
    const plan = recurringPlan;

    return (
        <Card variant="outlined" sx={{ mb: 2, backgroundColor: "#fafafa", borderRadius: 2 }}>
            <CardContent>
                {/* Header: Title + Active chip */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography variant="h6" fontWeight={600}>
                        Recurring Plan
                    </Typography>

                    <Chip
                        label={plan.isActive ? "Active" : "Inactive"}
                        color={plan.isActive ? "success" : "default"}
                        size="small"
                        variant="filled"
                    />
                </Box>

                <Stack spacing={1.8}>

                    {/* Frequency */}
                    <Box
                        sx={{
                            minWidth: 60,
                            px: 2,
                            py: 0.5,
                            border: "1px solid",
                            borderRadius: 1,
                            borderColor: "#1976d2",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "#1976d2",
                            fontWeight: 500,
                            backgroundColor: "rgba(25, 118, 210, 0.1)",
                        }}
                    >
                        <Typography variant="body1" fontWeight={500} fontSize={16}>
                            {formatFrequency(plan)}
                        </Typography>
                    </Box>

                    {/* Weekly Days */}
                    {plan.recurrenceDays && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Days
                            </Typography>
                            <Typography variant="body1">
                                {plan.recurrenceDays.map(d => WEEKDAY_MAP[d] || d).join(", ")}
                            </Typography>
                        </Box>
                    )}

                    {/* Start Date */}
                    <Grid container>
                        <Grid item size={6}>
                            <Typography variant="caption" color="text.secondary">
                                Start
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(plan.recurrenceStart)}
                            </Typography>
                        </Grid>
                        {/* End Date */}
                        <Grid item size={6}>
                            <Typography variant="caption" color="text.secondary">
                                End
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(plan.recurrenceEnd)}
                            </Typography>
                        </Grid>
                    </Grid>

                    {/* Next Run - highlighted */}
                    <Grid container>
                        <Grid item size={6}>
                            <Typography variant="caption" color="text.secondary">
                                Next Run
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(plan.nextRunAt)}
                            </Typography>
                        </Grid>

                        {/* Last Generated At */}
                        <Grid item size={6}>
                            <Typography variant="caption" color="text.secondary">
                                Last Generated At
                            </Typography>
                            <Typography variant="body1">
                                {formatDate(plan.lastGeneratedAt)}
                            </Typography>
                        </Grid>
                    </Grid>
                </Stack>
            </CardContent>
        </Card>
    );
}
