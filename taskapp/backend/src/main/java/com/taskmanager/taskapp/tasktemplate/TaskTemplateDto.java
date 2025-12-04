package com.taskmanager.taskapp.tasktemplate;

import java.time.LocalDateTime;

public record TaskTemplateDto(
    Long id,
    String title,
    String description,
    int priority,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
    ) {
}
