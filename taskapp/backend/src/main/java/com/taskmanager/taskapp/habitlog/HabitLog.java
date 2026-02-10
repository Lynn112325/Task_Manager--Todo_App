package com.taskmanager.taskapp.habitlog;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.taskmanager.taskapp.TaskSchedule.tasktemplate.TaskTemplate;
import com.taskmanager.taskapp.enums.HabitLogStatus;
import com.taskmanager.taskapp.task.Task;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "habit_logs", uniqueConstraints = @UniqueConstraint(columnNames = { "task_id" }))
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_template_id", nullable = false)
    private TaskTemplate taskTemplate;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(length = 255)
    private String note;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private HabitLogStatus status;

}
