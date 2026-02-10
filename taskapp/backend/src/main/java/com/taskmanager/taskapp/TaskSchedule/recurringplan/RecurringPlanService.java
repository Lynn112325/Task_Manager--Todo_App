package com.taskmanager.taskapp.TaskSchedule.recurringplan;

import java.time.DayOfWeek;
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

                log.info("Current user ID: {}", myUserDetailsService.getCurrentUserId());

                List<RecurringPlan> recurringPlans = recurringPlanRepository.findAllByTargetId(targetId)
                                .stream()
                                .toList();

                // log.info("Found {} recurring plans from database", recurringPlans.size());
                return recurringPlans.stream()
                                .map(this::toDto)
                                .toList();
        }

        public LocalDateTime calculateNextDueDate(RecurringPlan plan, LocalDateTime lastDueDate) {
                // 1. Basic check: Do not generate if plan is paused or has no recurrence
                if (plan.getStatus() == PlanStatus.PAUSED || plan.getRecurrenceType() == RecurrenceType.NONE) {
                        return null;
                }

                // 2. Determine the starting point
                // Use recurrence_start if first time; otherwise, use the date of the last task
                LocalDateTime baseDate = (lastDueDate == null) ? plan.getRecurrenceStart() : lastDueDate;
                if (baseDate == null) {
                        baseDate = LocalDateTime.now();
                }

                LocalDateTime nextDate = null;

                // 3. Calculate based on recurrence type
                switch (plan.getRecurrenceType()) {
                        case DAILY:
                                nextDate = baseDate.plusDays(plan.getRecurrenceInterval());
                                break;

                        case WEEKLY:
                                nextDate = calculateWeeklyNextDate(plan, baseDate);
                                break;

                        case MONTHLY:
                                nextDate = baseDate.plusMonths(plan.getRecurrenceInterval());
                                break;
                        default:
                                break;
                }

                // 4. Boundary check: Do not exceed the plan's end date
                if (nextDate != null && plan.getRecurrenceEnd() != null) {
                        if (nextDate.isAfter(plan.getRecurrenceEnd())) {
                                return null; // Stop cycle if next date is after end date
                        }
                }

                return nextDate;
        }

        /**
         * Handle complex weekly logic (includes week intervals and specific weekdays)
         */
        private LocalDateTime calculateWeeklyNextDate(RecurringPlan plan, LocalDateTime baseDate) {
                List<Weekday> allowedDaysEnum = plan.getRecurrenceDays();
                int intervalWeeks = plan.getRecurrenceInterval(); // Example: 2 means every 2nd week

                // If no specific weekdays are set, simply add the number of weeks
                if (allowedDaysEnum == null || allowedDaysEnum.isEmpty()) {
                        return baseDate.plusWeeks(intervalWeeks);
                }

                Set<String> allowedDays = allowedDaysEnum.stream()
                                .map(Enum::name)
                                .collect(Collectors.toSet());

                // Start searching from the day after the baseDate
                LocalDateTime searchDate = baseDate.plusDays(1);

                // Limit search range to prevent infinite loops (max 10 cycles)
                for (int i = 0; i < 7 * intervalWeeks * 10; i++) {
                        String currentDayName = searchDate.getDayOfWeek().getDisplayName(TextStyle.SHORT,
                                        Locale.ENGLISH);

                        if (allowedDays.contains(currentDayName)) {
                                // Check week interval: (weeks between search date and start date) % interval ==
                                // 0
                                long weeksBetween = ChronoUnit.WEEKS.between(
                                                plan.getRecurrenceStart().toLocalDate().with(
                                                                TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)),
                                                searchDate.toLocalDate().with(
                                                                TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)));

                                if (weeksBetween % intervalWeeks == 0) {
                                        return searchDate;
                                }
                        }
                        searchDate = searchDate.plusDays(1);
                }
                return null;
        }
}
