package com.taskmanager.taskapp.api;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommonResponse<T> {

    private int code;
    private String message;
    private T data;

    // private constructor
    private CommonResponse(int code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    // ==========================
    // (Factory Methods)
    // ==========================

    public static <T> CommonResponse<T> ok(T data) {
        return new CommonResponse<>(200, "success", data);
    }

    public static <T> CommonResponse<T> created(T data) {
        return new CommonResponse<>(201, "created", data);
    }

    public static <T> CommonResponse<T> error(int code, String message) {
        return new CommonResponse<>(code, message, null);
    }

    // Getter
    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public T getData() {
        return data;
    }

}
