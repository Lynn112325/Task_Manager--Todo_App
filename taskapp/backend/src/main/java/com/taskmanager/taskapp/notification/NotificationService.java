package com.taskmanager.taskapp.notification;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.enums.NotificationType;
import com.taskmanager.taskapp.user.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    private NotificationDto toDto(Notification notification) {
        return new NotificationDto(
                notification.getId(),
                notification.getTitle(),
                notification.getType().name(),
                notification.isRead(),
                notification.getRedirectUrl(),
                notification.getCreatedAt(),
                notification.getContent());
    }

    /**
     * Creates a new notification.
     * Can be called by Schedulers or other internal services.
     */
    @Transactional
    public void create(User user, String title, NotificationType type, String content, String redirectUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .type(type)
                .content(content)
                .redirectUrl(redirectUrl)
                .read(false)
                .build();

        notificationRepository.save(notification);
        // TODO: Add WebSocket or Push Notification logic here in the future
    }

    /**
     * Retrieves a paginated list of notifications for a specific user.
     */
    public Page<NotificationDto> getUserNotifications(User user, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        return notifications.map(this::toDto);
    }

    /**
     * Returns the count of unread notifications for a user.
     */
    public long getUnreadCount(User user) {
        return notificationRepository.countByUserAndReadFalse(user);
    }

    /**
     * Marks a single notification as read.
     */
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        notificationRepository.findByIdAndUser(notificationId, user)
                .ifPresent(n -> n.setRead(true));
    }

    /**
     * Marks all unread notifications for a user as read.
     */
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndReadFalse(user);
        unread.forEach(n -> n.setRead(true));
    }

    /**
     * Deletes old notifications to prevent database bloat.
     * Suggested use: Call from a Scheduler for periodic cleanup (e.g., retain 30
     * days).
     */
    @Transactional
    public int deleteOldNotifications(int daysAgo) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysAgo);
        int deletedCount = notificationRepository.deleteNotificationsOlderThan(threshold);
        // log.info("Cleanup: Deleted {} notifications older than {}.", deletedCount,
        // threshold);
        return deletedCount;
    }

}