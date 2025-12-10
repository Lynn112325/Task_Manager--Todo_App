package com.taskmanager.taskapp.task;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.taskmanager.taskapp.task.dto.TaskDto;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUser_Id(Long userId);

    @Query("""
                SELECT new com.taskmanager.taskapp.task.dto.TaskDto(
                    t.id, t.title, t.description, t.isCompleted, t.priority, t.type,
                    t.createdAt, t.updatedAt, t.startDate, t.dueDate, tt.id
                )
                FROM Task t
                LEFT JOIN t.taskTemplate tt
                WHERE t.id = :taskId AND t.user.id = :userId
            """)
    Optional<TaskDto> findTaskDtoByIdAndUserId(@Param("taskId") Long taskId, @Param("userId") Long userId);

    // save() – to persist entities into the database
    // findById() – to find database record by its id
    // findAll() – to get all entities
    // findById() – to get an entity by its id.
}
