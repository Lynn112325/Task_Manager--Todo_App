package com.taskmanager.taskapp.task;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.habitlog.HabitLogService;
import com.taskmanager.taskapp.habitlog.HabitLogStatsDto;
import com.taskmanager.taskapp.security.MyUserDetails;
import com.taskmanager.taskapp.target.TargetDto;
import com.taskmanager.taskapp.target.TargetService;
import com.taskmanager.taskapp.task.dto.TaskDetailDto;
import com.taskmanager.taskapp.task.dto.TaskDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanService;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/tasks")
public class TaskController extends BaseController {

    private final TaskService taskService;
    private final TargetService targetService;
    private final RecurringPlanService recurringPlanService;
    private final HabitLogService habitLogService;

    /**
     * General task query interface supporting status or date filtering.
     * Matches frontend calls:
     * 1. GET /api/tasks?status=active -> All Active
     * 2. GET /api/tasks?status=active&overdue=true -> Only Active & Overdue
     * 3. GET /api/tasks?date=yyyy-MM-dd -> Specific Date
     */
    @GetMapping
    public ResponseEntity<CommonResponse<?>> getTasks(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Boolean overdue) {

        if ("active".equalsIgnoreCase(status)) {
            // if want to get overdue tasks
            if (Boolean.TRUE.equals(overdue)) {
                return ok(taskService.getOverdueTasks());
            }
            // all active tasks
            return ok(taskService.getActiveTasks());
        }
        return ok(taskService.getTasksForCurrentUser());
    }

    /**
     * month query
     * Matches frontend call: GET /api/tasks/month?month=2023-10
     */
    @GetMapping("/month")
    public ResponseEntity<CommonResponse<?>> getTasksByMonth(
            @RequestParam String month) { // Format: YYYY-MM
        return ok(taskService.getTasksByMonth(month));
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
        // or ok("deleted");
    }

    @GetMapping("/stats/daily")
    public ResponseEntity<CommonResponse<?>> getDailyStats(
            @AuthenticationPrincipal MyUserDetails userDetails,
            @RequestParam LocalDate date) {
        return ok(taskService.getDailyStats(userDetails.getUser(), date));
    }

    @GetMapping("/active-check")
    public ResponseEntity<CommonResponse<?>> checkActiveTasks(@AuthenticationPrincipal MyUserDetails userDetails,
            @RequestParam List<Long> ids) {
        List<Long> stillActiveIds = taskService.findActiveIdsIn(userDetails.getUser(), ids);
        return ok(stillActiveIds);
    }

}