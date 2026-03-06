package com.taskmanager.taskapp.target.Metrics;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.taskapp.task.Task;
import com.taskmanager.taskapp.taskschedule.recurringplan.RecurringPlan;

@Repository
public interface MetricsRepository extends JpaRepository<Task, Long> {

        @Query(value = """
                        SELECT
                                COUNT(CASE WHEN t.status = 'COMPLETED' AND t.is_manual = FALSE THEN 1 END) as completed,
                                COUNT(CASE WHEN t.status = 'COMPLETED' AND t.is_manual = TRUE THEN 1 END) as extra
                        FROM tasks t
                        LEFT JOIN task_templates tt ON t.task_template_id = tt.id
                        WHERE t.user_id = :userId
                        AND (:targetId IS NULL OR tt.target_id = :targetId)
                        AND t.due_date BETWEEN :start AND :end
                        """, nativeQuery = true)
        java.util.Map<String, Object> getTaskCounts(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query(value = """
                        SELECT COUNT(rp.id)
                        FROM recurring_plans rp
                        JOIN task_templates tt ON rp.id = tt.id
                        WHERE tt.user_id = :userId
                        AND rp.status = 'ACTIVE'
                        AND (:targetId IS NULL OR tt.target_id = :targetId)
                        """, nativeQuery = true)
        int countActiveBlueprints(@Param("userId") Long userId, @Param("targetId") Long targetId);

        @Query(value = """
                        SELECT SUM(t.priority)
                        FROM tasks t
                        LEFT JOIN task_templates tt ON t.task_template_id = tt.id
                        WHERE t.user_id = :userId
                        AND t.status = 'COMPLETED'
                        AND (:targetId IS NULL OR tt.target_id = :targetId)
                        AND t.due_date BETWEEN :start AND :end
                        """, nativeQuery = true)
        Optional<Integer> sumExperiencePoints(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        // consider create a Snapshot table
        @Query(value = """
                        SELECT
                                CASE WHEN COUNT(*) > 0 AND COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) >= COUNT(*)
                                THEN TRUE ELSE FALSE END
                        FROM tasks t
                        LEFT JOIN task_templates tt ON t.task_template_id = tt.id
                        WHERE t.user_id = :userId
                        AND (:targetId IS NULL OR tt.target_id = :targetId)
                        AND t.due_date BETWEEN :start AND :end
                        """, nativeQuery = true)
        Integer isGoalMetInPeriod(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query(value = """
                        SELECT rp.* FROM recurring_plans rp
                        JOIN task_templates tt ON rp.id = tt.id
                        WHERE tt.user_id = :userId
                        AND rp.status = 'ACTIVE'
                        AND (:targetId IS NULL OR tt.target_id = :targetId)
                        AND (rp.recurrence_end IS NULL OR rp.recurrence_end >= :start)
                        AND rp.recurrence_start <= :end
                        """, nativeQuery = true)
        List<RecurringPlan> findActivePlansInPeriod(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query(value = """
                        SELECT COUNT(*) FROM tasks t
                        WHERE t.task_template_id = :templateId
                        AND t.due_date BETWEEN :start AND :end
                        """, nativeQuery = true)
        int countManualTasksInPeriod(@Param("templateId") Long templateId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);
}
