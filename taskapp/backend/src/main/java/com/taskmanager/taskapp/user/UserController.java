package com.taskmanager.taskapp.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.security.MyUserDetails;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // Check if the user is authenticated
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof MyUserDetails userDetails) {
            Map<String, Object> userInfo = new HashMap<>();
            // userInfo.put("id", userDetails.getId());
            userInfo.put("username", userDetails.getUsername());
            userInfo.put("email", userDetails.getEmail());
            return ResponseEntity.ok(userInfo);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Unexpected principal type");
    }
}