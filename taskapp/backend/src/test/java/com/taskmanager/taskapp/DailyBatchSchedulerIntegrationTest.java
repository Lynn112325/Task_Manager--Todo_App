package com.taskmanager.taskapp;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.notification.NotificationService;
import com.taskmanager.taskapp.scheduler.DailyBatchScheduler;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.user.User;
import com.taskmanager.taskapp.user.UserRepository;

// Ensure the "test" profile is used to load src/test/resources/application-test.properties
@ActiveProfiles("test")
// Automatically roll back database changes after each test to maintain a clean
// state
@Transactional
@SpringBootTest()
class DailyBatchSchedulerIntegrationTest {

    @Autowired
    private DailyBatchScheduler scheduler;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    // Use MockitoBean to prevent actual notifications (emails/push) from being sent
    @MockitoBean
    private NotificationService notificationService;

    private User testUser;

    @BeforeEach
    void setup() {
        // Initialize a test user required for foreign key constraints in tasks
        User user = new User();
        user.setUsername("scheduler_user");
        user.setPassword("password");
        user.setEmail("test@task.com");
        testUser = userRepository.save(user);
    }

    @Test
    void contextLoads() {
        // Simple sanity check to ensure the Spring ApplicationContext starts correctly
    }

    @Test
    @DisplayName("Should correctly process overdue tasks and send a daily briefing")
    void testDailyMorningRoutine() {
        // Arrange: Create a task with a due date in the past (yesterday)
        Task overdueTask = new Task();
        overdueTask.setTitle("Yesterday Task");
        overdueTask.setStatus(TaskStatus.ACTIVE);
        // Setting to yesterday ensures the scheduler's query captures it
        overdueTask.setDueDate(LocalDateTime.now().minusDays(1));
        overdueTask.setUser(testUser);
        taskRepository.save(overdueTask);

        // Act: Manually trigger the scheduled routine logic
        scheduler.runDailyMorningRoutine();

        // Assert
        // 1. Verify the overdue task status was changed (to CANCELED as per service
        // logic)
        Task updatedTask = taskRepository.findById(overdueTask.getId()).orElseThrow();
        assertThat(updatedTask.getStatus()).isEqualTo(TaskStatus.CANCELED);

        // 2. Verify that the notification service was invoked, indicating briefing
        // generation
        verify(notificationService, atLeastOnce()).create(
                any(User.class),
                anyString(),
                any(),
                anyString(),
                anyString());
    }

    @Test
    @DisplayName("Scheduler should run normally when no overdue tasks exist")
    void testRoutineWithNoOverdueTasks() {
        // Arrange: Create a task with a due date in the future
        Task futureTask = new Task();
        futureTask.setTitle("Future Task");
        futureTask.setStatus(TaskStatus.ACTIVE);
        futureTask.setDueDate(LocalDateTime.now().plusDays(1));
        futureTask.setUser(testUser);
        taskRepository.save(futureTask);

        // Act: Execute the routine
        scheduler.runDailyMorningRoutine();

        // Assert: The future task should remain ACTIVE
        Task updatedTask = taskRepository.findById(futureTask.getId()).orElseThrow();
        assertThat(updatedTask.getStatus()).isEqualTo(TaskStatus.ACTIVE);
    }
}