package com.taskmanager.taskapp.security;

import java.util.List;

import org.springframework.context.annotation.Primary;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.taskmanager.taskapp.user.User;
import com.taskmanager.taskapp.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Primary
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new MyUserDetails(user);
    }

    public List<Long> findAllUserIds() {
        return userRepository.findAllUserIds();
    }

    public List<Long> findUserIdsByTimezones(List<String> timezones) {
        return userRepository.findUserIdsByTimezones(timezones);
    }

    public User loadUserById(Long id) throws UsernameNotFoundException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return user;
    }

    // get current user ID from security context
    public Long getCurrentUserId() {
        MyUserDetails userDetails = (MyUserDetails) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        return userDetails.getId();
    }

    public void checkOwnership(Long ownerId) {
        Long currentUserId = getCurrentUserId();
        if (!ownerId.equals(currentUserId)) {
            throw new AccessDeniedException("You do not own this resource");
        }
    }
}
