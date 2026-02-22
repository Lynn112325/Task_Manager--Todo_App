package com.taskmanager.taskapp.notification;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.enums.NotificationType;
import com.taskmanager.taskapp.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

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
    public Page<Notification> getUserNotifications(User user, Pageable pageable) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
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
    public void deleteOldNotifications(int daysAgo) {
        // Implementation for cleaning up historical data
    }
}