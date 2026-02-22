package com.taskmanager.taskapp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.taskapp.notification.NotificationService;
import com.taskmanager.taskapp.scheduler.DailyBatchScheduler;
import com.taskmanager.taskapp.scheduler.dto.DailyBriefingDto;
import com.taskmanager.taskapp.scheduler.dto.MissedTaskDetail;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.task.TaskService;
import com.taskmanager.taskapp.task.dto.TaskProcessResult;
import com.taskmanager.taskapp.user.User;

/**
 * Unit test for DailyBatchScheduler.
 * Uses Mockito to mock dependencies and verify interaction patterns.
 */
@ExtendWith(MockitoExtension.class)
class DailyBatchSchedulerTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private TaskService taskService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private MyUserDetailsService myUserDetailsService;

    // A static implementation of the Interface projection to provide mock data
    private static class TestDailyTaskStats implements TaskRepository.DailyTaskStats {
        @Override
        public long getTotal() {
            return 10L;
        }

        @Override
        public long getActive() {
            return 7L;
        }

        @Override
        public long getCompleted() {
            return 2L;
        }

        @Override
        public long getCanceled() {
            return 1L;
        }
    }

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private DailyBatchScheduler scheduler;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        // Use Reflection to set the @Value field manually in unit test
        ReflectionTestUtils.setField(scheduler, "appTimezone", "UTC");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        testTask = new Task();
        testTask.setId(100L);
        testTask.setTitle("Test Task");
        testTask.setDueDate(LocalDateTime.now().minusDays(1));
    }

    /**
     * Verifies the full workflow:
     * Identify users -> process overdue tasks -> send briefing notification.
     */
    @Test
    @DisplayName("Complete Flow Test: Find overdue users -> process tasks -> send notification")
    void testRunDailyMorningRoutine_Success() throws JsonProcessingException {
        // Arrange: Mock the chain of calls for a successful run
        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class)))
                .thenReturn(List.of(1L));
        when(myUserDetailsService.loadUserById(1L)).thenReturn(testUser);
        when(taskRepository.findOverdueTasksForCleanup(eq(1L), any(LocalDateTime.class)))
                .thenReturn(List.of(testTask));

        TaskProcessResult result = new TaskProcessResult("", testTask, null);
        when(taskService.handleTaskMissed(testTask)).thenReturn(result);
        when(taskRepository.getDailyStats(eq(1L), any(LocalDate.class)))
                .thenReturn(new TestDailyTaskStats());

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert: Verify each service was interacted with correctly
        verify(taskService, times(1)).handleTaskMissed(testTask);
        verify(notificationService, times(1)).create(any(), anyString(), any(), anyString(), anyString());
        verify(objectMapper, atLeastOnce()).writeValueAsString(any(DailyBriefingDto.class));
    }

    /**
     * Checks if the scheduler terminates early if no users are found with overdue
     * tasks.
     */
    @Test
    @DisplayName("No users found: Should not execute processing logic")
    void testRunDailyMorningRoutine_NoUsers() {
        // Arrange
        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class)))
                .thenReturn(List.of());

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert: Interaction should stop at the user ID check
        verify(myUserDetailsService, never()).loadUserById(anyLong());
        verify(notificationService, never()).create(any(), anyString(), any(), anyString(), anyString());
    }

    /**
     * Verifies that an exception during one user's processing does not crash the
     * whole batch.
     */
    @Test
    @DisplayName("Single user failure: Should not affect other users (Loop continues)")
    void testRunDailyMorningRoutine_SingleUserFailure() {
        // Arrange
        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class)))
                .thenReturn(List.of(1L, 2L));

        // First user fails
        when(myUserDetailsService.loadUserById(1L)).thenThrow(new RuntimeException("DB Error"));
        // Second user succeeds
        User secondUser = new User();
        secondUser.setId(2L);
        when(myUserDetailsService.loadUserById(2L)).thenReturn(secondUser);

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert: Verification that logic attempted both users despite the first one
        // crashing
        verify(myUserDetailsService, times(1)).loadUserById(1L);
        verify(myUserDetailsService, times(1)).loadUserById(2L);
    }

    /**
     * Verifies that JSON serialization errors are handled (caught in the try-catch
     * loop).
     */
    @Test
    @DisplayName("JSON Serialization failure: Should catch exception and not send notification")
    void testSendDailyBriefing_JsonError() throws JsonProcessingException {
        // Arrange
        when(objectMapper.writeValueAsString(any())).thenThrow(new JsonProcessingException("Error") {
        });
        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class))).thenReturn(List.of(1L));
        when(myUserDetailsService.loadUserById(1L)).thenReturn(testUser);

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert: Notification should never be created if JSON fails
        verify(notificationService, never()).create(any(), anyString(), any(), anyString(), anyString());
    }

    /**
     * Tests standard (one-time) task processing where no new task is created.
     */
    @Test
    @DisplayName("One-time task: Ensure isRecurring is false and nextRunDate is null")
    void testSendDailyBriefing_NonRecurringTask() throws JsonProcessingException {
        // Arrange
        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class))).thenReturn(List.of(1L));
        when(myUserDetailsService.loadUserById(1L)).thenReturn(testUser);
        when(taskRepository.findOverdueTasksForCleanup(eq(1L), any(LocalDateTime.class))).thenReturn(List.of(testTask));

        // newTask is null -> representing a one-time task
        TaskProcessResult result = new TaskProcessResult("Missed", null, testTask);
        when(taskService.handleTaskMissed(testTask)).thenReturn(result);
        when(taskRepository.getDailyStats(eq(1L), any(LocalDate.class))).thenReturn(new TestDailyTaskStats());

        ArgumentCaptor<DailyBriefingDto> dtoCaptor = ArgumentCaptor.forClass(DailyBriefingDto.class);

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert
        verify(objectMapper).writeValueAsString(dtoCaptor.capture());
        DailyBriefingDto capturedDto = dtoCaptor.getValue();

        assertEquals(1, capturedDto.missedTasks().size());
        MissedTaskDetail detail = capturedDto.missedTasks().get(0);
        assertFalse(detail.isRecurring());
        assertNull(detail.nextRunDate());
    }

    /**
     * Tests recurring task processing where a newTask is generated for the next
     * period.
     */
    @Test
    @DisplayName("Recurring task: Ensure isRecurring is true and link points to the new Task ID")
    void testSendDailyBriefing_RecurringTask() throws JsonProcessingException {
        // Arrange
        Task newTask = new Task();
        newTask.setId(200L);
        newTask.setTitle("Test Task (Next)");
        newTask.setDueDate(LocalDateTime.now().plusDays(1));

        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class))).thenReturn(List.of(1L));
        when(myUserDetailsService.loadUserById(1L)).thenReturn(testUser);
        when(taskRepository.findOverdueTasksForCleanup(eq(1L), any(LocalDateTime.class))).thenReturn(List.of(testTask));

        // newTask is present -> representing a recurring task that auto-rescheduled
        TaskProcessResult result = new TaskProcessResult("Missed and scheduled next", newTask, testTask);
        when(taskService.handleTaskMissed(testTask)).thenReturn(result);
        when(taskRepository.getDailyStats(eq(1L), any(LocalDate.class))).thenReturn(new TestDailyTaskStats());

        ArgumentCaptor<DailyBriefingDto> dtoCaptor = ArgumentCaptor.forClass(DailyBriefingDto.class);

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert
        verify(objectMapper).writeValueAsString(dtoCaptor.capture());
        DailyBriefingDto capturedDto = dtoCaptor.getValue();

        MissedTaskDetail detail = capturedDto.missedTasks().get(0);
        assertTrue(detail.isRecurring());
        assertEquals(newTask.getDueDate().toLocalDate().toString(), detail.nextRunDate());
        assertEquals("/tasks/" + newTask.getId(), detail.taskLink());
    }

    /**
     * Verifies that if no tasks are overdue but stats are requested, the briefing
     * is sent with an empty list.
     */
    @Test
    @DisplayName("Empty overdue tasks: Should send briefing with empty array but valid stats")
    void testSendDailyBriefing_EmptyOverdueTasks() throws JsonProcessingException {
        // Arrange
        when(taskRepository.findUserIdsWithOverdueTasks(any(LocalDateTime.class))).thenReturn(List.of(1L));
        when(myUserDetailsService.loadUserById(1L)).thenReturn(testUser);
        when(taskRepository.findOverdueTasksForCleanup(eq(1L), any(LocalDateTime.class))).thenReturn(List.of());
        when(taskRepository.getDailyStats(eq(1L), any(LocalDate.class))).thenReturn(new TestDailyTaskStats());

        ArgumentCaptor<DailyBriefingDto> dtoCaptor = ArgumentCaptor.forClass(DailyBriefingDto.class);

        // Act
        scheduler.runDailyMorningRoutine();

        // Assert
        verify(taskService, never()).handleTaskMissed(any());
        verify(objectMapper).writeValueAsString(dtoCaptor.capture());

        DailyBriefingDto capturedDto = dtoCaptor.getValue();
        assertTrue(capturedDto.missedTasks().isEmpty());
        assertNotNull(capturedDto.stats());
    }
}