package com.taskmanager.taskapp.taskschedule;

import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateDto;

public record TaskScheduleDto(
        TaskTemplateDto taskTemplate,
        RecurringPlanDto recurringPlan) {
}
