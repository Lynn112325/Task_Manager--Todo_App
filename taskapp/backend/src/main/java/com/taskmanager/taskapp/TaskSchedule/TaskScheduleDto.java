package com.taskmanager.taskapp.TaskSchedule;

import com.taskmanager.taskapp.TaskSchedule.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.TaskSchedule.tasktemplate.TaskTemplateDto;

public record TaskScheduleDto(
                TaskTemplateDto taskTemplate,
                RecurringPlanDto recurringPlan) {
}
