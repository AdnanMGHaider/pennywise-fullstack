package com.pennywise.pennywisebackend.config;

import com.pennywise.pennywisebackend.security.jwt.AuthEntryPointJwt;
import com.pennywise.pennywisebackend.security.jwt.JwtRequestFilter;
import com.pennywise.pennywisebackend.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Enables @PreAuthorize, @PostAuthorize, etc. if needed later
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private PasswordEncoder passwordEncoder; // Defined in ApplicationConfig.java

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler)) // Set custom entry point
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // Stateless sessions
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll() // Allow H2 console access
                    // Add any other public endpoints here (e.g., swagger, actuator health)
                    .anyRequest().authenticated() // All other requests require authentication
            );

        // For H2 console to work with Spring Security, headers need to be configured
        // http.headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin()));
        // A more common way for H2 console with Spring Security 6+
         http.headers(headers -> headers.frameOptions(frameOptionsConfig -> frameOptionsConfig.disable()));


        // Add our custom JWT filter before the standard UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
