package com.taskmanager.taskapp.target.Metrics;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

/**
 * Service responsible for calculating user activity metrics and progress
 * insights.
 */
@Service
@RequiredArgsConstructor
public class MetricsService {

    private final MetricsRepository metricsRepository;

    public enum TimeGrain {
        WEEKLY, MONTHLY
    }

    /**
     * Calculates and aggregates metrics for a specific user and target.
     *
     * @param userId   The ID of the user.
     * @param targetId The ID of the specific target (can be null for global
     *                 metrics).
     * @param grain    The timeframe (WEEKLY or MONTHLY).
     * @return A MetricsDto containing calculated statistics and insights.
     */
    public MetricsDto getMetrics(Long userId, Long targetId, TimeGrain grain) {
        // 1. Calculate time range based on the selected grain
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start;
        LocalDateTime end;

        if (grain == TimeGrain.WEEKLY) {
            // Set start to Monday 00:00:00 and end to Sunday 23:59:59
            start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).with(LocalTime.MIN);
            end = start.plusDays(7).minusNanos(1);
        } else {
            // Set start to first day of month and end to last day of month
            start = now.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
            end = now.with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
        }

        // 2. Fetch raw data from the repository
        Map<String, Object> counts = metricsRepository.getTaskCounts(userId, targetId, start, end);
        int totalExpected = ((Number) counts.getOrDefault("total", 0)).intValue();
        int completed = ((Number) counts.getOrDefault("completed", 0)).intValue();
        int extraCompleted = ((Number) counts.getOrDefault("extra", 0)).intValue();

        int activeBlueprints = metricsRepository.countActiveBlueprints(userId, targetId);
        int xp = metricsRepository.sumExperiencePoints(userId, targetId, start, end).orElse(0);

        // 3. Calculate completion ratios and progress
        double completionRate = totalExpected == 0 ? 0 : (double) completed / totalExpected;
        boolean goalMet = totalExpected > 0 && completed >= totalExpected;

        // Calculate how much of the current period has elapsed (e.g., it's Wednesday,
        // so 3/7 of the week is over)
        double progressPercentage = calculateProgress(grain, now);

        // 4. Calculate Streaks
        // Calculate the streak from previous periods and add 1 if the current period's
        // goal is met
        int pastStreak = calculateCurrentStreak(userId, targetId, grain, start);
        int currentStreak = goalMet ? pastStreak + 1 : pastStreak;

        return new MetricsDto(
                totalExpected,
                completed,
                extraCompleted,
                completionRate,
                currentStreak,
                goalMet,
                activeBlueprints,
                progressPercentage,
                xp,
                generateInsight(completionRate, progressPercentage));
    }

    /**
     * Calculates the percentage of the current timeframe that has passed.
     */
    private double calculateProgress(TimeGrain grain, LocalDateTime now) {
        if (grain == TimeGrain.WEEKLY) {
            return (double) now.getDayOfWeek().getValue() / 7.0;
        } else {
            double dayOfMonth = now.getDayOfMonth();
            double totalDays = now.toLocalDate().lengthOfMonth();
            return dayOfMonth / totalDays;
        }
    }

    /**
     * Recursively checks previous periods to determine the current consecutive
     * success streak.
     * * @param currentStart The start date of the current active period.
     * 
     * @return The number of consecutive previous periods where the goal was met.
     */
    private int calculateCurrentStreak(Long userId, Long targetId, TimeGrain grain, LocalDateTime currentStart) {
        int streak = 0;
        LocalDateTime checkStart = currentStart;

        // Limit lookback depth to prevent performance degradation (e.g., 52 weeks or 12
        // months)
        int maxLookback = (grain == TimeGrain.WEEKLY) ? 52 : 12;

        for (int i = 0; i < maxLookback; i++) {
            // Move back exactly one period (one week or one month)
            LocalDateTime prevEnd = checkStart.minusNanos(1);
            if (grain == TimeGrain.WEEKLY) {
                checkStart = checkStart.minusWeeks(1);
            } else {
                checkStart = checkStart.minusMonths(1);
            }

            // Verify if the goal was achieved in this specific historical period
            Integer result = metricsRepository.isGoalMetInPeriod(userId, targetId, checkStart, prevEnd);
            boolean met = result != null && result == 1;

            if (met) {
                streak++;
            } else {
                // Streak is broken as soon as a single period goal is not met
                break;
            }
        }
        return streak;
    }

    /**
     * Generates a dynamic motivational message based on performance vs. time
     * elapsed.
     */
    private String generateInsight(double rate, double progress) {
        // High performance: Completion rate significantly exceeds time progress
        if (rate >= progress + 0.1)
            return "You're smashing it! Ahead of schedule. 🔥";

        // Underperformance: Completion rate is significantly behind time progress
        if (rate < progress - 0.2)
            return "A bit behind. You can catch up! 💪";

        // Neutral/Steady performance
        return "Steady as she goes. Keep the momentum!";
    }
}