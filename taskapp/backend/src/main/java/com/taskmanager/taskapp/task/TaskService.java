package com.taskmanager.taskapp.task;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.taskmanager.taskapp.habitlog.HabitLogRepository;
import com.taskmanager.taskapp.habitlog.HabitLogStatsDto;
import com.taskmanager.taskapp.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.recurringplan.RecurringPlanRepository;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.target.TargetDto;
import com.taskmanager.taskapp.target.TargetRepository;
import com.taskmanager.taskapp.task.dto.TaskDetailDto;
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
    private final HabitLogRepository habitLogRepository;
    private final RecurringPlanRepository recurringPlanRepository;
    private final TargetRepository targetRepository;

    // transform Task to TaskDto
    private TaskDto toDto(Task task) {
        return new TaskDto(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getIsCompleted(),
                task.getPriority(),
                task.getType(),
                task.getCreatedAt(),
                task.getUpdatedAt(),
                task.getStartDate(),
                task.getDueDate(),
                task.getTaskTemplate() != null ? task.getTaskTemplate().getId() : null);
    }

    // apply partial changes from TaskDto to Task entity
    private Task applyNonNullUpdates(TaskDto updates, Task existingTask) {
        Optional.ofNullable(updates.title()).ifPresent(existingTask::setTitle);
        Optional.ofNullable(updates.description()).ifPresent(existingTask::setDescription);
        Optional.ofNullable(updates.isCompleted()).ifPresent(existingTask::setIsCompleted);
        Optional.ofNullable(updates.priority()).ifPresent(existingTask::setPriority);
        Optional.ofNullable(updates.type()).ifPresent(existingTask::setType);
        Optional.ofNullable(updates.startDate()).ifPresent(existingTask::setStartDate);
        Optional.ofNullable(updates.dueDate()).ifPresent(existingTask::setDueDate);
        return existingTask;
    }

    // get tasks for current user
    public List<TaskDto> getTasksForCurrentUser() {
        Long userId = myUserDetailsService.getCurrentUserId();

        return taskRepository.findByUser_Id(userId)
                .stream()
                .map(this::toDto) // convert Task to TaskDto
                .toList();
    }

    // get taskDetail by taskId and check owner
    public TaskDetailDto getTaskDetailById(Long taskId) {
        Long currentUserId = myUserDetailsService.getCurrentUserId();

        // 1. Task
        TaskDto taskDto = taskRepository.findTaskDtoByIdAndUserId(taskId, currentUserId)
                .orElseThrow(() -> new RuntimeException("Task not found or you don't have access"));

        // 2. RecurringPlan
        RecurringPlanDto recurringPlan = taskDto.templateId() != null
                ? recurringPlanRepository.findDtoByTemplateId(taskDto.templateId()).orElse(null)
                : null;

        // 3. Target
        TargetDto target = taskDto.templateId() != null
                ? targetRepository.findDtoByTemplateId(taskDto.templateId()).orElse(null)
                : null;

        // 4. HabitLog
        HabitLogStatsDto habitStats = (taskDto.templateId() != null)
                ? habitLogRepository.findHabitLogStatsByTemplateAndUser(taskDto.templateId(), currentUserId)
                        .orElse(new HabitLogStatsDto(0L, 0L, 0L))
                : new HabitLogStatsDto(0L, 0L, 0L);

        // 5. group DTO
        return new TaskDetailDto(taskDto, recurringPlan, target, habitStats);
    }

    // create Task
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
    public TaskDto updateTask(Long taskId, TaskDto updatedTask) {
        // find the existing task
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id " + taskId));
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(existingTask.getUser().getId());
        // update the existing task with non-null fields from updatedTask
        existingTask = applyNonNullUpdates(updatedTask, existingTask);

        // save the updated task to database and get the saved entity
        Task savedTask = taskRepository.save(existingTask);
        // turn the saved entity as DTO and return it to the client
        TaskDto dto = toDto(savedTask);
        return dto;
    }

    // delete Task
    public void deleteTask(Long taskId) {
        // find the task by id
        Task task = taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"));
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(task.getUser().getId());
        // delete the task
        taskRepository.delete(task);
    }

    // 任務摘要（完成率等）
    public Map<String, Object> getUserTaskSummary(Long userId) {
        List<Task> tasks = taskRepository.findByUser_Id(userId);
        long completed = tasks.stream().filter(task -> task.getIsCompleted()).count();
        double completionRate = tasks.isEmpty() ? 0 : (completed * 100.0 / tasks.size());
        return Map.of("total", tasks.size(), "completed", completed, "completionRate", completionRate);
    }

}
