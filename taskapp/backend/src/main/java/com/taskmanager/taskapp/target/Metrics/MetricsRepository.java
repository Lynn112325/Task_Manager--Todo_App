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

        @Query("""
                        SELECT SUM(t.priority)
                        FROM Task t
                        LEFT JOIN t.taskTemplate tt
                        WHERE t.user.id = :userId
                        AND t.status = 'COMPLETED'
                        AND (:targetId IS NULL OR tt.target.id = :targetId)
                        AND t.dueDate BETWEEN :start AND :end
                        """)
        Optional<Integer> sumExperiencePoints(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("""
                        SELECT t FROM Task t
                        LEFT JOIN t.taskTemplate tt
                        WHERE t.user.id = :userId
                        AND (:targetId IS NULL OR tt.target.id = :targetId)
                        AND t.status = 'COMPLETED'
                        AND t.dueDate BETWEEN :start AND :end
                        ORDER BY t.dueDate DESC
                        """)
        List<Task> findAllCompletedTasksInPeriod(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("""
                        SELECT rp FROM RecurringPlan rp
                        JOIN rp.taskTemplate tt
                        WHERE tt.user.id = :userId
                        AND rp.status = 'ACTIVE'
                        AND (:targetId IS NULL OR tt.target.id = :targetId)
                        AND (rp.recurrenceEnd IS NULL OR rp.recurrenceEnd >= :start)
                        AND rp.recurrenceStart <= :end
                        """)
        List<RecurringPlan> findActivePlansInPeriod(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query(value = """
                        SELECT COUNT(*) FROM tasks t
                        WHERE t.task_template_id = :templateId
                        AND t.isManual = false
                        AND t.due_date BETWEEN :start AND :end
                        """, nativeQuery = true)
        int countManualTasksInPeriod(@Param("templateId") Long templateId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("""
                        SELECT t FROM Task t
                        LEFT JOIN t.taskTemplate tt
                        WHERE t.user.id = :userId
                        AND t.isManual = false
                        AND (:targetId IS NULL OR tt.target.id = :targetId)
                        AND t.dueDate BETWEEN :start AND :end
                        """)
        List<Task> findAllGeneratedTasksInPeriod(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId,
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

}
