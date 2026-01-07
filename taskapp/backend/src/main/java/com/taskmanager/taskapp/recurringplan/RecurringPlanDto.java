package com.taskmanager.taskapp.recurringplan;

import java.time.LocalDateTime;
import java.util.List;

import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.Weekday;

public record RecurringPlanDto(
                Long id,
                RecurrenceType recurrenceType,
                int recurrenceInterval,
                List<Weekday> recurrenceDays,
                LocalDateTime recurrenceStart,
                LocalDateTime recurrenceEnd,
                Boolean isActive,
                Boolean isHabit,
                LocalDateTime nextRunAt,
                LocalDateTime lastGeneratedAt,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}