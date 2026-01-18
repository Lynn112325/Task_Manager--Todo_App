package com.taskmanager.taskapp.TaskSchedule.recurringplan;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recurringPlans")
@RequiredArgsConstructor
public class RecurringPlanController extends BaseController {

    private final RecurringPlanService recurringPlanService;

    @GetMapping("/target/{targetId}")
    public ResponseEntity<CommonResponse<?>> getPlansByTarget(@PathVariable Long targetId) {
        return ok(recurringPlanService.getRecurringPlansByTargetId(targetId));
    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<CommonResponse<?>> getPlanByTemplate(@PathVariable Long templateId) {
        return ok(recurringPlanService.getRecurringPlanByTemplateId(templateId));
    }

}