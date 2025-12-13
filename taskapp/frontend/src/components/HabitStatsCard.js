import { Card, CardContent, Typography } from "@mui/material";
import { Grid } from "@mui/system";

const HabitStatsCard = ({ habitStats }) => {
    const stats = habitStats || { doneCount: 0, skippedCount: 0, missedCount: 0 };

    const statItems = [
        { label: "Done", value: stats.doneCount, color: "#4caf50" },
        { label: "Skipped", value: stats.skippedCount, color: "#ff9800" },
        { label: "Missed", value: stats.missedCount, color: "#f44336" },
    ];

    const hasNoData =
        !habitStats ||
        ((habitStats.doneCount ?? 0) === 0 &&
            (habitStats.skippedCount ?? 0) === 0 &&
            (habitStats.missedCount ?? 0) === 0);

    if (hasNoData) {
        return (
            <Card variant="outlined" sx={{ mb: 2, backgroundColor: "#fafafa" }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Habit Log
                    </Typography>
                    <Typography color="text.secondary">
                        No habit records found yet.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card variant="outlined" sx={{ backgroundColor: "#fafafa" }}>
            <CardContent>
                <Typography variant="h6" sx={{ mb: 1 }}>
                    Habit Log Summary
                </Typography>
                <Grid container spacing={2}>
                    {statItems.map((item) => (
                        <Grid item size={4}
                            key={item.label}
                            sx={{
                                minWidth: 60,
                                px: 2,
                                py: 0.5,
                                border: "1px solid",
                                borderRadius: 1,
                                borderColor: item.color,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                color: item.color,
                                fontWeight: 500,
                                backgroundColor: "#fbfbfbd8",
                            }}
                        >
                            <Typography variant="body2">
                                {item.label}: {item.value}
                            </Typography>
                        </Grid >
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default HabitStatsCard;
