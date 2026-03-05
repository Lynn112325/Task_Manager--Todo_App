package com.taskmanager.taskapp.taskschedule.recurringplan;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.taskmanager.taskapp.enums.PlanStatus;
import com.taskmanager.taskapp.enums.RecurrenceType;
import com.taskmanager.taskapp.enums.Weekday;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
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
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id")
    private TaskTemplate taskTemplate;

    // 你可以為 recurring_plans 增加一個 is_workflow (bit) 欄位：
    // 如果 is_workflow = 0 (Hybrid)：執行「時間到就取消舊的」邏輯。
    // 如果 is_workflow = 1 (Workflow)：忽略定時任務的取消邏輯，只在 COMPLETED 觸發時生成下一個。

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", nullable = false, length = 20)
    private RecurrenceType recurrenceType;

    @Builder.Default
    @Column(name = "recurrence_interval", nullable = false)
    private int recurrenceInterval = 1;

    @ElementCollection
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "recurring_plan_recurrence_days", joinColumns = @JoinColumn(name = "recurring_plan_id"))
    private List<Weekday> recurrenceDays;

    private LocalDateTime recurrenceStart;
    private LocalDateTime recurrenceEnd;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlanStatus status = PlanStatus.ACTIVE;

    @Builder.Default
    @Column(name = "is_habit", nullable = false)
    private Boolean isHabit = false;

    private LocalDateTime nextRunAt;
    private LocalDateTime lastGeneratedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean shouldGenerateTask(PlanStatus oldStatus, RecurrenceType oldType, Boolean skipInitialGeneration) {
        if (skipInitialGeneration == true)
            return false;
        if (this.status != PlanStatus.ACTIVE)
            return false;
        if (this.recurrenceType == RecurrenceType.NONE)
            return false;

        boolean isActivating = (oldStatus == null || oldStatus != PlanStatus.ACTIVE);
        boolean isUpgradingToRecurring = (oldType == RecurrenceType.NONE && this.recurrenceType != RecurrenceType.NONE);

        return isActivating || isUpgradingToRecurring;
    }
}
