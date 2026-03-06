package com.taskmanager.taskapp.habitlog;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.taskmanager.taskapp.enums.HabitLogStatus;
import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.task.Task;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HabitLogService {

    private final HabitLogRepository habitLogRepository;
    private final MyUserDetailsService myUserDetailsService;

    private HabitLogDto toDto(HabitLog habitLog) {
        return new HabitLogDto(
                habitLog.getLogDate(),
                habitLog.getStatus(),
                habitLog.getNote());
    }

    public HabitLogStatsDto getHabitStatsByTemplateId(Long templateId) {
        HabitLogStatsDto habitStats = (templateId != null)
                ? habitLogRepository
                        .findHabitLogStatsByTemplateAndUser(templateId, myUserDetailsService.getCurrentUserId())
                        .orElse(new HabitLogStatsDto(0L, 0L, 0L))
                : new HabitLogStatsDto(0L, 0L, 0L);

        return habitStats;
    }

    /**
     * Persists or updates a habit log entry.
     * Implements 'Upsert' logic to maintain a 1:1 relationship between tasks and
     * logs,
     * while encapsulating habit validation.
     */
    public void upsertHabitLog(Task task, HabitLogStatus status, LocalDate logDate) {
        // 1. Guard Clause: Encapsulate habit validation logic
        if (!isHabitTask(task)) {
            return;
        }

        // 2. Retrieve existing HabitLog or initialize a new one
        HabitLog habitLog = habitLogRepository.findByTaskId(task.getId())
                .orElseGet(() -> createBaseHabitLog(task));

        // 3. Update mutable attributes
        habitLog.setLogDate(logDate);
        habitLog.setStatus(status);

        // 4. Save and force synchronization to prevent TransientObjectException in
        // subsequent queries
        habitLogRepository.saveAndFlush(habitLog);
    }

    /**
     * Safely deletes a habit log entry.
     * Handles bidirectional relationship detachment to ensure Persistence Context
     * consistency.
     */
    public void removeHabitLog(Task task) {
        // Prioritize deletion via object reference to better maintain the Hibernate L1
        // cache
        HabitLog logToRemove = (task.getHabitLog() != null)
                ? task.getHabitLog()
                : habitLogRepository.findByTaskId(task.getId()).orElse(null);

        if (logToRemove != null) {
            // Important: Detach bidirectional relationship before deletion
            task.setHabitLog(null);
            habitLogRepository.delete(logToRemove);

            // Synchronize database immediately to avoid flush conflicts during subsequent
            // SELECTs
            habitLogRepository.flush();
        }
    }

    // --- Private Helper Methods ---

    private boolean isHabitTask(Task task) {
        return task.getTaskTemplate() != null &&
                task.getTaskTemplate().getRecurringPlan() != null &&
                task.getTaskTemplate().getRecurringPlan().getIsHabit();
    }

    private HabitLog createBaseHabitLog(Task task) {
        return HabitLog.builder()
                .task(task)
                .user(task.getUser())
                .taskTemplate(task.getTaskTemplate())
                .build();
    }
}
