package com.taskmanager.taskapp.task.dto;

import com.taskmanager.taskapp.habitlog.HabitLogStatsDto;
import com.taskmanager.taskapp.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.target.TargetDto;

public record TaskDetailDto(
                TaskDto task,
                RecurringPlanDto recurringPlan,
                TargetDto target,
                HabitLogStatsDto habitStats) {
}
