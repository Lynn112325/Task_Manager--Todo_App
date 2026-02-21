package com.taskmanager.taskapp.task.dto;

import com.taskmanager.taskapp.task.Task;

public record TaskProcessResult(String message, Task newTask, Task oldTask) {
    public TaskProcessResult(String message) {
        this(message, null, null);
    }
}