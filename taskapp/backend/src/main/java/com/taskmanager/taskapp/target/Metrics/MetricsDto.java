package com.taskmanager.taskapp.target.Metrics;

/**
 * Metrics for the user's performance dashboard.
 */
public record MetricsDto(
        // --- Core Counters ---
        int totalExpected, // Total tasks scheduled
        int totalCompleted, // Total tasks actually finished (Scheduled + Extra)
        int extraTasksCompleted, // Tasks created manually by "Generate Task"

        // --- Progress & Achievement ---
        double completionRate, // Percentage: (totalCompleted / totalExpected)
        int currentStreak, // Number of consecutive weeks goal was met
        boolean goalMet, // True if totalCompleted >= totalExpected
        int activeBlueprintsCount, // Number of active recurring plans

        // --- Dynamic Feedback ---
        double progressPercentage, // How much of the current week has passed (e.g., 50%)
        int totalExperiencePoints, // Points earned from completing tasks
        String insightMessage // Simple text like "You are ahead of schedule!"
) {
}