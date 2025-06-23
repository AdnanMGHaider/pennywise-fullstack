package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email); // Added for login by email

    Boolean existsByUsername(String username);

    Boolean existsByEmail(String email);
}
