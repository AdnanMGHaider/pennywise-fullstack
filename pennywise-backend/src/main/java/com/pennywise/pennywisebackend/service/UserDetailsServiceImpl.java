package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList; // For granting authorities if roles were used

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException { // Parameter is now the actual username (full name)
        User user = userRepository.findByUsername(username) // Reverted to find by actual username
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        // For now, we are not using roles/authorities. If roles were implemented,
        // they would be mapped to GrantedAuthority objects here.
        // Example:
        // Set<GrantedAuthority> authorities = user.getRoles().stream()
        // .map(role -> new SimpleGrantedAuthority(role.getName().name()))
        // .collect(Collectors.toSet());

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                new ArrayList<>() // Empty list of authorities
        );
    }
}
