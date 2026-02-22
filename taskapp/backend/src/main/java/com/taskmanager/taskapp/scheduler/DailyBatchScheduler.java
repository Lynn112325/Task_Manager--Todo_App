package com.taskmanager.taskapp.scheduler;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskapp.enums.NotificationType;
import com.taskmanager.taskapp.notification.NotificationService;
import com.taskmanager.taskapp.scheduler.dto.DailyBriefingDto;
import com.taskmanager.taskapp.scheduler.dto.MissedTaskDetail;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.task.TaskRepository.DailyTaskStats;
import com.taskmanager.taskapp.task.TaskService;
import com.taskmanager.taskapp.task.dto.TaskProcessResult;
import com.taskmanager.taskapp.user.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class DailyBatchScheduler {

    private final TaskRepository taskRepository;
    private final TaskService taskService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;
    private final MyUserDetailsService myUserDetailsService;

    @Value("${app.timezone:Asia/Hong_Kong}")
    private String appTimezone;

    /**
     * Main Entry Point: Runs daily at 03:00 AM.
     * Handles cleanup of old tasks and prepares daily summaries.
     * If users are located around the world, this Scheduler needs to be modified to
     * run according to time zones. How can tasks be executed for users in different
     * time zones at 3 AM in their respective locations?
     */
    // @Scheduled(cron = "0 0 3 * * *")
    @Scheduled(cron = "0 * * * * *") // For testing: runs every minute
    @Transactional
    public void runDailyMorningRoutine() {
        log.info("Starting daily morning routine...");

        // 1. Set current time anchor
        LocalDate todayDate = LocalDate.now(ZoneId.of(appTimezone));

        // --- Phase A: Task Cleanup ---
        // Identify overdue tasks, cancel them, and group results by user
        List<Long> userIds = taskRepository.findUserIdsWithOverdueTasks(todayDate.atStartOfDay());
        log.info("Found {} users with overdue tasks to process.", userIds.size());

        for (Long userId : userIds) {
            try {
                // Process each user in a separate transaction
                log.info("Processing morning routine for user ID: {}", userId);
                processSingleUserRoutine(userId, todayDate);
            } catch (Exception e) {
                log.error("Failed to process morning routine for user ID: {}", userId, e);
            }
        }
        log.info("Daily morning routine completed.");
    }

    /**
     * Finds overdue tasks and processes them (cancel status + log creation).
     * 
     * @return A map grouping the processing results by User.
     */
    private void processSingleUserRoutine(Long userId, LocalDate todayDate) {
        LocalDateTime startOfToday = todayDate.atStartOfDay();
        User user = myUserDetailsService.loadUserById(userId);
        List<Task> overdueTasks = taskRepository.findOverdueTasksForCleanup(userId, startOfToday);
        log.info("User ID {} has {} overdue tasks to process.", userId, overdueTasks.size());
        log.debug("Overdue Task IDs for user ID {}: {}", userId,
                overdueTasks.stream().map(Task::getId).toList());
        List<TaskProcessResult> results = overdueTasks.stream()
                .map(taskService::handleTaskMissed)
                .toList();

        // 4. Notify: Send the briefing (JSON format)
        sendDailyBriefing(user, todayDate, results);
    }

    /**
     * Generates and sends a summary report to the user every morning.
     * Includes missed tasks from yesterday and an outlook for today.
     */
    private void sendDailyBriefing(User user, LocalDate todayDate, List<TaskProcessResult> missedTasks) {
        // 1. Map the missed tasks to our new DTO format
        List<MissedTaskDetail> missedTaskDetails = (missedTasks == null) ? List.of()
                : missedTasks.stream()
                        .map(result -> {
                            boolean isRecurring = result.newTask() != null;
                            Task task = isRecurring ? result.newTask() : result.oldTask();

                            return new MissedTaskDetail(
                                    task.getId(),
                                    task.getTitle(),
                                    isRecurring,
                                    isRecurring ? task.getDueDate().toLocalDate().toString() : null,
                                    "/tasks/" + task.getId());
                        })
                        .toList();

        // 2. Get the stats
        DailyTaskStats stats = taskRepository.getDailyStats(user.getId(), todayDate);

        // 3. Assemble the main Briefing DTO
        DailyBriefingDto briefing = new DailyBriefingDto(
                todayDate.toString(),
                todayDate.getDayOfWeek().name(),
                missedTaskDetails,
                stats,
                "/dashboard/today");

        try {
            // 4. Convert DTO to JSON String
            String jsonContent = objectMapper.writeValueAsString(briefing);

            // 5. Persist via Notification Service
            notificationService.create(
                    user,
                    "🌅 Your Daily Report",
                    NotificationType.DAILY_BRIEFING,
                    jsonContent,
                    "/dashboard/today");

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize daily briefing", e);
        }
    }
}

/**
 * example of the JSON payload sent to the frontend for the daily briefing
 * notification:
 * {
 * "date": "2026-02-20",
 * "dayOfWeek": "FRIDAY",
 * "missedTasks": [
 * {
 * "id": 50,
 * "title": "Go to the Gym",
 * "isRecurring": true,
 * "nextRunDate": "2026-02-21",
 * "taskLink": "/tasks/50"
 * },
 * {
 * "id": 62,
 * "title": "Fix the Sink",
 * "isRecurring": false,
 * "nextRunDate": null,
 * "taskLink": "/tasks/62"
 * }
 * ],
 * "stats": {
 * "total": 10,
 * "active": 7,
 * "completed": 2,
 * "canceled": 1
 * },
 * "actionLink": "/dashboard/today"
 * }
 */