package com.taskmanager.taskapp.tasktemplate;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface TaskTemplateRepository extends JpaRepository<TaskTemplate, Long> {

    List<TaskTemplate> findByTargetId(Long targetId);

    Optional<TaskTemplate> findByIdAndTargetId(Long id, Long targetId);

    // Custom query to find User ID by TaskTemplate ID
    @Query("""
                SELECT tp.target.user.id
                FROM TaskTemplate tp
                WHERE tp.id = :templateId
            """)
    Optional<Long> findUserIdByTemplateId(@Param("templateId") Long templateId);

}
