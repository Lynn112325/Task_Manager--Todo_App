package com.taskmanager.taskapp.notification;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.security.MyUserDetails;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController extends BaseController {

    private final NotificationService notificationService;

    /**
     * Get paginated notifications for the currently authenticated user.
     */
    @GetMapping
    public ResponseEntity<CommonResponse<?>> getMyNotifications(
            @AuthenticationPrincipal MyUserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        return ok(notificationService.getUserNotifications(userDetails.getUser(), pageable));
    }

    /**
     * Get the count of unread notifications (typically used for badge counts on a
     * Navbar).
     */
    @GetMapping("/unread-count")
    public ResponseEntity<CommonResponse<?>> getUnreadCount(@AuthenticationPrincipal MyUserDetails userDetails) {
        return ok(notificationService.getUnreadCount(userDetails.getUser()));
    }

    /**
     * Mark a specific notification as read by its ID.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<CommonResponse<?>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal MyUserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getUser());
        return ok("Notification marked as read");
    }

    /**
     * Mark all notifications belonging to the authenticated user as read.
     */
    @PatchMapping("/read-all")
    public ResponseEntity<CommonResponse<?>> markAllAsRead(@AuthenticationPrincipal MyUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUser());
        return ok("All notifications marked as read");
    }
}