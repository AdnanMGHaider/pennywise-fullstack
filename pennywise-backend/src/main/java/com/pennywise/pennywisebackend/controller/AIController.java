package com.pennywise.pennywisebackend.controller;

import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.repository.UserRepository;
import com.pennywise.pennywisebackend.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Map; // Added for ResponseEntity<Map<String, Object>>
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api/dashboard/ai-advice")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final AIService aiService;
    private final UserRepository userRepository;

    private Long getCurrentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(
                        "User not found in database. This should not happen if authenticated."));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> getAIAdvice() {
        Long userId = getCurrentUserId();
        Map<String, Object> adviceResponse = aiService.generateAiAdviceForUser(userId);
        return ResponseEntity.ok(adviceResponse);
    }
}
