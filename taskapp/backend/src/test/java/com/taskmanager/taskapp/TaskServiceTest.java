package com.taskmanager.taskapp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.habitlog.HabitLogRepository;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.task.TaskService;
import com.taskmanager.taskapp.task.dto.TaskDto;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlan;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanRepository;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlanService;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.user.User;
import com.taskmanager.taskapp.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MyUserDetailsService myUserDetailsService;
    @Mock
    private RecurringPlanService recurringPlanService;
    @Mock
    private RecurringPlanRepository recurringPlanRepository;
    @Mock
    private HabitLogRepository habitLogRepository;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Task testTask;
    private TaskTemplate testTemplate;
    private RecurringPlan testPlan;
    private final Long USER_ID = 1L;

    @BeforeEach
    void setUp() {
        // Initialize test user
        testUser = new User();
        testUser.setId(USER_ID);

        // Initialize test template
        testTemplate = new TaskTemplate();
        testTemplate.setId(10L);
        testTemplate.setTitle("Daily Workout");
        testTemplate.setUser(testUser);

        // Initialize recurring plan
        testPlan = new RecurringPlan();
        testPlan.setId(100L);
        testPlan.setTaskTemplate(testTemplate);
        testPlan.setIsHabit(true);
        testPlan.setStatus(PlanStatus.ACTIVE);
        testPlan.setNextRunAt(LocalDateTime.now().plusDays(1));

        // Initialize task
        testTask = new Task();
        testTask.setId(50L);
        testTask.setUser(testUser);
        testTask.setTitle("Go to the Gym");
        testTask.setStatus(TaskStatus.ACTIVE);
        testTask.setDueDate(LocalDateTime.now());
        testTask.setTaskTemplate(testTemplate);
    }

    // --- Query Logic Tests ---

    @Test
    @DisplayName("Get Overdue Tasks: Should return a list of TaskDtos")
    void getOverdueTasks_ShouldReturnDtoList() {
        when(myUserDetailsService.getCurrentUserId()).thenReturn(USER_ID);
        TaskDto overdueDto = new TaskDto(50L, "Overdue Task", null, null, null, null,
                null, null, null, null, null,
                null);
        when(taskRepository.findOverdueTasks(eq(USER_ID), any(LocalDateTime.class)))
                .thenReturn(List.of(overdueDto));

        List<TaskDto> result = taskService.getOverdueTasks();

        assertFalse(result.isEmpty(), "Result list should not be empty");
        assertEquals("Overdue Task", result.get(0).title());
    }

    @Test
    @DisplayName("Get Tasks by Month: Should parse date range correctly for repository query")
    void getTasksByMonth_ShouldQueryCorrectRange() {
        when(myUserDetailsService.getCurrentUserId()).thenReturn(USER_ID);
        String monthStr = "2026-02";

        taskService.getTasksByMonth(monthStr);

        // Verify start of month is 2026-02-01 00:00:00
        LocalDateTime expectedStart = LocalDate.of(2026, 2, 1).atStartOfDay();
        verify(taskRepository).findByDateRange(eq(USER_ID), eq(expectedStart),
                any(LocalDateTime.class));
    }

    // --- Create & Update Logic Tests ---

    @Test
    @DisplayName("Create Task: Should automatically associate the current user")
    void createTask_ShouldSetCurrentUser() {
        when(myUserDetailsService.getCurrentUserId()).thenReturn(USER_ID);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(testUser));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        Task newTask = new Task();
        newTask.setTitle("New Task");

        TaskDto result = taskService.createTask(newTask);

        assertNotNull(result);
        verify(userRepository).findById(USER_ID);
        assertEquals(testUser, newTask.getUser(), "Task user should match the current user");
    }

    @Test
    @DisplayName("Update Task: Transitioning to COMPLETED should triggerrecurring logicand habit logs")

    void updateTask_StatusToCompleted_ShouldTriggerRecurring() {
        // Arrange
        TaskDto updates = new TaskDto(50L, null, null, TaskStatus.COMPLETED, null,
                null, null, null, null, null, null,
                null);
        when(taskRepository.findById(50L)).thenReturn(Optional.of(testTask));
        when(recurringPlanRepository.findByTemplateId(10L)).thenReturn(Optional.of(testPlan));
        when(recurringPlanService.calculateNextDueDate(any(),
                any())).thenReturn(LocalDateTime.now().plusDays(1));
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        TaskDto result = taskService.updateTask(50L, updates);

        // Assert
        assertEquals(TaskStatus.COMPLETED, result.status());
        verify(habitLogRepository).save(any()); // Verify habit log was created
        verify(recurringPlanRepository).save(testPlan); // Verify recurring plan schedule was updated
        assertTrue(result.systemMessage().contains("Next session scheduled"));
    }

    @Test
    @DisplayName("Update Task: Undo Completion should delete future tasks androll back plan schedule")

    void updateTask_UndoCompletion_ShouldCleanupFutureTask() {
        // Arrange: Simulate reverting a COMPLETED task back to ACTIVE
        testTask.setStatus(TaskStatus.COMPLETED);
        TaskDto updates = new TaskDto(50L, null, null, TaskStatus.ACTIVE, null, null,
                null, null, null, null, null,
                null);

        LocalDateTime futureRun = testPlan.getNextRunAt();
        Task futureTask = new Task();
        futureTask.setId(51L);

        when(taskRepository.findById(50L)).thenReturn(Optional.of(testTask));
        when(recurringPlanRepository.findByTemplateId(10L)).thenReturn(Optional.of(testPlan));

        // Mock finding the future task generated during the previous completion
        when(taskRepository.findFirstByTaskTemplateAndStatusAndDueDateOrderByCreatedAtDesc(
                eq(testTemplate), eq(TaskStatus.ACTIVE), eq(futureRun)))
                .thenReturn(Optional.of(futureTask));

        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        TaskDto result = taskService.updateTask(50L, updates);

        // Assert
        verify(habitLogRepository).deleteByTaskId(50L); // Verify habit log was removed
        verify(taskRepository).delete(futureTask); // Verify future task was deleted
        assertEquals(testTask.getDueDate(), testPlan.getNextRunAt(),
                "Plan schedule should roll back to current task due date");
        assertTrue(result.systemMessage().contains("Completion undone"));
    }

    @Test
    @DisplayName("Update Task: Unauthorized user should trigger access denial")
    void updateTask_NotOwner_ShouldThrowException() {
        // Arrange: Task belongs to a different user
        testTask.getUser().setId(999L);
        TaskDto updates = new TaskDto(50L, "Unauthorized Update", null, null, null,
                null, null, null, null, null, null,
                null);

        when(taskRepository.findById(50L)).thenReturn(Optional.of(testTask));

        // Mock ownership check failure
        doThrow(new RuntimeException("Access Denied"))
                .when(myUserDetailsService).checkOwnership(999L);

        // Assert
        Throwable exception = assertThrows(RuntimeException.class, () -> taskService.updateTask(50L, updates));
        assertEquals("Access Denied", exception.getMessage());
    }

    @Test
    @DisplayName("Recurring Logic: Should generate next task based on templateand update plan")

    void generateNextRecurringTask_ShouldCreateCorrectTask() {
        // Arrange
        LocalDateTime lastDue = LocalDateTime.now();
        LocalDateTime nextDue = lastDue.plusDays(7);
        when(recurringPlanService.calculateNextDueDate(testPlan,
                lastDue)).thenReturn(nextDue);

        // Act
        Task result = taskService.generateNextRecurringTask(testPlan, lastDue);

        // Assert
        assertNotNull(result);
        assertEquals(testTemplate.getTitle(), result.getTitle());
        assertEquals(nextDue, result.getDueDate());
        assertEquals(testTemplate, result.getTaskTemplate());

        verify(taskRepository).save(result);
        verify(recurringPlanRepository).save(testPlan);
        assertEquals(nextDue, testPlan.getNextRunAt(), "Plan's next run date should be updated");
    }
}