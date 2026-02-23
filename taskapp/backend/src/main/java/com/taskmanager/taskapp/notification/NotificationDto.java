package com.taskmanager.taskapp.notification;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        String title,
        String type,
        boolean isRead,
        String redirectUrl,
        LocalDateTime createdAt,
        Object content) {
}