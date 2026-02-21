package com.taskmanager.taskapp.taskschedule;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanService;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateDto;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskScheduleService {

    private final RecurringPlanService recurringPlanService;
    private final TaskTemplateService taskTemplateService;
    private final TaskScheduleRepository taskScheduleRepository;

    public TaskScheduleDto toCombinedDto(TaskTemplate tt) {
        TaskTemplateDto ttDto = taskTemplateService.toDto(tt);

        RecurringPlanDto rpDto = (tt.getRecurringPlan() != null)
                ? recurringPlanService.toDto(tt.getRecurringPlan())
                : null;

        return new TaskScheduleDto(ttDto, rpDto);
    }

    @Transactional(readOnly = true)
    public List<TaskScheduleDto> getTaskSchedules(Long userId, Long targetId) {

        List<TaskTemplate> templates = taskScheduleRepository.findAllWithPlanByUserIdAndTargetId(userId, targetId);

        return templates.stream()
                .map(this::toCombinedDto)
                .collect(Collectors.toList());
    }

}
