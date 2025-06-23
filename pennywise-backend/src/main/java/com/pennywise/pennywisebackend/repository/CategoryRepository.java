package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    // List<Category> findByType(String type); // If type is added to Category entity
}
