package com.taskmanager.taskapp.task.dto;

import com.taskmanager.taskapp.habitlog.HabitLogStatsDto;
import com.taskmanager.taskapp.target.TargetDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanDto;

public record TaskDetailDto(
        TaskDto task,
        RecurringPlanDto recurringPlan,
        TargetDto target,
        HabitLogStatsDto habitStats) {
}
