package com.taskmanager.taskapp.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.TaskSchedule.recurringplan.RecurringPlan;
import com.taskmanager.taskapp.TaskSchedule.recurringplan.RecurringPlanRepository;
import com.taskmanager.taskapp.TaskSchedule.recurringplan.RecurringPlanService;
import com.taskmanager.taskapp.TaskSchedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.enums.HabitLogStatus;
import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.habitlog.HabitLog;
import com.taskmanager.taskapp.habitlog.HabitLogRepository;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.task.dto.TaskDto;
import com.taskmanager.taskapp.user.User;
import com.taskmanager.taskapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final MyUserDetailsService myUserDetailsService;
    private final RecurringPlanService recurringPlanservice;
    private final RecurringPlanRepository recurringPlanRepository;
    private final HabitLogRepository habitLogRepository;

    // transform Task to TaskDto
    private TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getType(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getStartDate(),
                task.getDueDate(),
                task.getTaskTemplate() != null ? task.getTaskTemplate().getId() : null,
                null);
    }

    // apply partial changes from TaskDto to Task entity
    private Task applyNonNullUpdates(TaskDto updates, Task existingTask) {
        Optional.ofNullable(updates.title()).ifPresent(existingTask::setTitle);
        Optional.ofNullable(updates.description()).ifPresent(existingTask::setDescription);
        Optional.ofNullable(updates.status()).ifPresent(existingTask::setStatus);
        Optional.ofNullable(updates.priority()).ifPresent(existingTask::setPriority);
        Optional.ofNullable(updates.type()).ifPresent(existingTask::setType);
        Optional.ofNullable(updates.startDate()).ifPresent(existingTask::setStartDate);
        Optional.ofNullable(updates.dueDate()).ifPresent(existingTask::setDueDate);
        return existingTask;
    }

    // Get active tasks where due date is before today
    @Transactional(readOnly = true)
    public List<TaskDto> getOverdueTasks() {
        Long userId = myUserDetailsService.getCurrentUserId();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        return taskRepository.findOverdueTasks(userId, startOfToday);
    }

    // Get all current active tasks (Upcoming)
    public List<TaskDto> getActiveTasks() {
        Long userId = myUserDetailsService.getCurrentUserId();
        return taskRepository.findActiveTasks(userId);
    }

    // Get all tasks for a specific month (e.g., "2023-10")
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksByMonth(String monthStr) {
        Long userId = myUserDetailsService.getCurrentUserId();

        // Parse "YYYY-MM" to get the first and last day of that month
        YearMonth yearMonth = YearMonth.parse(monthStr);
        LocalDateTime start = yearMonth.atDay(1).atStartOfDay(); // 2026-02-01 00:00:00
        LocalDateTime end = yearMonth.atEndOfMonth().atTime(LocalTime.MAX); // 2026-02-28 23:59:59

        return taskRepository.findByDateRange(userId, start, end);
    }

    // get tasks for current user
    @Transactional(readOnly = true)
    public List<TaskDto> getTasksForCurrentUser() {
        Long userId = myUserDetailsService.getCurrentUserId();

        return taskRepository.findByUser_Id(userId)
                .stream()
                .map(this::toDto) // convert Task to TaskDto
                .toList();
    }

    // get task by taskId and check owner
    @Transactional(readOnly = true)
    public TaskDto getTaskById(Long taskId) {
        Long currentUserId = myUserDetailsService.getCurrentUserId();

        TaskDto taskDto = taskRepository.findTaskDtoById(taskId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Task not found or you don't have access"));

        return taskDto;
    }

    // create Task
    @Transactional
    public TaskDto createTask(Task task) {
        // set the owner of the task to the current user
        User user = userRepository.findById(myUserDetailsService.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        task.setUser(user);

        // save the updated task to database and get the saved entity
        Task savedTask = taskRepository.save(task);
        // turn the saved entity as DTO and return it to the client
        TaskDto dto = toDto(savedTask);
        return dto;
    }

    // update Task
    @Transactional
    public TaskDto updateTask(Long taskId, TaskDto updatedTask) {
        // find the existing task
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + taskId));
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(existingTask.getUser().getId());

        // if status turn into "completed"
        TaskStatus oldStatus = existingTask.getStatus();

        // update the existing task with non-null fields from updatedTask
        existingTask = applyNonNullUpdates(updatedTask, existingTask);
        TaskStatus newStatus = existingTask.getStatus();

        String message = "Task updated successfully.";

        // Case A: Marked as COMPLETED
        if (oldStatus != TaskStatus.COMPLETED && newStatus == TaskStatus.COMPLETED) {
            message = handleTaskCompletion(existingTask);
        }
        // Case B: Unchecked (COMPLETED -> ACTIVE/ONGOING)
        else if (oldStatus == TaskStatus.COMPLETED && newStatus != TaskStatus.COMPLETED) {
            message = handleTaskUndoCompletion(existingTask);
        }

        // save the updated task to database and get the saved entity
        Task savedTask = taskRepository.save(existingTask);
        // turn the saved entity as DTO and return it to the client
        return toDto(savedTask).withSystemMessage(message);
    }

    @Transactional
    public String handleTaskCompletion(Task task) {
        // Logic for task rewards or points can be added here.

        // Process recurring logic with 'DONE' status for today.
        return processRecurringLogic(task, HabitLogStatus.DONE, LocalDate.now());
    }

    // Delete Habit Log (if have)
    // Delete Future Task (if have)
    // Roll back Plan (if have)
    @Transactional
    public String handleTaskUndoCompletion(Task task) {
        if (task.getTaskTemplate() == null)
            return null;

        return recurringPlanRepository.findByTemplateId(task.getTaskTemplate().getId())
                .map(plan -> {
                    // 1. Delete the Habit Log
                    habitLogRepository.deleteByTaskId(task.getId());

                    // 2. Find and delete the "Future Task"
                    // We search for the task that was generate for the next cycle.
                    // Its dueDate should match what the Plan currently thinks is the "Next Run".
                    boolean futureTaskDeleted = false;
                    var futureTaskOpt = taskRepository.findFirstByTaskTemplateAndStatusAndDueDateOrderByCreatedAtDesc(
                            task.getTaskTemplate(), TaskStatus.ACTIVE, plan.getNextRunAt());

                    if (futureTaskOpt.isPresent()) {
                        taskRepository.delete(futureTaskOpt.get());
                        futureTaskDeleted = true;
                    }

                    // 3. Roll back the Plan's schedule
                    // The plan should now point back to the current task's due date
                    plan.setNextRunAt(task.getDueDate());
                    plan.setLastGeneratedAt(task.getCreatedAt());
                    recurringPlanRepository.save(plan);

                    // 4. Return Message
                    if (futureTaskDeleted) {
                        return "Completion undone. The next scheduled task has been removed.";
                    } else {
                        return "Completion undone.";
                    }
                })
                .orElse(null);
    }

    @Transactional
    public void handleTaskMissed(Task task) {
        // 1. Change the status of the old task to CANCELED.
        task.setStatus(TaskStatus.CANCELED);
        task.setUpdatedAt(LocalDateTime.now());
        taskRepository.save(task);

        // 2. Process recurring logic with 'MISSED' status for yesterday.
        processRecurringLogic(task, HabitLogStatus.MISSED, LocalDate.now().minusDays(1));
    }

    /**
     * Shared logic to handle habit history and create the next scheduled task.
     */
    private String processRecurringLogic(Task task, HabitLogStatus status, LocalDate logDate) {
        // Stop if the task is not part of a recurring plan template.
        if (task.getTaskTemplate() == null)
            return null;

        return recurringPlanRepository.findByTemplateId(task.getTaskTemplate().getId())
                .map(plan -> {
                    // 1. If this plan is a habit, save a log record.
                    if (plan.getIsHabit()) {
                        saveHabitLog(task, status, logDate);
                    }

                    // 2. Generate Next Task & Get Date
                    LocalDateTime nextRun = generateNextRecurringTask(plan);

                    // 3. Build User Message
                    if (nextRun != null) {
                        // Create formatter for "yyyy-MM-dd(EEE)" e.g. 2026-02-09(MON)
                        // Use Locale.ENGLISH to ensure it says (MON) instead of local language
                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd(EEE)", Locale.ENGLISH);
                        String dateStr = nextRun.format(formatter).toUpperCase();
                        return "Great job! Next session scheduled for " + dateStr;
                    }
                    return "Great job! Task completed.";
                })
                .orElse(null);
    }

    /**
     * Utility method to save a habit log record.
     */
    private void saveHabitLog(Task task, HabitLogStatus status, LocalDate date) {
        HabitLog log = new HabitLog();
        log.setUser(task.getUser());
        log.setTask(task);
        log.setTaskTemplate(task.getTaskTemplate());
        log.setLogDate(date);
        log.setStatus(status);
        log.setCreatedAt(LocalDateTime.now());
        habitLogRepository.save(log);
    }

    @Transactional()
    public LocalDateTime generateNextRecurringTask(RecurringPlan plan) {
        TaskTemplate template = plan.getTaskTemplate();
        if (template == null || plan.getStatus() != PlanStatus.ACTIVE) {
            return null;
        }

        LocalDateTime nextDueDate = recurringPlanservice.calculateNextDueDate(plan, LocalDateTime.now());

        // create new Task
        Task newTask = new Task();
        newTask.setTitle(template.getTitle());
        newTask.setDescription(template.getDescription());
        newTask.setPriority(template.getPriority());
        newTask.setUser(template.getUser());
        newTask.setTaskTemplate(template);

        // set
        newTask.setStatus(TaskStatus.ACTIVE);
        newTask.setDueDate(nextDueDate);

        if (template.getTarget() != null) {
            newTask.setType(template.getTarget().getType());
        }

        newTask.setCreatedAt(LocalDateTime.now());
        newTask.setUpdatedAt(LocalDateTime.now());

        taskRepository.save(newTask);

        // update recurring plan
        plan.setLastGeneratedAt(LocalDateTime.now());
        plan.setNextRunAt(nextDueDate);
        recurringPlanRepository.save(plan);

        return nextDueDate;
    }

    // delete Task
    // not on use
    @Transactional()
    public void deleteTask(Long taskId) {
        // find the task by id
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(task.getUser().getId());
        // delete the task
        taskRepository.delete(task);
    }

}
