package com.taskmanager.taskapp.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.task.TaskService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class TaskCleanupScheduler {

    private final TaskRepository taskRepository;
    private final TaskService taskService;

    /**
     * Runs every day at 03:00 AM
     * 0 0 3 * * * means: 0 seconds, 0 minutes, 3 hours
     */
    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void processOverdueTasks() {
        // 1. Define "Yesterday" boundary
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();

        // 2. Find all ACTIVE tasks that were supposed to be done before today
        List<Task> overdueTasks = taskRepository.findOverdueTasksForCleanup(startOfToday);

        for (Task task : overdueTasks) {
            taskService.handleTaskMissed(task);
        }
    }
}