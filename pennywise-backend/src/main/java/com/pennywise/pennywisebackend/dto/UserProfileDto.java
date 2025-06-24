package com.pennywise.pennywisebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    // Add any other fields the frontend might need upon verifying the token, e.g., name
    // For now, matching what AuthContext sets: {id, username, name: username, email: userEmail }
    // So 'name' can be same as username, or you can add a dedicated name field to User model later.
    private String name;
}
