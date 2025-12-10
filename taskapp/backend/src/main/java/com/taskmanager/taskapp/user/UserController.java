package com.taskmanager.taskapp.user;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;
import com.taskmanager.taskapp.api.CommonResponse;
import com.taskmanager.taskapp.security.MyUserDetails;

@RestController
@RequestMapping("/api/user")
public class UserController extends BaseController {

    @GetMapping("/me")
    public ResponseEntity<CommonResponse<?>> getCurrentUser(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return fail(HttpStatus.UNAUTHORIZED.value(), "User is not authenticated");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof MyUserDetails userDetails) {
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("username", userDetails.getUsername());
            userInfo.put("email", userDetails.getEmail());
            return ok(userInfo);
        }

        return fail(HttpStatus.UNAUTHORIZED.value(), "User details not found");
    }
}
