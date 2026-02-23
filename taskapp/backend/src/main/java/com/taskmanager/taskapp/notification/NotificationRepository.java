package com.taskmanager.taskapp.notification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.taskmanager.taskapp.enums.NotificationType;
import com.taskmanager.taskapp.user.User;

import jakarta.transaction.Transactional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Notification> findByUserAndReadFalse(User user);

    long countByUserAndReadFalse(User user);

    Optional<Notification> findByIdAndUser(Long id, User user);

    List<Notification> findByUser(User user);

    @Query("""
                SELECT COUNT(n) > 0 FROM Notification n
                WHERE n.user.id = :userId
                AND n.type = :type
                AND FUNCTION('DATE', n.createdAt) = :today
            """)
    boolean existsByUserIdAndTypeAndDate(@Param("userId") Long userId,
            @Param("type") NotificationType type,
            @Param("today") LocalDate today);

    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.createdAt < :threshold")
    int deleteNotificationsOlderThan(@Param("threshold") LocalDateTime threshold);
}
