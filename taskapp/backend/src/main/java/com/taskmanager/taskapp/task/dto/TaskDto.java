package com.taskmanager.taskapp.task.dto;

import java.time.LocalDateTime;

import com.taskmanager.taskapp.enums.Type;

public record TaskDto(
        Long id,
        String title,
        String description,
        Boolean isCompleted,
        Integer priority,
        Type type,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime startDate,
        LocalDateTime dueDate,

        Long templateId // if null, allows user save task as task template, and remember to associate it
                        // with the task target
) {
}
