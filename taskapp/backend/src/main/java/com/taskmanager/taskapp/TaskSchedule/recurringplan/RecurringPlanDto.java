package com.taskmanager.taskapp.TaskSchedule.recurringplan;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.Weekday;
import com.taskmanager.taskapp.enums.PlanStatus;

public record RecurringPlanDto(
                Long id,
                RecurrenceType recurrenceType,
                int recurrenceInterval,
                List<Weekday> recurrenceDays,
                LocalDateTime recurrenceStart,
                LocalDateTime recurrenceEnd,
                String displayStatus,
                Boolean isHabit,
                LocalDateTime nextRunAt,
                LocalDateTime lastGeneratedAt,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {

        public static String computeDisplayStatus(PlanStatus status, LocalDateTime start, LocalDateTime end) {
                if (status == PlanStatus.PAUSED)
                        return "PAUSED";
                LocalDate today = LocalDate.now();
                if (start != null) {
                        LocalDate startDate = start.toLocalDate();
                        if (startDate.isAfter(today)) {
                                return "UPCOMING";
                        }
                }
                if (end != null) {
                        LocalDate endDate = end.toLocalDate();
                        if (endDate.isBefore(today)) {
                                return "COMPLETED";
                        }
                }
                return "ONGOING";
        }
}