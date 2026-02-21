package com.taskmanager.taskapp.taskschedule;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.taskapp.taskschedule.tasktemplate.TaskTemplate;

@Repository
public interface TaskScheduleRepository extends JpaRepository<TaskTemplate, Long> {

        @Query("""
                        SELECT tt FROM TaskTemplate tt
                        LEFT JOIN FETCH tt.recurringPlan
                        WHERE tt.user = :userId
                        AND (:targetId IS NULL OR tt.target.id = :targetId)
                        """)
        List<TaskTemplate> findAllWithPlanByUserIdAndTargetId(
                        @Param("userId") Long userId,
                        @Param("targetId") Long targetId);
}