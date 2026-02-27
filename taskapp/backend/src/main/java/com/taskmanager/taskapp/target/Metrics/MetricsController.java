package com.taskmanager.taskapp.target.Metrics;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.security.MyUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/metrics")
@RequiredArgsConstructor
public class MetricsController extends BaseController {

    private final MetricsService metricsService;

    @GetMapping("/weekly")
    public ResponseEntity<CommonResponse<?>> getWeeklyMetrics(
            @AuthenticationPrincipal MyUserDetails userDetails,
            @RequestParam(required = false) Long targetId) { // 改用 RequestParam 支援 null
        return ok(metricsService.getMetrics(userDetails.getId(), targetId, MetricsService.TimeGrain.WEEKLY));
    }

    @GetMapping("/monthly")
    public ResponseEntity<CommonResponse<?>> getMonthlyMetrics(
            @AuthenticationPrincipal MyUserDetails userDetails,
            @RequestParam(required = false) Long targetId) {
        return ok(metricsService.getMetrics(userDetails.getId(), targetId, MetricsService.TimeGrain.MONTHLY));
    }
}
