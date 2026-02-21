package com.taskmanager.taskapp.notification;

import java.time.LocalDateTime;

import com.taskmanager.taskapp.enums.NotificationType;
import com.taskmanager.taskapp.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    /**
     * If type is SYSTEM_TEXT, this is a plain string.
     * If type is TASK_REMINDER, this stores a JSON string with task details.
     * If type is DAILY_BRIEFING, this stores a JSON string.
     */
    @Lob
    private String content;

    // @OneToMany(fetch = FetchType.LAZY)
    // @JoinColumn(name = "task_id", nullable = true)
    // private Task task;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(name = "redirect_url")
    private String redirectUrl;

    @Builder.Default
    @Column(name = "is_read")
    private boolean read = false;

    @Builder.Default
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}