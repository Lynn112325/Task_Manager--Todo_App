package com.taskmanager.taskapp.task;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.task.dto.TaskDetailDto;
import com.taskmanager.taskapp.task.dto.TaskDto;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // get all tasks for the current user
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getTasksForCurrentUser());
    }

    // get a specific task by taskId
    @GetMapping("/{id}")
    public ResponseEntity<TaskDetailDto> getTask(@PathVariable("id") Long taskId) {
        TaskDetailDto task = taskService.getTaskDetailById(taskId);
        return ResponseEntity.ok(task);
    }

    // add a new task
    @PostMapping
    public ResponseEntity<TaskDto> createTask(@RequestBody Task task) {
        TaskDto created = taskService.createTask(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // update an existing task
    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable("id") Long taskId, @RequestBody TaskDto updatedTask) {
        TaskDto updated = taskService.updateTask(taskId, updatedTask);
        return ResponseEntity.ok(updated);
    }

    // delete a task
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable("id") Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}