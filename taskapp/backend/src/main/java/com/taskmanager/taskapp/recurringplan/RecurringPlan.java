package com.taskmanager.taskapp.recurringplan;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.Weekday;
import com.taskmanager.taskapp.tasktemplate.TaskTemplate;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_template_id")
    private TaskTemplate taskTemplate;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", nullable = false, length = 20)
    private RecurrenceType recurrenceType;

    @Column(name = "recurrence_interval", columnDefinition = "INT DEFAULT 1", nullable = false)
    private int recurrenceInterval;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    private List<Weekday> recurrenceDays;

    private LocalDateTime recurrenceStart;
    private LocalDateTime recurrenceEnd;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_habit", nullable = false)
    private Boolean isHabit = false;

    private LocalDateTime nextRunAt;
    private LocalDateTime lastGeneratedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
