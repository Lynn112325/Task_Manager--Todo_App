package com.taskmanager.taskapp.task;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.habitlog.HabitLogService;
import com.taskmanager.taskapp.habitlog.HabitLogStatsDto;
import com.taskmanager.taskapp.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.recurringplan.RecurringPlanService;
import com.taskmanager.taskapp.target.TargetDto;
import com.taskmanager.taskapp.target.TargetService;
import com.taskmanager.taskapp.task.dto.TaskDetailDto;
import com.taskmanager.taskapp.task.dto.TaskDto;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/tasks")
public class TaskController extends BaseController {

    private final TaskService taskService;
    private final TargetService targetService;
    private final RecurringPlanService recurringPlanService;
    private final HabitLogService habitLogService;

    // get all tasks for the current user
    @GetMapping
    public ResponseEntity<CommonResponse<?>> getAllTasks() {
        return ok(taskService.getTasksForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponse<?>> getTask(
            @PathVariable Long id) {
        TaskDto task = taskService.getTaskById(id);
        return ok(task);
    }

    // add a new task
    @PostMapping
    public ResponseEntity<CommonResponse<?>> createTask(@RequestBody Task task) {
        return created(taskService.createTask(task));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<CommonResponse<?>> getTaskDetail(
            @PathVariable Long id) {
        TaskDto task = taskService.getTaskById(id);

        if (task.templateId() == null) {
            return ok(new TaskDetailDto(task, null, null, null));
        }

        TargetDto target = targetService.getTargetByTemplateId(task.templateId());

        RecurringPlanDto recurringPlan = recurringPlanService.getRecurringPlanByTemplateId(task.templateId());

        HabitLogStatsDto habitLogStats = habitLogService.getHabitStatsByTemplateId(task.templateId());

        return ok(new TaskDetailDto(
                task,
                recurringPlan,
                target,
                habitLogStats));
    }

    // update an existing task
    @PatchMapping("/{id}")
    public ResponseEntity<CommonResponse<?>> updateTask(@PathVariable("id") Long taskId,
            @RequestBody TaskDto updatedTask) {
        TaskDto updated = taskService.updateTask(taskId, updatedTask);
        return ok(updated);
    }

    // delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<CommonResponse<?>> deleteTask(@PathVariable("id") Long taskId) {
        taskService.deleteTask(taskId);
        return ok();
        // 或 ok("deleted");
    }

}