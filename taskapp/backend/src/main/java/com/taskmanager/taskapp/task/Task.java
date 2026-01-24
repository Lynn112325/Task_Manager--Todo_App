package com.taskmanager.taskapp.task;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taskmanager.taskapp.TaskSchedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.enums.Type;
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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_template_id")
    private TaskTemplate taskTemplate;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime startDate;
    private LocalDateTime dueDate;

    @Column(nullable = false, columnDefinition = "INT DEFAULT 0")
    private int priority;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Type type;

    // @Column(name = "is_completed", columnDefinition = "BOOLEAN DEFAULT FALSE", nullable = false)
    // private Boolean isCompleted;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TaskStatus status = TaskStatus.ACTIVE;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
