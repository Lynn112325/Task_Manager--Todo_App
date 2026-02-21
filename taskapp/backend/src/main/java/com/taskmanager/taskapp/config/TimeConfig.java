package com.taskmanager.taskapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class TimeConfig {

    @Value("${app.timezone:Asia/Hong_Kong}")
    private String appTimezone;

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of(appTimezone));
    }
}