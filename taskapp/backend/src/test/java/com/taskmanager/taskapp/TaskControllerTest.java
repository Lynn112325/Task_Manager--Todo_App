package com.taskmanager.taskapp;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.task.TaskController;
import com.taskmanager.taskapp.task.TaskService;
import com.taskmanager.taskapp.task.dto.TaskDto;

class TaskControllerTest {

    private MockMvc mockMvc;

    @Mock
    private TaskService taskService;

    @InjectMocks
    private TaskController taskController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(taskController).build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Scenario 1: Get all tasks for current user (no filters)")
    void testGetTasks_Default() throws Exception {
        // Arrange: Mock the general service call
        TaskDto dto = new TaskDto(1L, "All Task", "Desc", TaskStatus.ACTIVE, 1, null, null, null, null, null, null,
                null);
        when(taskService.getTasksForCurrentUser()).thenReturn(List.of(dto));

        // Act & Assert: Call API without params
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("All Task"));

        // Verify the correct service method was called
        verify(taskService).getTasksForCurrentUser();
    }

    @Test
    @DisplayName("Scenario 2: Get only active tasks")
    void testGetTasks_ActiveOnly() throws Exception {
        // Arrange: Mock the active tasks service call
        TaskDto dto = new TaskDto(2L, "Active Task", "Desc", TaskStatus.ACTIVE, 1, null, null, null, null, null, null,
                null);
        when(taskService.getActiveTasks()).thenReturn(List.of(dto));

        // Act & Assert: Call API with status=active
        mockMvc.perform(get("/api/tasks")
                .param("status", "active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Active Task"));

        verify(taskService).getActiveTasks();
    }

    @Test
    @DisplayName("Scenario 3: Get active tasks that are overdue")
    void testGetTasks_OverdueActive() throws Exception {
        // Arrange: Mock the overdue tasks service call
        TaskDto dto = new TaskDto(3L, "Overdue Task", "Desc", TaskStatus.ACTIVE, 1, null, null, null, null, null, null,
                null);
        when(taskService.getOverdueTasks()).thenReturn(List.of(dto));

        // Act & Assert: Call API with status=active AND overdue=true
        mockMvc.perform(get("/api/tasks")
                .param("status", "active")
                .param("overdue", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Overdue Task"));

        verify(taskService).getOverdueTasks();
    }
}
