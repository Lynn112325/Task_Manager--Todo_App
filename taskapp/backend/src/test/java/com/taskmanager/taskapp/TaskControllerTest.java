package com.taskmanager.taskapp;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
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
    void testGetAllTasks() throws Exception {

        TaskStatus status = TaskStatus.ACTIVE;
        TaskDto dto1 = new TaskDto(1L, "Test Task 1", "Desc", status, 1, null, null, null, null, null, null);
        TaskDto dto2 = new TaskDto(1L, "Test Task 2", "Desc", status, 1, null, null, null, null, null, null);
        when(taskService.getTasksForCurrentUser()).thenReturn(List.of(dto1, dto2));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Task 1"))
                .andExpect(jsonPath("$[1].title").value("Test Task 2"));
    }
}
