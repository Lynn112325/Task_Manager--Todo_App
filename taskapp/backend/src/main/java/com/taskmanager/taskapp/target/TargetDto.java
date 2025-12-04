package com.taskmanager.taskapp.target;
import java.time.LocalDateTime;

import com.taskmanager.taskapp.enums.Type;

public record TargetDto(
    Long id, 
    String title, 
    String description, 
    Type type,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
    ) {
    }