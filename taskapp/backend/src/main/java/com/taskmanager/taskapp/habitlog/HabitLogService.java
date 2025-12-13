package com.taskmanager.taskapp.habitlog;

import org.springframework.stereotype.Service;

import com.taskmanager.taskapp.security.MyUserDetailsService;

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
}
