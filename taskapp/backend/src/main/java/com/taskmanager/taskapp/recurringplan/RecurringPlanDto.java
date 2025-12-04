package com.taskmanager.taskapp.recurringplan;

import java.time.LocalDateTime;

import com.taskmanager.taskapp.enums.RecurrenceType;

public record RecurringPlanDto(
                Long id,
                RecurrenceType recurrenceType,
                int recurrenceInterval,
                String recurrenceDays,
                LocalDateTime recurrenceStart,
                LocalDateTime recurrenceEnd,
                Boolean isActive,
                LocalDateTime nextRunAt,
                LocalDateTime lastGeneratedAt,
                LocalDateTime createdAt,
                LocalDateTime updatedAt) {
}