package com.taskmanager.taskapp.habitlog;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    List<HabitLog> findByUserId(Long userId);

    @Query("""
                SELECT new com.taskmanager.taskapp.habitlog.HabitLogStatsDto(
                    SUM(CASE WHEN hl.status = 'DONE' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN hl.status = 'CANCELED' THEN 1 ELSE 0 END),
                    SUM(CASE WHEN hl.status = 'MISSED' THEN 1 ELSE 0 END)
                )
                FROM HabitLog hl
                WHERE hl.taskTemplate.id = :templateId AND hl.user.id = :userId
            """)
    Optional<HabitLogStatsDto> findHabitLogStatsByTemplateAndUser(
            @Param("templateId") Long templateId,
            @Param("userId") Long userId);

    @Modifying
    @Transactional
    void deleteByTaskId(Long taskId);

}