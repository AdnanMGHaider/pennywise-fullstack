package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.FinancialGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialGoalRepository extends JpaRepository<FinancialGoal, Long> {
    List<FinancialGoal> findByCategory(String category);

    List<FinancialGoal> findByDeadlineBefore(java.time.LocalDate date);
}
