package com.taskmanager.taskapp.taskschedule.recurringplan;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.Weekday;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.target.TargetRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class RecurringPlanService {

        private final RecurringPlanRepository recurringPlanRepository;
        private final TargetRepository targetRepository;
        private final MyUserDetailsService myUserDetailsService;
        private final Clock clock;

        // transform RecurringPlan to RecurringPlanDto
        public RecurringPlanDto toDto(RecurringPlan r) {
                return new RecurringPlanDto(
                                r.getId(),
                                r.getRecurrenceType(),
                                r.getRecurrenceInterval(),
                                r.getRecurrenceDays(),
                                r.getRecurrenceStart(),
                                r.getRecurrenceEnd(),
                                RecurringPlanDto.computeDisplayStatus(r.getStatus(), r.getRecurrenceType(),
                                                r.getRecurrenceStart(),
                                                r.getRecurrenceEnd()),
                                r.getIsHabit(),
                                r.getNextRunAt(),
                                r.getLastGeneratedAt(),
                                r.getCreatedAt(),
                                r.getUpdatedAt());
        }

        // get recurring plan by id
        @Transactional(readOnly = true)
        public RecurringPlanDto getRecurringPlanById(Long recurringPlanId) {

                // check ownership
                Long userId = recurringPlanRepository.findUserIdByPlanId(recurringPlanId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Recurring plan not found"));

                myUserDetailsService.checkOwnership(userId);

                // get the recurring plan by id
                RecurringPlan recurringPlan = recurringPlanRepository.findById(recurringPlanId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Recurring plan not found"));

                return toDto(recurringPlan);
        }

        // get recurring plan by taskTemplateId
        public RecurringPlanDto getRecurringPlanByTemplateId(Long taskTemplateId) {

                // get the recurring plan DTO by taskTemplateId
                RecurringPlan r = recurringPlanRepository.findByTemplateId(taskTemplateId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Recurring plan not found for TaskTemplate ID: " + taskTemplateId));

                // return dto to the client
                return toDto(r);
        }

        // get recurring plans by targetId
        @Transactional(readOnly = true)
        public List<RecurringPlanDto> getRecurringPlansByTargetId(Long targetId) {
                // log.info("Fetching recurring plans for target ID: {}", targetId);

                myUserDetailsService.checkOwnership(targetRepository.findById(targetId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "These recurring plans do not belong to the current user"))
                                .getUser().getId());

                List<RecurringPlan> recurringPlans = recurringPlanRepository.findAllByTargetId(targetId)
                                .stream()
                                .toList();

                // log.info("Found {} recurring plans from database", recurringPlans.size());
                return recurringPlans.stream()
                                .map(this::toDto)
                                .toList();
        }

        public LocalDateTime calculateNextDueDate(RecurringPlan plan, LocalDateTime lastDueDate) {

                // 1. Basic Validation: Skip if plan is paused or has no recurrence
                if (plan.getStatus() == PlanStatus.PAUSED || plan.getRecurrenceType() == RecurrenceType.NONE) {
                        return null;
                }

                // Define "today" globally for this calculation
                LocalDate today = LocalDate.now(clock);

                // 2. Determine the starting point (baseDate)
                LocalDateTime baseDate;
                boolean allowBaseDate;

                if (lastDueDate != null) {
                        // SCENARIO A: Plan has run before. Start from last due date and must skip it
                        // (false).
                        baseDate = lastDueDate;
                        allowBaseDate = false;
                } else {
                        // SCENARIO B: First run. Start from plan start date and can include it (true).
                        baseDate = (plan.getRecurrenceStart() != null) ? plan.getRecurrenceStart()
                                        : LocalDateTime.now(clock);
                        allowBaseDate = true;

                        if (baseDate == null) { // Defensive check
                                baseDate = LocalDateTime.now(clock);
                        }
                }

                LocalDateTime nextDate = null;
                long interval = plan.getRecurrenceInterval();

                // 3. Calculate based on Recurrence Type
                switch (plan.getRecurrenceType()) {
                        case DAILY -> {
                                // Simply add the interval to the base date
                                nextDate = baseDate.plusDays(interval);

                                // Catch-up logic: If the date is in the past, skip cycles until it reaches
                                // today/future
                                if (nextDate.toLocalDate().isBefore(today)) {
                                        long daysBetween = ChronoUnit.DAYS.between(nextDate.toLocalDate(), today);
                                        long skipCycles = (daysBetween + interval - 1) / interval;
                                        nextDate = nextDate.plusDays(skipCycles * interval);
                                }
                        }

                        case WEEKLY -> {
                                // Use helper method for complex weekly rules
                                nextDate = calculateWeeklyNextDate(plan, baseDate, allowBaseDate);

                                // Catch-up logic: If nextDate is in the past, restart search from today
                                // (inclusive)
                                if (nextDate != null && nextDate.toLocalDate().isBefore(today)) {
                                        nextDate = calculateWeeklyNextDate(plan, today.atStartOfDay(), true);
                                }
                        }

                        case MONTHLY -> {
                                // Use the original plan start as an "anchor" to keep the day of the month
                                // consistent
                                LocalDateTime anchor = plan.getRecurrenceStart();
                                long monthsDiff = ChronoUnit.MONTHS.between(anchor.toLocalDate(), today);
                                long cycles = monthsDiff / interval;
                                nextDate = anchor.plusMonths(cycles * interval);

                                // Boundary Protection: Ensure nextDate is after today AND after the baseDate
                                if (nextDate.toLocalDate().isBefore(today) || !nextDate.isAfter(baseDate)) {
                                        nextDate = nextDate.plusMonths(interval);
                                }
                        }

                        case NONE -> {
                                return null;
                        }

                        default -> throw new IllegalArgumentException(
                                        "Unsupported recurrence type: " + plan.getRecurrenceType());
                }

                // 4. End Date Validation
                if (nextDate != null && plan.getRecurrenceEnd() != null) {
                        // If the calculated date is past the plan's end date, the plan is finished
                        if (nextDate.isAfter(plan.getRecurrenceEnd())) {
                                return null;
                        }
                }

                return nextDate;
        }

        /**
         * Handle complex weekly logic (specific days + week intervals)
         * * @param allowBaseDate true: can return baseDate; false: must start searching
         * from tomorrow
         */
        private LocalDateTime calculateWeeklyNextDate(RecurringPlan plan, LocalDateTime baseDate,
                        boolean allowBaseDate) {

                List<Weekday> allowedDaysEnum = plan.getRecurrenceDays();
                int intervalWeeks = plan.getRecurrenceInterval();

                // Step 1: If no specific weekdays (Mon-Sun) are selected, just jump by weeks
                if (allowedDaysEnum == null || allowedDaysEnum.isEmpty()) {
                        return allowBaseDate ? baseDate : baseDate.plusWeeks(intervalWeeks);
                }

                Set<String> allowedDays = allowedDaysEnum.stream()
                                .map(Enum::name)
                                .collect(Collectors.toSet());

                // Step 2: Determine search starting point
                LocalDateTime currentSearchDate;
                if (allowBaseDate) {
                        // Start checking from today (e.g., first run or catch-up)
                        currentSearchDate = baseDate.toLocalDate().atStartOfDay();
                } else {
                        // Start checking from tomorrow (e.g., normal next-occurrence calculation)
                        currentSearchDate = baseDate.toLocalDate().plusDays(1).atStartOfDay();
                }

                // Step 3: Loop through days to find the next valid date within the interval
                // Safety limit: 7 days * interval * 10 to avoid infinite loops
                for (int i = 0; i < 7 * intervalWeeks * 10; i++) {

                        String currentDayName = currentSearchDate.getDayOfWeek().getDisplayName(TextStyle.SHORT,
                                        Locale.ENGLISH);

                        if (allowedDays.contains(currentDayName)) {
                                // Check if this week aligns with the recurrence interval (e.g., every 2nd week)
                                // We compare the current search week to the original start week
                                long weeksBetween = ChronoUnit.WEEKS.between(
                                                plan.getRecurrenceStart().toLocalDate().with(
                                                                TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                                                currentSearchDate.toLocalDate().with(
                                                                TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)));

                                // If the week matches the interval (mod == 0), we found our date
                                if (weeksBetween % intervalWeeks == 0) {
                                        return currentSearchDate;
                                }
                        }
                        // Move to the next day and check again
                        currentSearchDate = currentSearchDate.plusDays(1);
                }
                return null;
        }
}
