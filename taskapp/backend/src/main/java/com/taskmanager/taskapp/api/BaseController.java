package com.taskmanager.taskapp.api;

import org.springframework.http.ResponseEntity;

public abstract class BaseController {

    // ======================
    // 200 OK
    // ======================
    protected <T> ResponseEntity<CommonResponse<?>> ok(T data) {
        return ResponseEntity.ok(CommonResponse.ok(data));
    }

    protected ResponseEntity<CommonResponse<?>> ok() {
        return ResponseEntity.ok(CommonResponse.ok(null));
    }

    // ======================
    // 201 Created
    // ======================
    protected <T> ResponseEntity<CommonResponse<?>> created(T data) {
        return ResponseEntity
                .status(201)
                .body(CommonResponse.created(data));
    }

    protected ResponseEntity<CommonResponse<?>> created() {
        return ResponseEntity
                .status(201)
                .body(CommonResponse.created(null));
    }

    // ======================
    // error responses
    // ======================
    protected ResponseEntity<CommonResponse<?>> fail(int code, String message) {
        return ResponseEntity
                .status(code)
                .body(CommonResponse.error(code, message));
    }
}
