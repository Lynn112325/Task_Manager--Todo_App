package com.taskmanager.taskapp.recurringplan;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RecurringPlanRepository extends JpaRepository<RecurringPlan, Long> {

        List<RecurringPlan> findByRecurrenceType(String recurrenceType);

        List<RecurringPlan> findByNextRunAtBefore(java.time.LocalDateTime dateTime);

        // @Query("""
        // SELECT *
        // FROM recurring_plans rp
        // JOIN task_templates tt ON rp.task_template_id = tt.id
        // JOIN targets t ON tt.target_id = t.id
        // WHERE t.user_id = ?
        // """)
        // List<RecurringPlanDto> findRecurringPlanDtoByUserId(Long userId);

        // Custom query
        @Query("""
                        SELECT r
                        FROM RecurringPlan r
                        JOIN r.taskTemplate tt
                        JOIN tt.target t
                        WHERE t.id = :targetId
                        """)
        List<RecurringPlanDto> findRecurringPlanDtoByTargetId(@Param("targetId") Long targetId);

        // Custom query to find User ID by RecurringPlan ID
        @Query("""
                        SELECT u.id
                        FROM RecurringPlan r
                        JOIN r.taskTemplate tt
                        JOIN tt.target t
                        JOIN t.user u
                        WHERE r.id = :recurringPlanId
                        """)
        Optional<Long> findUserIdByRecurringPlanId(@Param("recurringPlanId") Long recurringPlanId);

        // Custom query to fetch RecurringPlanDto by TaskTemplate ID
        @Query("""
                            SELECT r
                            FROM RecurringPlan r
                            JOIN r.taskTemplate tt
                            WHERE tt.id = :taskTemplateId
                        """)
        Optional<RecurringPlan> findByTemplateId(@Param("taskTemplateId") Long taskTemplateId);

}
