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

@CrossOrigin(origins = "*", maxAge = 3600) // Adjust origins as needed for production
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

        // Frontend sends email in loginRequest.getUsername()
        // UserDetailsServiceImpl.loadUserByUsername() now expects actual username (full name)
        // So, first find user by email to get their actual username
        User userForAuth = userRepository.findByEmail(loginRequest.getUsername())
            .orElseThrow(() -> new RuntimeException("Error: User not found with provided email.")); // Or return a 401/bad request

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userForAuth.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateJwtToken(authentication);

        // The principal's username is already the correct full name from UserDetails object created by UserDetailsServiceImpl.
        // We can use userForAuth for response details as it's the same user object.
        return ResponseEntity.ok(new JwtResponse(jwt,
                userForAuth.getId(),
                userForAuth.getUsername(),
                userForAuth.getEmail()
                // If roles are implemented, pass them here
                ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
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

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        userRepository.save(user);

        // Optionally, authenticate the user immediately and return a JWT
        // This provides a smoother UX as the user is logged in after registration.
        // Authenticate with username (full name) and password, as UserDetailsServiceImpl.loadUserByUsername now expects the username.
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(signUpRequest.getUsername(), signUpRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtil.generateJwtToken(authentication);

        // Fetch the user by username to get all details for the response.
        User registeredUser = userRepository.findByUsername(signUpRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found by username after registration. This should not happen."));


        return ResponseEntity.ok(new JwtResponse(jwt,
                                registeredUser.getId(),
                                registeredUser.getUsername(),
                                registeredUser.getEmail()));
        // Or simply return a success message:
        // return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
