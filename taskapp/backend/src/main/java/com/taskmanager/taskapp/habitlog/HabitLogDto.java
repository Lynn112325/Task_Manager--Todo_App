package com.taskmanager.taskapp.habitlog;

import java.time.LocalDate;

import com.taskmanager.taskapp.enums.HabitLogStatus;

public record HabitLogDto(
        LocalDate logDate,
        HabitLogStatus status,
        String note) {
}
