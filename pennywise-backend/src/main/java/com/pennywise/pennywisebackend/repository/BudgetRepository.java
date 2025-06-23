package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    // Find budgets for a specific month (represented by the first day of the month)
    List<Budget> findByMonth(LocalDate monthFirstDay); // Will need to be findByUserIdAndMonth

    // Find a specific budget for a category and month
    Optional<Budget> findByCategoryAndMonth(String category, LocalDate monthFirstDay); // Will need to be findByUserIdAndCategoryAndMonth


    // User-specific finders
    List<Budget> findByUserId(Long userId);
    Optional<Budget> findByIdAndUserId(Long id, Long userId);
    List<Budget> findByUserIdAndMonth(Long userId, LocalDate monthFirstDay);
    Optional<Budget> findByUserIdAndCategoryAndMonth(Long userId, String category, LocalDate monthFirstDay);
    List<Budget> findByUserIdAndCategory(Long userId, String category); // For fetching all budgets of a specific category for a user
}
