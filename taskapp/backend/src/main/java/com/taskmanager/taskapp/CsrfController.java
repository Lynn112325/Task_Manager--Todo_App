package com.taskmanager.taskapp;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class CsrfController {

    @GetMapping("/api/csrf")
    public void getCsrfToken(HttpServletRequest request) {
        // No body needed. Accessing this triggers the CsrfTokenRepository to set the
        // cookie.
        CsrfToken token = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        System.out.println("Generated Token: " + token.getToken());
    }
}