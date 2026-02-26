package com.taskmanager.taskapp.target.Metrics;

/**
 * Metrics for the user's weekly performance dashboard.
 */
public record MetricsDto(
                // --- Core Counters ---
                int weeklyTotalExpected, // Total tasks scheduled for this week
                int weeklyCompleted, // Total tasks actually finished (Scheduled + Extra)
                int extraTasksCompleted, // Tasks created manually by "Generate Task"

                // --- Progress & Achievement ---
                double completionRate, // Percentage: (weeklyCompleted / weeklyTotalExpected)
                int currentStreak, // Number of consecutive weeks goal was met
                boolean goalMet, // True if weeklyCompleted >= weeklyTotalExpected
                int activeBlueprintsCount, // Number of active recurring plans

                // --- Dynamic Feedback ---
                double weekProgressPercentage, // How much of the current week has passed (e.g., 50% on Wednesday)
                int totalExperiencePoints, // Points earned from completing tasks
                String insightMessage // Simple text like "You are ahead of schedule!"
) {
}