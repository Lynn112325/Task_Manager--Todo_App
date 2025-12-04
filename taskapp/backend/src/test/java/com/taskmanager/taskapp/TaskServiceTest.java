package com.taskmanager.taskapp;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.taskmanager.taskapp.security.MyUserDetails;
import com.taskmanager.taskapp.target.TargetRepository;
import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.task.TaskRepository;
import com.taskmanager.taskapp.task.TaskService;
import com.taskmanager.taskapp.task.dto.TaskDto;
import com.taskmanager.taskapp.user.User;
import com.taskmanager.taskapp.user.UserRepository;

class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TargetRepository targetRepository;

    @Mock
    private com.taskmanager.taskapp.security.MyUserDetailsService myUserDetailsService;

    @InjectMocks
    private TaskService taskService;

    private Task task1;
    private Task task2;
    private User user;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        // mock user and security context
        MyUserDetails userDetails = mock(MyUserDetails.class);
        when(userDetails.getId()).thenReturn(1L);

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);

        SecurityContextHolder.setContext(securityContext);

        user = new User();
        user.setId(1L);

        task2 = new Task();
        task2.setId(1L);
        task2.setUser(user);
        task2.setTitle("Test Task 2");
        task2.setDescription("Description 2");
        task2.setIsCompleted(false);

        task1 = new Task();
        task1.setId(2L);
        task1.setUser(user);
        task1.setTitle("Test Task 1");
        task1.setDescription("Description 1");
        task1.setIsCompleted(false);
    }

    @AfterEach
    void tearDown() {
        // stub MyUserDetailsService to return current user id and allow ownership
        // checks
        when(myUserDetailsService.getCurrentUserId()).thenReturn(1L);
        // default do nothing for checkOwnership
        // (if needed, tests can override to throw AccessDeniedException)
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetTasksForCurrentUser() {
        when(taskRepository.findByUser_Id(anyLong())).thenReturn(List.of(task1, task2));

        List<TaskDto> tasks = taskService.getTasksForCurrentUser();

        assertEquals(2, tasks.size());
        assertEquals("Test Task 1", tasks.get(0).title());
        assertEquals("Test Task 2", tasks.get(1).title());
    }

    @Test
    void testCreateTask() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        when(taskRepository.save(any(Task.class))).thenReturn(task1);

        TaskDto saved = taskService.createTask(task1);

        assertNotNull(saved);
        assertEquals(user.getId(), task1.getUser().getId());
    }

    @Test
    void testDeleteTask() {
        when(taskRepository.findById(anyLong())).thenReturn(Optional.of(task1));

        assertDoesNotThrow(() -> taskService.deleteTask(1L));
        verify(taskRepository, times(1)).delete(task1);
    }

    // test getTaskById for task not existing
    @Test
    void testGetTaskById_NotFound() {
        when(taskRepository.findById(anyLong())).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            taskService.getTaskDetailById(999L);
        });

        assertEquals("Task not found", ex.getMessage());
    }

    // test access denied
    @Test
    void testGetTaskById_AccessDenied() {
        // create another user
        User anotherUser = new User();
        anotherUser.setId(2L);

        task1.setUser(anotherUser);
        when(taskRepository.findById(anyLong())).thenReturn(Optional.of(task1));

        // simulate access denied by throwing from the security helper
        doThrow(new AccessDeniedException("Access denied")).when(myUserDetailsService).checkOwnership(anyLong());

        assertThrows(AccessDeniedException.class, () -> taskService.getTaskDetailById(1L));
    }
}
