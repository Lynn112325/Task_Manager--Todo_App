package com.taskmanager.taskapp.target;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.target.dto.TargetDto;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/targets")
@RequiredArgsConstructor
public class TargetController extends BaseController {

    private final TargetService targetService;

    // get all targets for the current user
    @GetMapping
    public ResponseEntity<CommonResponse<?>> getTargets() {
        return ok(targetService.getTargetsForCurrentUser());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommonResponse<?>> getTarget(@PathVariable("id") Long targetId) {
        TargetDto target = targetService.getTargetByIdForCurrentUser(targetId);
        return ok(target);
    }

}
