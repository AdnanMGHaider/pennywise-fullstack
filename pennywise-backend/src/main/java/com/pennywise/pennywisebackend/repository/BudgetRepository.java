package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByMonth(LocalDate monthFirstDay);

    Optional<Budget> findByCategoryAndMonth(String category, LocalDate monthFirstDay);

    List<Budget> findByUserId(Long userId);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    List<Budget> findByUserIdAndMonth(Long userId, LocalDate monthFirstDay);

    Optional<Budget> findByUserIdAndCategoryAndMonth(Long userId, String category, LocalDate monthFirstDay);

    List<Budget> findByUserIdAndCategory(Long userId, String category);
}
