package com.taskmanager.taskapp.scheduler.dto;

import java.util.List;

import com.taskmanager.taskapp.task.TaskRepository.DailyTaskStats;

public record DailyBriefingDto(
        String date,
        String dayOfWeek,
        List<MissedTaskDetail> missedTasks,
        DailyTaskStats stats,
        String actionLink) {
}