package com.taskmanager.taskapp.habitlog;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.taskmanager.taskapp.api.BaseController;

import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/tasks")
public class HabitLogController extends BaseController {

    // private final HabitLogService habitLogService;

}