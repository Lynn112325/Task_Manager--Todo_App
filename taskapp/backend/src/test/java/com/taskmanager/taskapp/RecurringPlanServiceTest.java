package com.taskmanager.taskapp;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.Weekday;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.target.TargetRepository;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlan;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanRepository;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanService;

@ExtendWith(MockitoExtension.class)
class RecurringPlanServiceTest {

    @Mock
    private RecurringPlanRepository recurringPlanRepository;
    @Mock
    private TargetRepository targetRepository;
    @Mock
    private MyUserDetailsService myUserDetailsService;

    private RecurringPlanService service;

    @Mock
    private TaskRepository taskRepository;

    // Test Date: 2026-02-13 (Friday)
    private final LocalDateTime DEFAULT_NOW = LocalDateTime.of(2026, 2, 13, 12, 0);
    private final ZoneId ZONE = ZoneId.systemDefault();
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 3, 3, 10, 0); // Tuesday

    @BeforeEach
    void setUp() {
        // Use a fixed clock so "today" is always 2026-02-13 during tests
        Clock fixedClock = Clock.fixed(DEFAULT_NOW.atZone(ZONE).toInstant(), ZONE);
        service = new RecurringPlanService(
                recurringPlanRepository,
                targetRepository,
                myUserDetailsService,
                fixedClock,
                taskRepository);
    }

    /**
     * Test 1: Plan starts today for the first time.
     * Scenario: Weekly on Friday. Start date is Today (Friday).
     * Expect: It should return Today because allowBaseDate is true for first runs.
     */
    @Test
    @DisplayName("Weekly - First Run (Today match)")
    void testWeeklyFirstRun_TodayMatch() {
        RecurringPlan plan = createWeeklyPlan(1, List.of(Weekday.Fri));
        plan.setRecurrenceStart(DEFAULT_NOW);

        // lastDueDate = null means it's the first time running
        LocalDateTime nextDate = service.calculateNextDueDate(plan);

        assertNotNull(nextDate);
        assertEquals(DEFAULT_NOW.toLocalDate(), nextDate.toLocalDate());
    }

    /**
     * Test 2: Standard cycle where last run was today.
     * Scenario: Weekly on Friday. Last run was Today.
     * Expect: It should skip today and return Next Friday.
     */
    @Test
    @DisplayName("Weekly - Next Occurrence (Skip today)")
    void testWeeklyNormalRun_SkipToday() {
        RecurringPlan plan = createWeeklyPlan(1, List.of(Weekday.Fri));
        plan.setRecurrenceStart(DEFAULT_NOW.minusWeeks(1));

        // Task was already completed today
        plan.setNextRunAt(DEFAULT_NOW);

        LocalDateTime nextDate = service.calculateNextDueDate(plan);

        assertNotNull(nextDate);
        // Should skip today and find next Friday (2026-02-20)
        assertEquals(DEFAULT_NOW.plusWeeks(1).toLocalDate(), nextDate.toLocalDate());
    }

    /**
     * Test 3: Catch-up logic for old plans.
     * Scenario: Weekly on Monday. Last run was 1 month ago.
     * Expect: System should skip all past Mondays and find the first Monday in the
     * future.
     */
    @Test
    @DisplayName("Weekly - Catch Up from past")
    void testWeeklyCatchUp() {
        RecurringPlan plan = createWeeklyPlan(1, List.of(Weekday.Mon));

        // Start date in the past: 2026-01-05
        LocalDateTime baseStart = LocalDateTime.of(2026, 1, 5, 10, 0);
        plan.setRecurrenceStart(baseStart);

        // Last run was also long ago
        plan.setNextRunAt(baseStart.plusWeeks(1));

        // Act (Today is Feb 13, Friday)
        LocalDateTime nextDate = service.calculateNextDueDate(plan);

        assertNotNull(nextDate);
        // The first Monday after Today (Feb 13) is Feb 16
        assertEquals(LocalDate.of(2026, 2, 16), nextDate.toLocalDate());
        assertTrue(nextDate.isAfter(DEFAULT_NOW));
    }

    /**
     * Test 4: Smart Interval Catch-up (Every 2 weeks).
     * Scenario: Plan runs every 2 weeks on Monday. It hasn't run for 8 weeks.
     * Expect: It must find a Monday that aligns with the 2-week interval, not just
     * any Monday.
     */
    @Test
    @DisplayName("Bi-Weekly - Smart Interval Alignment")
    void testBiWeeklySmartCatchUp() {
        RecurringPlan plan = createWeeklyPlan(2, List.of(Weekday.Mon)); // Interval = 2

        // Start Date: 10 weeks ago on a Monday
        LocalDateTime baseMonday = DEFAULT_NOW.minusWeeks(10)
                .with(java.time.temporal.TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        plan.setRecurrenceStart(baseMonday);

        // Last run: 8 weeks ago (Aligned with interval)
        plan.setNextRunAt(baseMonday.plusWeeks(2));

        // Act
        LocalDateTime nextDate = service.calculateNextDueDate(plan);

        assertNotNull(nextDate);

        // Logical check:
        // Today is Feb 13 (Week 10).
        // Feb 16 is Week 11 (Odd week - Skip).
        // Feb 23 is Week 12 (Even week - Match).
        assertEquals(LocalDate.of(2026, 2, 23), nextDate.toLocalDate());

        long weeksFromStart = ChronoUnit.WEEKS.between(baseMonday.toLocalDate(), nextDate.toLocalDate());
        assertEquals(0, weeksFromStart % 2, "Interval must be a multiple of 2");
    }

    /**
     * Test 5: New Year boundary.
     * Scenario: Today is Dec 30, 2025. Plan runs every Thursday.
     * Expect: It should correctly jump to Jan 01, 2026.
     */
    @Test
    @DisplayName("Weekly - Cross Year Boundary")
    void testWeeklyCrossYear() {
        // Set clock to end of 2025
        LocalDateTime endOf2025 = LocalDateTime.of(2025, 12, 30, 12, 0);
        setClockTo(endOf2025);

        RecurringPlan plan = createWeeklyPlan(1, List.of(Weekday.Thu));
        plan.setRecurrenceStart(endOf2025.minusWeeks(1));

        LocalDateTime nextDate = service.calculateNextDueDate(plan);

        assertNotNull(nextDate);
        assertEquals(LocalDate.of(2026, 1, 1), nextDate.toLocalDate());
        assertEquals(DayOfWeek.THURSDAY, nextDate.getDayOfWeek());
    }

    /**
     * Test 6: Fallback when no weekdays are selected.
     * Scenario: Plan is Weekly with interval 2, but no specific days (Mon-Sun)
     * selected.
     * Expect: Simply add 2 weeks to the base date.
     */
    @Test
    @DisplayName("Weekly - No Specific Day (Simple Plus Weeks)")
    void testWeeklyNoDaySpecified() {
        RecurringPlan plan = createWeeklyPlan(2, null);
        plan.setRecurrenceStart(DEFAULT_NOW.minusWeeks(4));

        // Last run was 2 weeks ago
        plan.setNextRunAt(DEFAULT_NOW.minusWeeks(2));

        LocalDateTime nextDate = service.calculateNextDueDate(plan);

        // Expect: 2 weeks after last run is Today
        assertNotNull(nextDate);
        assertEquals(DEFAULT_NOW.toLocalDate(), nextDate.toLocalDate());
    }

    @Test
    @DisplayName("Scenario B: First execution should use startPoint as baseDate")
    void testFirstExecution_UsesStartPoint() {
        // Arrange
        RecurringPlan plan = createDailyPlan(NOW, 1); // Starts today, interval 1

        // Act: lastDueDate is NULL (First run)
        LocalDateTime result = service.calculateNextDueDate(plan);

        // Assert: For Daily, if allowBaseDate is true, it adds interval to baseDate
        // baseDate = NOW, nextDate = NOW + 1 day = March 4
        assertEquals(NOW.plusDays(1), result);
    }

    @Test
    @DisplayName("Scenario A: Historical run should find the NEXT occurrence after lastDueDate")
    void testHistoricalRun_CalculatesAfterLastDueDate() {
        // Arrange
        RecurringPlan plan = createDailyPlan(NOW.minusDays(5), 1); // Plan started 5 days ago
        plan.setNextRunAt(NOW.minusDays(1)); // Ran yesterday

        // Act
        LocalDateTime result = service.calculateNextDueDate(plan);

        // Assert: baseDate = lastRun, allowBaseDate = false.
        // nextDate = lastRun + 1 day = TODAY (March 3)
        assertEquals(NOW, result);
    }

    @Test
    @DisplayName("Scenario A: Start date moved forward should override old lastDueDate")
    void testHistoricalRun_StartDateMovedForward() {
        // Arrange
        LocalDateTime newStartPoint = NOW.plusDays(10); // Start moved far into future

        RecurringPlan plan = createDailyPlan(newStartPoint, 1);
        plan.setNextRunAt(LocalDateTime.of(2026, 1, 1, 10, 0));

        // Act
        LocalDateTime result = service.calculateNextDueDate(plan);

        // Assert: baseDate should be newStartPoint because oldLastRun is before
        // startPoint
        // nextDate = March 13 + 1 day = March 14
        assertEquals(newStartPoint.plusDays(1), result);
    }

    @Test
    @DisplayName("Duplication Check: Should return null if task already exists for calculated date")
    void testDuplicateTaskCheck_ReturnsNull() {
        // Arrange
        RecurringPlan plan = createDailyPlan(NOW.minusDays(5), 1);
        plan.setNextRunAt(NOW.minusDays(1));
        LocalDateTime expectedNextDate = NOW; // March 3

        // Mock: The repository finds that a task already exists for March 3
        when(taskRepository.existsByTaskTemplateIdAndDueDate(any(), eq(expectedNextDate)))
                .thenReturn(true);

        // Act
        LocalDateTime result = service.calculateNextDueDate(plan);

        // Assert
        assertNull(result, "Should return null because task already exists");
        verify(taskRepository).existsByTaskTemplateIdAndDueDate(plan.getId(), expectedNextDate);
    }

    // --- Helpers ---

    private RecurringPlan createWeeklyPlan(int interval, List<Weekday> days) {
        RecurringPlan plan = new RecurringPlan();
        plan.setId(1L);
        plan.setStatus(PlanStatus.ACTIVE);
        plan.setRecurrenceType(RecurrenceType.WEEKLY);
        plan.setRecurrenceInterval(interval);
        plan.setRecurrenceDays(days);
        return plan;
    }

    // Helper to create a plan quickly
    private RecurringPlan createDailyPlan(LocalDateTime start, int interval) {
        RecurringPlan plan = new RecurringPlan();
        plan.setId(1L);
        plan.setRecurrenceType(RecurrenceType.DAILY);
        plan.setRecurrenceInterval(interval);
        plan.setRecurrenceStart(start);
        plan.setStatus(PlanStatus.ACTIVE);
        return plan;
    }

    private void setClockTo(LocalDateTime specificTime) {
        Clock specificClock = Clock.fixed(specificTime.atZone(ZONE).toInstant(), ZONE);
        service = new RecurringPlanService(
                recurringPlanRepository,
                targetRepository,
                myUserDetailsService,
                specificClock,
                taskRepository);
    }
}