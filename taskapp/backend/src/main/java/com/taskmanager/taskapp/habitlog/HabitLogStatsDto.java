package com.taskmanager.taskapp.habitlog;

public record HabitLogStatsDto(
        Long doneCount,
        Long skippedCount,
        Long missedCount) {
}