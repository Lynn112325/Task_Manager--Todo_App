package com.taskmanager.taskapp.taskschedule;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.target.Target;
import com.taskmanager.taskapp.target.TargetRepository;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskService;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlan;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanRepository;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanService;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateDto;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateRepository;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplateService;
import com.taskmanager.taskapp.user.User;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

/**
 * Service class responsible for managing Task Schedules.
 * It handles the orchestration between TaskTemplates and RecurringPlans,
 * including CRUD operations and status transitions.
 */
@Service
@RequiredArgsConstructor
public class TaskScheduleService {

    private final RecurringPlanService recurringPlanService;
    private final TaskTemplateService taskTemplateService;
    private final TaskScheduleRepository taskScheduleRepository;
    private final TaskTemplateRepository taskTemplateRepository;
    private final RecurringPlanRepository recurringPlanRepository;
    private final TargetRepository targetRepository;
    private final TaskService taskService;

    private static final DateTimeFormatter NEXT_RUN_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd(EEE)",
            Locale.ENGLISH);

    /**
     * Converts a TaskTemplate entity and its associated RecurringPlan into a
     * combined DTO.
     * 
     * @param tt The TaskTemplate entity to convert.
     * @return A combined TaskScheduleDto containing both template and plan details.
     */
    public TaskScheduleDto toCombinedDto(TaskTemplate tt) {
        TaskTemplateDto ttDto = taskTemplateService.toDto(tt);

        RecurringPlanDto rpDto = (tt.getRecurringPlan() != null)
                ? recurringPlanService.toDto(tt.getRecurringPlan())
                : null;

        return new TaskScheduleDto(ttDto, rpDto, null);
    }

    private String getSuccessMessage(String header, Task newTask) {
        if (newTask != null) {
            String dateStr = newTask.getDueDate().format(NEXT_RUN_FORMATTER).toUpperCase();
            return String.format("%s Next session scheduled for %s.", header, dateStr);
        }
        return header + " successfully.";
    }

    /**
     * Updates the status of an existing recurring plan.
     * If the status changes from non-ACTIVE to ACTIVE, it triggers immediate task
     * generation.
     * 
     * @param user      The authenticated user performing the update.
     * @param id        The ID of the RecurringPlan.
     * @param newStatus The string representation of the new PlanStatus.
     * @return A map containing the updated ID, status, and a system message.
     * @throws AccessDeniedException   if the plan does not belong to the user.
     * @throws EntityNotFoundException if the plan is not found.
     */
    @Transactional
    public Map<String, Object> updateStatus(User user, Long id, String newStatus) {
        RecurringPlan plan = recurringPlanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + id));

        // Ownership validation
        if (!plan.getTaskTemplate().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to update this schedule");
        }

        RecurrenceType oldType = plan.getRecurrenceType();
        PlanStatus oldStatus = plan.getStatus();
        PlanStatus targetStatus = PlanStatus.valueOf(newStatus);

        plan.setStatus(targetStatus);
        recurringPlanRepository.save(plan);

        // Logic: Trigger task generation only when activating a previously inactive
        // plan
        String feedback = "Status updated.";
        if (oldStatus != PlanStatus.ACTIVE && targetStatus == PlanStatus.ACTIVE) {
            Task updatedTask = null;
            if (plan.shouldGenerateTask(oldStatus, oldType, false)) {
                updatedTask = taskService.generateNextRecurringTask(plan);
            }
            feedback = getPlanUpdateMessage(plan, false, updatedTask);
        }

        return Map.of(
                "id", plan.getId(),
                "status", newStatus,
                "systemMessage", feedback);
    }

    /**
     * Saves or updates a Task Schedule (Template + Recurring Plan).
     * 
     * @param user       The user who owns the schedule.
     * @param dto        The data transfer object containing schedule details.
     * @param existingId The ID of the plan if updating; null if creating a new one.
     * @return A success message and the saved plan ID.
     * @throws EntityNotFoundException if target or existing plan is not found.
     */
    @Transactional
    public Map<String, Object> save(User user, TaskScheduleDto dto, Long existingId) {
        RecurringPlan plan;
        TaskTemplate template;
        PlanStatus oldStatus;
        RecurrenceType oldType;
        Boolean skipInitialGeneration = dto.skipInitialGeneration();

        if (existingId != null) {
            plan = recurringPlanRepository.findById(existingId)
                    .orElseThrow(() -> new EntityNotFoundException("Schedule not found with id: " + existingId));
            template = plan.getTaskTemplate();
            oldStatus = plan.getStatus();
            oldType = plan.getRecurrenceType();
        } else {
            plan = new RecurringPlan();
            template = new TaskTemplate();
            template.setUser(user);
            oldStatus = null;
            oldType = null;
        }

        // Map template fields
        template.setTitle(dto.taskTemplate().title());
        template.setDescription(dto.taskTemplate().description());
        template.setPriority(dto.taskTemplate().priority());

        // Target validation
        Long targetId = dto.taskTemplate().targetId();
        if (targetId == null) {
            throw new IllegalArgumentException("Target ID cannot be null");
        }
        Target target = targetRepository.findById(targetId)
                .orElseThrow(() -> new EntityNotFoundException("Target not found with id: " + targetId));
        template.setTarget(target);

        // Map plan fields
        var planDto = dto.recurringPlan();
        plan.setRecurrenceType(planDto.recurrenceType());
        plan.setRecurrenceInterval(planDto.recurrenceInterval());
        plan.setRecurrenceDays(planDto.recurrenceDays());
        plan.setRecurrenceStart(planDto.recurrenceStart());
        plan.setRecurrenceEnd(planDto.recurrenceEnd());
        plan.setIsHabit(planDto.isHabit());

        plan.setTaskTemplate(template);
        template.setRecurringPlan(plan);
        if (existingId == null) {
            taskTemplateRepository.saveAndFlush(template);
            plan.setId(template.getId());
        }
        RecurringPlan savedPlan = recurringPlanRepository.save(plan);

        if (planDto.status() != null) {
            plan.setStatus(planDto.status());
        }
        Task newTask = null;
        if (plan.shouldGenerateTask(oldStatus, oldType, skipInitialGeneration)) {
            newTask = taskService.generateNextRecurringTask(plan);
        }
        String feedback = getPlanUpdateMessage(plan, existingId == null, newTask);

        return Map.of("id", savedPlan.getId(), "systemMessage", feedback);
    }

    private String getPlanUpdateMessage(RecurringPlan plan, boolean isNew, Task generatedTask) {
        String header = isNew ? "Schedule created." : "Schedule updated.";

        if (generatedTask != null) {
            return getSuccessMessage(header, generatedTask);
        }

        if (plan.getRecurrenceType() == RecurrenceType.NONE) {
            return header;
        }

        if (plan.getStatus() == PlanStatus.PAUSED) {
            return header + (isNew ? " Recurrence is currently disabled." : " Recurrence paused.");
        }

        return header;
    }

    /**
     * Retrieves all task schedules for a specific user and target.
     * * @param userId The ID of the user.
     * 
     * @param targetId The ID of the target category/project.
     * @return A list of TaskScheduleDto.
     */
    @Transactional(readOnly = true)
    public List<TaskScheduleDto> getTaskSchedules(Long userId, Long targetId) {

        List<TaskTemplate> templates = taskScheduleRepository.findAllWithPlanByUserIdAndTargetId(userId, targetId);

        return templates.stream()
                .map(this::toCombinedDto)
                .collect(Collectors.toList());
    }
}