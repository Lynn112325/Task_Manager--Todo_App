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
     * 持久化或更新習慣日誌。
     * 使用 'Upsert' 邏輯確保任務與日誌的 1:1 關係，並封裝習慣判斷邏輯。
     */
    public void upsertHabitLog(Task task, HabitLogStatus status, LocalDate logDate) {
        // 1. 衛句 (Guard Clause)：封裝習慣判斷邏輯
        if (!isHabitTask(task)) {
            return;
        }

        // 2. 獲取或初始化 HabitLog
        HabitLog habitLog = habitLogRepository.findByTaskId(task.getId())
                .orElseGet(() -> createBaseHabitLog(task));

        // 3. 更新變動屬性
        habitLog.setLogDate(logDate);
        habitLog.setStatus(status);

        // 4. 保存並強制同步，防止後續查詢觸發 TransientObjectException
        habitLogRepository.saveAndFlush(habitLog);
    }

    /**
     * 安全刪除習慣日誌。
     * 處理雙向關聯解除，確保 Persistence Context 狀態一致。
     */
    public void removeHabitLog(Task task) {
        // 優先透過物件引用刪除，能更好地維護 Hibernate 一級緩存
        HabitLog logToRemove = (task.getHabitLog() != null)
                ? task.getHabitLog()
                : habitLogRepository.findByTaskId(task.getId()).orElse(null);

        if (logToRemove != null) {
            task.setHabitLog(null); // 重要：解除雙向關聯
            habitLogRepository.delete(logToRemove);
            habitLogRepository.flush(); // 立即同步資料庫，避免後續 Select 觸發 Flush 衝突
        }
    }

    // --- 內部輔助方法 (Helper Methods) ---

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
