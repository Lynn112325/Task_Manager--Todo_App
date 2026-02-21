package com.taskmanager.taskapp.notification;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.taskmanager.taskapp.user.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Notification> findByUserAndReadFalse(User user);

    long countByUserAndReadFalse(User user);

    Optional<Notification> findByIdAndUser(Long id, User user);

    List<Notification> findByUser(User user);
}
