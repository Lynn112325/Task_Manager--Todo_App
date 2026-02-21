package com.taskmanager.taskapp.scheduler.dto;

public record MissedTaskDetail(
        Long id,
        String title,
        boolean isRecurring,
        String nextRunDate, // null if one-time
        String taskLink) {
}