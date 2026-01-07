package com.taskmanager.taskapp.recurringplan;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.taskmanager.taskapp.security.MyUserDetailsService;
import com.taskmanager.taskapp.target.TargetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecurringPlanService {

        private final RecurringPlanRepository recurringPlanRepository;
        private final TargetRepository targetRepository;
        private final MyUserDetailsService myUserDetailsService;

        // transform RecurringPlan to RecurringPlanDto
        private RecurringPlanDto toDto(RecurringPlan r) {
                return new RecurringPlanDto(
                                r.getId(),
                                r.getRecurrenceType(),
                                r.getRecurrenceInterval(),
                                r.getRecurrenceDays(),
                                r.getRecurrenceStart(),
                                r.getRecurrenceEnd(),
                                r.getIsActive(),
                                r.getIsHabit(),
                                r.getNextRunAt(),
                                r.getLastGeneratedAt(),
                                r.getCreatedAt(),
                                r.getUpdatedAt());
        }

        // get recurring plan by id
        public RecurringPlanDto getRecurringPlanById(Long recurringPlanId) {

                // check ownership
                Long userId = recurringPlanRepository.findUserIdByRecurringPlanId(recurringPlanId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Recurring plan not found"));

                myUserDetailsService.checkOwnership(userId);

                // get the recurring plan by id
                RecurringPlan recurringPlan = recurringPlanRepository.findById(recurringPlanId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Recurring plan not found"));

                return toDto(recurringPlan);
        }

        // get recurring plan by taskTemplateId
        public RecurringPlanDto getRecurringPlanByTemplateId(Long taskTemplateId) {

                // get the recurring plan DTO by taskTemplateId
                RecurringPlan r = recurringPlanRepository.findByTemplateId(taskTemplateId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "Recurring plan not found for TaskTemplate ID: " + taskTemplateId));

                // return dto to the client
                return toDto(r);
        }

        // get recurring plans by targetId
        public List<RecurringPlanDto> getRecurringPlansByTargetId(Long targetId) {

                myUserDetailsService.checkOwnership(targetRepository.findById(targetId)
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                                "These recurring plans do not belong to the current user"))
                                .getUser().getId());

                return recurringPlanRepository.findRecurringPlanDtoByTargetId(targetId)
                                .stream()
                                .toList();
        }
}
