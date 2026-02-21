package com.taskmanager.taskapp.target;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TargetRepository extends JpaRepository<Target, Long> {

    List<Target> findByUser_Id(Long userId);

    // check if the target belongs to the user before calling the following methods

    // Custom query to find TargetDto by TaskTemplate ID
    @Query("""
            SELECT new com.taskmanager.taskapp.target.TargetDto(
                t.id,
                t.title,
                t.description,
                t.type,
                t.createdAt,
                t.updatedAt
            )
            FROM Target t
            JOIN t.taskTemplates tt
            WHERE tt.id = :taskTemplateId
            """)
    Optional<TargetDto> findDtoByTemplateId(@Param("taskTemplateId") Long taskTemplateId);
}