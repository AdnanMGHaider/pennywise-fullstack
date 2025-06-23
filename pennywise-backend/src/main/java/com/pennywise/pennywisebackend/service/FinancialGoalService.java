package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.model.FinancialGoal;
import com.pennywise.pennywisebackend.repository.FinancialGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class FinancialGoalService {

    private final FinancialGoalRepository financialGoalRepository;

    public List<FinancialGoal> getAllFinancialGoals() {
        return financialGoalRepository.findAll();
    }

    public Optional<FinancialGoal> getFinancialGoalById(Long id) {
        return financialGoalRepository.findById(id);
    }

    public FinancialGoal saveFinancialGoal(FinancialGoal financialGoal) {
        // Add any specific business logic before saving, e.g., validation
        return financialGoalRepository.save(financialGoal);
    }

    public FinancialGoal updateFinancialGoal(Long id, FinancialGoal goalDetails) {
        FinancialGoal goal = financialGoalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FinancialGoal not found with id: " + id));

        goal.setTitle(goalDetails.getTitle());
        goal.setTargetAmount(goalDetails.getTargetAmount());
        goal.setCurrentAmount(goalDetails.getCurrentAmount());
        goal.setDeadline(goalDetails.getDeadline());
        goal.setCategory(goalDetails.getCategory());

        return financialGoalRepository.save(goal);
    }

    public void deleteFinancialGoal(Long id) {
        if (!financialGoalRepository.existsById(id)) {
            throw new RuntimeException("FinancialGoal not found with id: " + id);
        }
        financialGoalRepository.deleteById(id);
    }
}
