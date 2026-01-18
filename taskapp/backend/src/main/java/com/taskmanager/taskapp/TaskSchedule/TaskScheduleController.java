package com.taskmanager.taskapp.TaskSchedule;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.security.MyUserDetailsService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/task_schedules")
@RequiredArgsConstructor
@Slf4j
public class TaskScheduleController extends BaseController {
    private final TaskScheduleService taskScheduleService;
    private final MyUserDetailsService myUserDetailsService;

    @GetMapping
    public ResponseEntity<CommonResponse<?>> getTaskSchedules(
            @RequestParam(required = false) Long target_id) {
        Long userId = myUserDetailsService.getCurrentUserId();
        return ok(taskScheduleService.getTaskSchedules(userId, target_id));
    }
}
