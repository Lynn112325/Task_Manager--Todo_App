package com.taskmanager.taskapp.task.dto;

import java.time.LocalDateTime;

import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.enums.Type;

public record TaskDto(
                Long id,
                String title,
                String description,
                TaskStatus status,
                Integer priority,
                Type type,
                LocalDateTime createdAt,
                LocalDateTime updatedAt,
                LocalDateTime startDate,
                LocalDateTime dueDate,
                Long templateId, // if null, allows user save task as task template, and remember to associate it
                // with the task target

                String systemMessage) {

        public TaskDto withSystemMessage(String message) {
                return new TaskDto(id, title, description, status, priority, type,
                                createdAt, updatedAt, startDate, dueDate, templateId, message);
        }
}
