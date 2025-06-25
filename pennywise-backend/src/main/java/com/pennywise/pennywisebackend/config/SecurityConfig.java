// package com.pennywise.pennywisebackend.config;

// import com.pennywise.pennywisebackend.security.jwt.AuthEntryPointJwt;
// import com.pennywise.pennywisebackend.security.jwt.JwtRequestFilter;
// import com.pennywise.pennywisebackend.service.UserDetailsServiceImpl;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
// import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

// @Configuration
// @EnableWebSecurity
// @EnableMethodSecurity
// public class SecurityConfig {

//     @Autowired
//     private UserDetailsServiceImpl userDetailsService;

//     @Autowired
//     private AuthEntryPointJwt unauthorizedHandler;

//     @Autowired
//     private JwtRequestFilter jwtRequestFilter;

//     @Autowired
//     private PasswordEncoder passwordEncoder;

//     @Bean
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
//             throws Exception {
//         return authenticationConfiguration.getAuthenticationManager();
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//                 .csrf(AbstractHttpConfigurer::disable)
//                 .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
//                 .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                 .authorizeHttpRequests(auth -> auth
//                         .requestMatchers(new AntPathRequestMatcher("/api/auth/**")).permitAll()
//                         .requestMatchers(new AntPathRequestMatcher("/h2-console/**")).permitAll()
//                         .anyRequest().authenticated());

//         http.headers(headers -> headers.frameOptions(frameOptionsConfig -> frameOptionsConfig.disable()));

//         http.addFilterBefore(jwtRequestFilter,
//                 UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }

// }

////////////////

package com.pennywise.pennywisebackend.config;

import com.pennywise.pennywisebackend.security.jwt.AuthEntryPointJwt;
import com.pennywise.pennywisebackend.security.jwt.JwtRequestFilter;
import com.pennywise.pennywisebackend.service.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService; // loads users from DB

    @Autowired
    private PasswordEncoder passwordEncoder; // BCryptPasswordEncoder bean

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler; // returns 401 JSON

    @Autowired
    private JwtRequestFilter jwtRequestFilter; // validates JWTs

    /* ---------- Authentication ---------- */

    /**
     * The AuthenticationManager (needed by /api/auth/login).
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    /**
     * Register a DaoAuthenticationProvider that uses our UserDetailsServiceImpl
     * and PasswordEncoder.
     */
    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    /* ---------- HTTP security ---------- */

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CORS for the Vercel front-end
                .cors(Customizer.withDefaults())

                // No CSRF because this is a stateless REST API
                .csrf(csrf -> csrf.disable())

                // Custom 401 JSON
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))

                // Don’t create HTTP sessions
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorisation rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // signup / login / refresh
                        .requestMatchers("/h2-console/**").permitAll() // optional
                        .anyRequest().authenticated() // everything else
                )

                // Allow H2 console to render in a frame (optional)
                .headers(h -> h.frameOptions(frame -> frame.disable()))

                // Plug in our custom AuthenticationProvider
                .authenticationProvider(daoAuthenticationProvider())

                // Validate JWT before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
