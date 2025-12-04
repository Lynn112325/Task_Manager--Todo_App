package com.taskmanager.taskapp.recurringplan;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.tasktemplate.TaskTemplate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recurring_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecurringPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "target_id", nullable = false)
    // private Target target;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_template_id")
    private TaskTemplate taskTemplate;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", nullable = false, length = 20)
    private RecurrenceType recurrenceType;

    @Column(name = "recurrence_interval", columnDefinition = "INT DEFAULT 1", nullable = false)
    private int recurrenceInterval;

    @Column(name = "recurrence_days")
    private String recurrenceDays;

    private LocalDateTime recurrenceStart;
    private LocalDateTime recurrenceEnd;

    @Column(name = "is_active", columnDefinition = "BOOLEAN DEFAULT NULL")
    private Boolean isActive;

    private LocalDateTime nextRunAt;
    private LocalDateTime lastGeneratedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
