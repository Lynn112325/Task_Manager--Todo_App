package com.taskmanager.taskapp.scheduler.dto;

import java.util.List;

public record DailyBriefingDto(
        String date,
        String dayOfWeek,
        List<MissedTaskDetail> missedTasks,
        String actionLink) {
}