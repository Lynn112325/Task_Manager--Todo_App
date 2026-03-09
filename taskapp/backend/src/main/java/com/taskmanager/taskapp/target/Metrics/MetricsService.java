package com.taskmanager.taskapp.target.Metrics;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.enums.Weekday;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlan;

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
        // int totalExpected = ((Number) counts.getOrDefault("total", 0)).intValue();
        int completed = ((Number) counts.getOrDefault("completed", 0)).intValue();
        int extraCompleted = ((Number) counts.getOrDefault("extra", 0)).intValue();

        int activeBlueprints = metricsRepository.countActiveBlueprints(userId, targetId);
        int xp = metricsRepository.sumExperiencePoints(userId, targetId, start, end).orElse(0);

        List<RecurringPlan> activePlans = metricsRepository.findActivePlansInPeriod(userId, targetId, start, end);
        int totalExpected = calculateExpectedTaskCount(activePlans, start, end);

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
                generateInsight(totalExpected, completed, activeBlueprints, completionRate, progressPercentage));
    }

    /**
     * Calculates the total expected task count for the given period.
     * - For periodic plans: Estimates occurrences based on the recurrence rules.
     * - For 'NONE' plans: Counts the actual manual tasks created by the user within
     * the period.
     */
    private int calculateExpectedTaskCount(List<RecurringPlan> plans, LocalDateTime start, LocalDateTime end) {
        int recurringExpected = 0;
        int noneExpected = 0;

        for (RecurringPlan plan : plans) {
            if (plan.getRecurrenceType() == RecurrenceType.NONE) {
                // Count user-created manual tasks as the expectation
                noneExpected += metricsRepository.countManualTasksInPeriod(
                        plan.getTaskTemplate().getId(),
                        start,
                        end);
            } else {
                // Project future occurrences based on recurrence rules
                recurringExpected += countOccurrencesInPeriod(plan, start, end);
            }
        }
        return recurringExpected + noneExpected;
    }

    /**
     * Calculates the theoretical number of task occurrences within a specific time
     * period.
     * Uses mathematical projection based on the plan's recurrence rules without
     * querying the database.
     */
    private int countOccurrencesInPeriod(RecurringPlan plan, LocalDateTime periodStart, LocalDateTime periodEnd) {
        // 1. Determine the effective intersection window
        LocalDateTime effectiveStart = plan.getRecurrenceStart().isAfter(periodStart)
                ? plan.getRecurrenceStart()
                : periodStart;

        LocalDateTime effectiveEnd = (plan.getRecurrenceEnd() != null && plan.getRecurrenceEnd().isBefore(periodEnd))
                ? plan.getRecurrenceEnd()
                : periodEnd;

        // If the valid window is negative or invalid, zero occurrences exist
        if (effectiveStart.isAfter(effectiveEnd)) {
            return 0;
        }

        int count = 0;
        LocalDateTime anchor = plan.getRecurrenceStart();
        long interval = plan.getRecurrenceInterval();

        // 2. Project occurrences based on recurrence type
        switch (plan.getRecurrenceType()) {
            case DAILY -> {
                // Find rough starting cycle using days difference
                long daysBetween = ChronoUnit.DAYS.between(anchor, effectiveStart);
                long skipCycles = daysBetween > 0 ? (daysBetween + interval - 1) / interval : 0;

                LocalDateTime current = anchor.plusDays(skipCycles * interval);

                // Catch-up: precisely align with effectiveStart (handles time-of-day offsets)
                while (current.isBefore(effectiveStart)) {
                    current = current.plusDays(interval);
                }

                // Count valid occurrences within the window
                while (!current.isAfter(effectiveEnd)) {
                    count++;
                    current = current.plusDays(interval);
                }
            }

            case WEEKLY -> {
                List<Weekday> allowedDaysEnum = plan.getRecurrenceDays();

                // Scenario A: No specific days, simple week interval jump
                if (allowedDaysEnum == null || allowedDaysEnum.isEmpty()) {
                    long weeksBetween = ChronoUnit.WEEKS.between(anchor, effectiveStart);
                    long skipCycles = weeksBetween > 0 ? (weeksBetween + interval - 1) / interval : 0;

                    LocalDateTime current = anchor.plusWeeks(skipCycles * interval);

                    while (current.isBefore(effectiveStart)) {
                        current = current.plusWeeks(interval);
                    }
                    while (!current.isAfter(effectiveEnd)) {
                        count++;
                        current = current.plusWeeks(interval);
                    }
                }
                // Scenario B: Complex specific weekdays logic
                else {
                    Set<String> allowedDays = allowedDaysEnum.stream()
                            .map(Enum::name)
                            .collect(Collectors.toSet());

                    LocalDate anchorMonday = anchor.toLocalDate()
                            .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

                    // Iterate through the dates in the effective window
                    LocalDate currentScanDate = effectiveStart.toLocalDate();
                    LocalDate endDate = effectiveEnd.toLocalDate();

                    while (!currentScanDate.isAfter(endDate)) {
                        String dayName = currentScanDate.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

                        if (allowedDays.contains(dayName)) {
                            LocalDate currentMonday = currentScanDate
                                    .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                            long weeksBetween = ChronoUnit.WEEKS.between(anchorMonday, currentMonday);

                            // If the week matches the interval cycle
                            if (weeksBetween % interval == 0) {
                                // Reconstruct the exact occurrence time to ensure it strictly falls within the
                                // bounds
                                LocalDateTime actualOccurrence = currentScanDate.atTime(anchor.toLocalTime());
                                if (!actualOccurrence.isBefore(effectiveStart)
                                        && !actualOccurrence.isAfter(effectiveEnd)) {
                                    count++;
                                }
                            }
                        }
                        currentScanDate = currentScanDate.plusDays(1);
                    }
                }
            }

            case MONTHLY -> {
                // Calculate base cycles elapsed from anchor
                long monthsBetween = ChronoUnit.MONTHS.between(anchor.toLocalDate(), effectiveStart.toLocalDate());
                long cyclesElapsed = Math.max(0, monthsBetween) / interval;

                LocalDateTime current = anchor.plusMonths(cyclesElapsed * interval);

                // Catch-up: ensure we pass the effectiveStart
                while (current.isBefore(effectiveStart)) {
                    current = current.plusMonths(interval);
                }

                // Count occurrences up to effectiveEnd
                while (!current.isAfter(effectiveEnd)) {
                    count++;
                    current = current.plusMonths(interval);
                }
            }

            case NONE -> {
                break;
            }
        }

        return count;
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
     * Calculates the current success streak by looking back through historical task
     * data.
     * The logic treats 'CANCELED' tasks as excused, reducing the required threshold
     * for that period without breaking the streak.
     * * @return The number of consecutive periods where the completion goal was
     * met.
     */
    private int calculateCurrentStreak(Long userId, Long targetId, TimeGrain grain, LocalDateTime currentStart) {
        // Look back limit: 1 year (52 weeks or 12 months)
        int maxLookback = (grain == TimeGrain.WEEKLY) ? 52 : 12;
        LocalDateTime historicalStart = (grain == TimeGrain.WEEKLY)
                ? currentStart.minusWeeks(maxLookback)
                : currentStart.minusMonths(maxLookback);

        // 1. Fetch all system-generated tasks (excluding manual/extra tasks) for
        // history
        List<Task> allTasks = metricsRepository.findAllGeneratedTasksInPeriod(userId, targetId, historicalStart,
                currentStart);

        // Group tasks by period start date and their current status
        Map<LocalDateTime, Map<TaskStatus, Long>> stats = allTasks.stream()
                .collect(Collectors.groupingBy(
                        t -> truncateToPeriodStart(t.getDueDate(), grain),
                        Collectors.groupingBy(Task::getStatus, Collectors.counting())));

        int streak = 0;
        LocalDateTime checkStart = currentStart;

        for (int i = 0; i < maxLookback; i++) {
            // Move the cursor back by one period
            if (grain == TimeGrain.WEEKLY)
                checkStart = checkStart.minusWeeks(1);
            else
                checkStart = checkStart.minusMonths(1);

            Map<TaskStatus, Long> periodStats = stats.getOrDefault(checkStart, Collections.emptyMap());

            // Core Logic:
            // Total expected tasks for this period is the sum of all generated tasks
            // (COMPLETED + CANCELED + MISSED)
            long totalGenerated = periodStats.values().stream().mapToLong(Long::longValue).sum();
            long completed = periodStats.getOrDefault(TaskStatus.COMPLETED, 0L);
            long canceled = periodStats.getOrDefault(TaskStatus.CANCELED, 0L);

            // Adjusted goal: Subtract canceled (excused) tasks from the total expectation
            long adjustedExpected = Math.max(0, totalGenerated - canceled);

            // Streak Freeze Logic:
            if (adjustedExpected == 0) {
                // If all plans were paused (no tasks) or all tasks were canceled (e.g.,
                // illness),
                // skip this period without increasing or breaking the streak.
                if (streak > 0)
                    continue;
                else
                    break;
            }

            // Success Check:
            if (completed >= adjustedExpected) {
                streak++; // Goal met, increment streak
            } else {
                break; // Goal missed, end the streak lookback
            }
        }
        return streak;
    }

    /**
     * Normalizes a date to the beginning of its time grain (Monday for weeks, 1st
     * for months).
     * This ensures Map keys are consistent regardless of the specific time of the
     * due date.
     */
    private LocalDateTime truncateToPeriodStart(LocalDateTime date, TimeGrain grain) {
        if (grain == TimeGrain.WEEKLY) {
            return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).with(LocalTime.MIN);
        }
        return date.with(TemporalAdjusters.firstDayOfMonth()).with(LocalTime.MIN);
    }

    /**
     * Generates a dynamic motivational message based on performance, time elapsed,
     * and active goals.
     */
    private String generateInsight(int totalExpected, int completed, int activeBlueprints, double rate,
            double progress) {

        // 1. No active goals or plans found
        if (activeBlueprints == 0 && totalExpected == 0) {
            return "You don't have any active plans right now. Time to set some new goals! 🎯";
        }

        // 2. Goal already achieved or exceeded for the current period
        if (totalExpected > 0 && completed >= totalExpected) {
            return "Target smashed! Outstanding work for this period! 🌟";
        }

        // 3. Early period start (e.g., Monday or 1st of the month, < 20% elapsed) with
        // no tasks done
        if (progress <= 0.2 && completed == 0) {
            return "A fresh start! Let's get the ball rolling. 🌱";
        }

        // 4. Ahead of schedule (completion rate is > 10% higher than time elapsed)
        if (rate >= progress + 0.1) {
            return "You're smashing it! Ahead of schedule. 🔥";
        }

        // 5. Falling behind (completion rate is > 20% lower than time elapsed)
        if (rate < progress - 0.2) {
            // Case A: Near the end of the period (e.g., Weekend or end of month, > 80%
            // elapsed)
            if (progress > 0.8) {
                return "Time is running out! Let's make a final push! ⏳";
            }
            // Case B: Middle of the period, still time to recover
            return "A bit behind, but you still have time to catch up! 💪";
        }

        // 6. Default state: Stable progress
        return "Steady as she goes. Keep the momentum! 🏃";
    }
}