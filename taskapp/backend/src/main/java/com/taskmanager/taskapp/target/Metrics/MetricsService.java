// package com.taskmanager.taskapp.target.Metrics;

// import java.time.DayOfWeek;
// import java.time.LocalDateTime;
// import java.time.LocalTime;
// import java.time.temporal.ChronoUnit;

// import org.springframework.stereotype.Service;

// import com.taskmanager.taskapp.task.TaskRepository;
// import com.taskmanager.taskapp.user.User;

// import lombok.RequiredArgsConstructor;

// @Service
// @RequiredArgsConstructor
// public class MetricsService {

// private final TaskRepository taskRepository;

// public MetricsDto calculateWeeklyMetrics(User user) {
// // 1. Get basic counts from repository
// // 從資料庫獲取基礎數據
// int expected = taskRepository.countExpectedTasksThisWeek(user.getId());
// int completed = taskRepository.countCompletedTasksThisWeek(user.getId());
// int extra = taskRepository.countExtraTasksThisWeek(user.getId());

// // 2. Calculate completion rate (Handle division by zero)
// // 計算達成率（處理除以零的情況）
// double completionRate = expected > 0 ? (double) completed / expected : 0;

// // 3. Check if goal is met
// // 判斷目標是否達成
// boolean goalMet = completed >= expected && expected > 0;

// // 4. Calculate week progress percentage
// // 計算本週時間流逝百分比 (目前時間點 / 一週總秒數)
// double weekProgress = calculateWeekProgress();

// // 5. Generate a simple insight message
// // 產生簡單的系統建議訊息
// String insight = generateInsight(completionRate, weekProgress, goalMet);

// return new MetricsDto(
// expected,
// completed,
// extra,
// completionRate,
// // user.getCurrentStreak(),
// goalMet,
// taskRepository.countActiveBlueprints(user.getId()),
// weekProgress,
// // user.getTotalXP(),
// insight);
// }

// private double calculateWeekProgress() {
// LocalDateTime now = LocalDateTime.now();
// // Get the start of the week (Monday 00:00)
// // 獲取本週開始時間（週一 00:00）
// LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY).with(LocalTime.MIN);

// // Total seconds in a week (7 days)
// // 一週總秒數 (7天)
// long totalSecondsInWeek = 7 * 24 * 60 * 60;

// // Seconds passed since Monday
// // 從週一到現在經過的秒數
// long secondsPassed = ChronoUnit.SECONDS.between(startOfWeek, now);

// return (double) secondsPassed / totalSecondsInWeek;
// }

// private String generateInsight(double rate, double progress, boolean goalMet)
// {
// if (goalMet)
// return "Weekly goal achieved! Champion! 🏆";
// if (rate > progress)
// return "You're ahead of schedule! 🚀";
// if (rate > 0)
// return "Keep going, you're doing great! 💪";
// return "Start your first task to build momentum! ✨";
// }
// }
