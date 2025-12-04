package com.taskmanager.taskapp.task.dto;

import com.taskmanager.taskapp.habitlog.HabitLogStatsDto;
import com.taskmanager.taskapp.recurringplan.RecurringPlanDto;

public record TaskDetailDto(
        TaskDto task,
        RecurringPlanDto recurringPlan,
        HabitLogStatsDto habitStats) {
}
