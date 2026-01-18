package com.taskmanager.taskapp.target;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.target.dto.TargetDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TargetService {
    private final TargetRepository targetRepository;
    private final MyUserDetailsService myUserDetailsService;

    // transform Task to TargetDto
    private TargetDto toDto(Target target) {
        return new TargetDto(
                target.getId(),
                target.getTitle(),
                target.getDescription(),
                target.getType(),
                target.getCreatedAt(),
                target.getUpdatedAt());
    }

    // get targets for current user
    @Transactional(readOnly = true)
    public List<TargetDto> getTargetsForCurrentUser() {
        Long userId = myUserDetailsService.getCurrentUserId();

        return targetRepository.findByUser_Id(userId)
                .stream()
                .map(this::toDto) // convert target to TargetDto
                .toList();
    }

    // get target by targetId and check owner
    @Transactional(readOnly = true)
    public TargetDto getTargetByIdForCurrentUser(Long targetId) {
        // get the target by id
        Target target = targetRepository.findById(targetId).orElseThrow(() -> new RuntimeException("Target not found"));
        // check if the current user is the owner
        myUserDetailsService.checkOwnership(target.getUser().getId());
        // turn the entity as DTO and return it to the client
        TargetDto dto = toDto(target);
        return dto;
    }

    public TargetDto getTargetByTemplateId(Long templateId) {

        TargetDto targetDto = templateId != null
                ? targetRepository.findDtoByTemplateId(templateId).orElse(null)
                : null;

        return targetDto;
    }
}
