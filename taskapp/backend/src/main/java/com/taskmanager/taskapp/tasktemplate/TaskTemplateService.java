package com.taskmanager.taskapp.tasktemplate;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;

import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.target.Target;
import com.taskmanager.taskapp.target.TargetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TaskTemplateService {

    private final TargetRepository targetRepository;
    private final TaskTemplateRepository taskTemplateRepository;
    private final MyUserDetailsService myUserDetailsService;

    // transform TaskTemplate to TaskTemplateDto
    private TaskTemplateDto toDto(TaskTemplate taskTemplate) {
        return new TaskTemplateDto(
                taskTemplate.getId(),
                taskTemplate.getTitle(),
                taskTemplate.getDescription(),
                taskTemplate.getPriority(),
                taskTemplate.getCreatedAt(),
                taskTemplate.getUpdatedAt());
    }

    // get task template by targetId and check owner
    public List<TaskTemplateDto> getTaskTemplateByTargetId(Long targetId) {
        // get the target by id
        Target target = targetRepository.findById(targetId).orElseThrow();
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(target.getUser().getId());

        return taskTemplateRepository.findByTargetId(targetId)
                .stream()
                .map(this::toDto) // convert entity to DTO
                .toList();
    }

    // get task template by id
    public TaskTemplateDto getTaskTemplateById(Long taskTemplateId) {
        // get the task template by id
        TaskTemplate taskTemplate = taskTemplateRepository.findById(taskTemplateId)
                .orElseThrow(() -> new ResourceAccessException("TaskTemplate not found with id: " + taskTemplateId));
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(taskTemplate.getTarget().getUser().getId());
        // turn the entity as DTO and return it to the client
        TaskTemplateDto dto = toDto(taskTemplate);
        return dto;
    }
}