package com.taskmanager.taskapp.taskschedule;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.security.MyUserDetails;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/task_schedules")
@RequiredArgsConstructor
@Slf4j
public class TaskScheduleController extends BaseController {
    private final TaskScheduleService taskScheduleService;

    @GetMapping
    public ResponseEntity<CommonResponse<?>> getTaskSchedules(
            @AuthenticationPrincipal MyUserDetails userDetails,
            @RequestParam(required = false) Long target_id) {
        return ok(taskScheduleService.getTaskSchedules(userDetails.getId(), target_id));
    }

    @PostMapping
    public ResponseEntity<CommonResponse<?>> createSchedule(
            @AuthenticationPrincipal MyUserDetails userDetails, @RequestBody TaskScheduleDto dto) {
        return ok(taskScheduleService.save(userDetails.getUser(), dto, null));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommonResponse<?>> editSchedule(
            @AuthenticationPrincipal MyUserDetails userDetails, @PathVariable Long id,
            @RequestBody TaskScheduleDto dto) {
        return ok(taskScheduleService.save(userDetails.getUser(), dto, id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CommonResponse<?>> updateStatus(
            @AuthenticationPrincipal MyUserDetails userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");
        return ok(taskScheduleService.updateStatus(userDetails.getUser(), id, status));
    }
}
