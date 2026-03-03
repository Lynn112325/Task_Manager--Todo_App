package com.taskmanager.taskapp.taskschedule;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.target.Target;
import com.taskmanager.taskapp.target.TargetRepository;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlan;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanRepository;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanService;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateDto;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateService;
import com.taskmanager.taskapp.user.User;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskScheduleService {

    private final RecurringPlanService recurringPlanService;
    private final TaskTemplateService taskTemplateService;
    private final TaskScheduleRepository taskScheduleRepository;
    private final RecurringPlanRepository recurringPlanRepository;
    private final TargetRepository targetRepository;

    public TaskScheduleDto toCombinedDto(TaskTemplate tt) {
        TaskTemplateDto ttDto = taskTemplateService.toDto(tt);

        RecurringPlanDto rpDto = (tt.getRecurringPlan() != null)
                ? recurringPlanService.toDto(tt.getRecurringPlan())
                : null;

        return new TaskScheduleDto(ttDto, rpDto);
    }

    @Transactional
    public Map<String, Object> save(User user, TaskScheduleDto dto, Long existingId) {
        RecurringPlan plan;
        TaskTemplate template;

        if (existingId != null) {
            plan = recurringPlanRepository.findById(existingId)
                    .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + existingId));
            template = plan.getTaskTemplate();
        } else {
            plan = new RecurringPlan();
            template = new TaskTemplate();
            template.setUser(user);
        }

        template.setTitle(dto.taskTemplate().title());
        template.setDescription(dto.taskTemplate().description());
        template.setPriority(dto.taskTemplate().priority());

        Long targetId = dto.taskTemplate().targetId();
        if (targetId == null) {
            throw new IllegalArgumentException("Target ID cannot be null");
        }
        Target target = targetRepository.findById(targetId)
                .orElseThrow(() -> new EntityNotFoundException("Target not found with id: " + targetId));
        template.setTarget(target);

        var planDto = dto.recurringPlan();
        plan.setRecurrenceType(planDto.recurrenceType());
        plan.setRecurrenceInterval(planDto.recurrenceInterval());
        plan.setRecurrenceDays(planDto.recurrenceDays());
        plan.setRecurrenceStart(planDto.recurrenceStart());
        plan.setRecurrenceEnd(planDto.recurrenceEnd());
        plan.setIsHabit(planDto.isHabit());

        if (planDto.displayStatus() != null) {
            plan.setStatus(PlanStatus.valueOf(planDto.displayStatus().toUpperCase()));
        }

        if (plan.getTaskTemplate() == null) {
            plan.setTaskTemplate(template);
        }

        RecurringPlan savedPlan = recurringPlanRepository.save(plan);

        return Map.of(
                "id", savedPlan.getId(),
                "systemMessage", "Schedule saved successfully");
    }

    @Transactional(readOnly = true)
    public List<TaskScheduleDto> getTaskSchedules(Long userId, Long targetId) {

        List<TaskTemplate> templates = taskScheduleRepository.findAllWithPlanByUserIdAndTargetId(userId, targetId);

        return templates.stream()
                .map(this::toCombinedDto)
                .collect(Collectors.toList());
    }

}
