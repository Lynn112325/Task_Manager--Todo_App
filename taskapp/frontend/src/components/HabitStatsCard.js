import { Box, Card, CardContent, Typography } from "@mui/material";
import { Grid } from "@mui/system";

const HabitStatsCard = ({ isHabit, habitStats }) => {
    const stats = habitStats || { doneCount: 0, skippedCount: 0, missedCount: 0 };

    const statItems = [
        { label: "Done", value: stats.doneCount, color: "#4caf50" },
        { label: "Skipped", value: stats.skippedCount, color: "#ff9800" },
        { label: "Missed", value: stats.missedCount, color: "#f44336" },
    ];

    if (!isHabit) {
        return (
            <Card variant="outlined" sx={{ borderRadius: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        This task is not set as a habit.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const hasNoData =
        !habitStats ||
        ((habitStats.doneCount ?? 0) === 0 &&
            (habitStats.skippedCount ?? 0) === 0 &&
            (habitStats.missedCount ?? 0) === 0);

    if (hasNoData) {
        return (
            <Card variant="outlined" sx={{ borderRadius: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        No activity recorded for this habit yet.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary", fontWeight: 700, letterSpacing: 0.5 }}>
                    Habit Log Summary
                </Typography>

                <Grid container spacing={2}>
                    {statItems.map((item) => (
                        <Grid item size={4} key={item.label}>
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    borderLeft: `3px solid ${item.color}`,
                                    pl: 1.5,
                                    py: 0.5,
                                    "&:hover": {
                                        bgcolor: "action.hover",
                                        borderRadius: "0 4px 4px 0",
                                    },
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "text.secondary",
                                        fontWeight: 500,
                                        lineHeight: 1
                                    }}
                                >
                                    {item.label}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        color: "text.primary",
                                        fontWeight: 700,
                                        mt: 0.5
                                    }}
                                >
                                    {item.value}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default HabitStatsCard;
