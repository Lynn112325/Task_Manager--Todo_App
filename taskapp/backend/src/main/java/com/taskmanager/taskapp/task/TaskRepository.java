package com.taskmanager.taskapp.task;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.taskapp.enums.TaskStatus;
import com.taskmanager.taskapp.task.dto.TaskDto;
import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    public interface DailyTaskStats {

        Long getActive();

        Long getCompleted();

        Long getCanceled();

        default Long getTotal() {
            return (getActive() != null ? getActive() : 0L) +
                    (getCompleted() != null ? getCompleted() : 0L) +
                    (getCanceled() != null ? getCanceled() : 0L);
        }
    }

    @Query("SELECT t.id FROM Task t WHERE t.user.id = :userId AND t.id IN :ids AND t.status = 'ACTIVE'")
    List<Long> findActiveIdsByUserIdAndIdIn(@Param("userId") Long userId, @Param("ids") List<Long> ids);

    /**
     * Fetch daily statistics.
     */
    @Query("""
            SELECT
                COALESCE(SUM(CASE WHEN t.status = 'ACTIVE'
                    AND FUNCTION('DATE', t.dueDate) = :today THEN 1 ELSE 0 END), 0) as active,
                COALESCE(SUM(CASE WHEN t.status = 'COMPLETED'
                    AND FUNCTION('DATE', t.updatedAt) = :today THEN 1 ELSE 0 END), 0) as completed,
                COALESCE(SUM(CASE WHEN t.status = 'CANCELED'
                    AND FUNCTION('DATE', t.updatedAt) = :today
                    AND h.id IS NULL THEN 1 ELSE 0 END), 0) as canceled
            FROM Task t
            LEFT JOIN HabitLog h ON h.task.id = t.id
                AND h.status = 'MISSED'
            WHERE t.user.id = :userId
            AND (
                FUNCTION('DATE', t.dueDate) = :today
                OR
                FUNCTION('DATE', t.updatedAt) = :today
            )
            """)
    DailyTaskStats getDailyStats(@Param("userId") Long userId, @Param("today") LocalDate today);

    List<Task> findByUser_Id(Long userId);

    @Query("""
                SELECT new com.taskmanager.taskapp.task.dto.TaskDto(
                    t.id, t.title, t.description, t.status, t.priority, t.type,
                    t.createdAt, t.updatedAt, t.startDate, t.dueDate, tt.id, null
                )
                FROM Task t
                LEFT JOIN t.taskTemplate tt
                WHERE t.id = :taskId AND t.user.id = :userId
            """)
    Optional<TaskDto> findTaskDtoById(@Param("taskId") Long taskId, @Param("userId") Long userId);

    @Query("""
                SELECT new com.taskmanager.taskapp.task.dto.TaskDto(
                    t.id, t.title, t.description, t.status, t.priority, t.type,
                    t.createdAt, t.updatedAt, t.startDate, t.dueDate, tt.id, null
                )
                FROM Task t
                LEFT JOIN t.taskTemplate tt
                WHERE t.user.id = :userId AND t.status = 'ACTIVE'
                ORDER BY t.priority DESC, t.dueDate ASC
            """)
    List<TaskDto> findActiveTasks(@Param("userId") Long userId);

    @Query("""
                SELECT new com.taskmanager.taskapp.task.dto.TaskDto(
                    t.id, t.title, t.description, t.status, t.priority, t.type,
                    t.createdAt, t.updatedAt, t.startDate, t.dueDate, tt.id, null
                )
                FROM Task t
                LEFT JOIN t.taskTemplate tt
                WHERE t.user.id = :userId AND t.status = 'ACTIVE'
                AND t.dueDate < :today
                ORDER BY t.priority DESC, t.dueDate ASC
            """)
    List<TaskDto> findOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDateTime today);

    // Find overdue tasks for a specific user (used in cleanup processing)
    @Query("""
                SELECT t FROM Task t
                WHERE t.user.id = :userId
                AND t.status = 'ACTIVE'
                AND t.dueDate < :today
            """)
    List<Task> findOverdueTasksForCleanup(@Param("userId") Long userId, @Param("today") LocalDateTime today);

    // Find Month Range tasks (Added for your getTasksByMonth method)
    @Query("""
                SELECT new com.taskmanager.taskapp.task.dto.TaskDto(
                    t.id, t.title, t.description, t.status, t.priority, t.type,
                    t.createdAt, t.updatedAt, t.startDate, t.dueDate, tt.id, null
                )
                FROM Task t
                LEFT JOIN t.taskTemplate tt
                WHERE t.user.id = :userId
                AND t.dueDate BETWEEN :start AND :end
                ORDER BY
                CASE t.status
                    WHEN 'ACTIVE' THEN 1
                    WHEN 'CANCELED' THEN 2
                    WHEN 'COMPLETED' THEN 3
                    ELSE 4
                END ASC,
                t.priority DESC,
                t.dueDate ASC
            """)
    List<TaskDto> findByDateRange(@Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Finds the next generated task so it can be deleted during Undo
    Optional<Task> findFirstByTaskTemplateAndStatusAndDueDateOrderByCreatedAtDesc(
            TaskTemplate taskTemplate,
            TaskStatus status,
            LocalDateTime dueDate);

    // save() – to persist entities into the database
    // findById() – to find database record by its id
    // findAll() – to get all entities
    // findById() – to get an entity by its id.
}
