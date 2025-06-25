package com.pennywise.pennywisebackend.controller;

import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.payload.request.LoginRequest;
import com.pennywise.pennywisebackend.payload.request.SignupRequest;
import com.pennywise.pennywisebackend.payload.response.JwtResponse;
import com.pennywise.pennywisebackend.payload.response.MessageResponse;
import com.pennywise.pennywisebackend.repository.UserRepository;
import com.pennywise.pennywisebackend.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.pennywise.pennywisebackend.dto.UserProfileDto;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            User userForAuth = userRepository.findByEmail(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Error: User not found with provided email."));

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(userForAuth.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userForAuth.getId(),
                    userForAuth.getUsername(),
                    userForAuth.getEmail()));
        } catch (RuntimeException e) {
            // Log the exception details for backend debugging
            // Consider using a logging framework like SLF4J if not already in use
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Login failed: " + e.getMessage()));
        }  catch (Exception e) {
            System.err.println("Unexpected login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("An unexpected error occurred during login."));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        try {
            if (userRepository.existsByUsername(signUpRequest.getUsername())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Username is already taken!"));
            }

            if (userRepository.existsByEmail(signUpRequest.getEmail())) {
                return ResponseEntity
                        .badRequest()
                        .body(new MessageResponse("Error: Email is already in use!"));
            }

            User user = new User(signUpRequest.getUsername(),
                    signUpRequest.getEmail(),
                    encoder.encode(signUpRequest.getPassword()));
            userRepository.save(user);

            // Authenticate the newly registered user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(signUpRequest.getUsername(), signUpRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtil.generateJwtToken(authentication);

            // Fetch the user again to ensure all details are present (especially ID if generated)
            // Though 'user' object after save should ideally have the ID if configured correctly.
            User registeredUser = userRepository.findByUsername(signUpRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException(
                            "Error: User not found by username after registration. Critical error."));

            return ResponseEntity.ok(new JwtResponse(jwt,
                    registeredUser.getId(),
                    registeredUser.getUsername(),
                    registeredUser.getEmail()));
        } catch (RuntimeException e) {
            System.err.println("Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("Registration failed: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new MessageResponse("An unexpected error occurred during registration."));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: User not authenticated."));
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException(
                        "Error: Authenticated user not found in database. Inconsistency detected."));

        return ResponseEntity.ok(new UserProfileDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getUsername()));
    }
}
