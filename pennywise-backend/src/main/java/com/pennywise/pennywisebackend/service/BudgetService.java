package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.model.Budget;
import com.pennywise.pennywisebackend.model.Transaction;
import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.repository.BudgetRepository;
import com.pennywise.pennywisebackend.repository.TransactionRepository;
import com.pennywise.pennywisebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Import DTO
import com.pennywise.pennywisebackend.dto.BudgetDTO;


@Service
@RequiredArgsConstructor
@Transactional
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository; // To calculate spent amounts
    private final UserRepository userRepository; // Added for user retrieval

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found in database. This should not happen if authenticated."));
    }

    private BudgetDTO convertToDto(Budget budget) {
        // Ensure the budget has a user, which it should if fetched/saved correctly by user-scoped methods
        if (budget.getUser() == null) {
            // This case should ideally not happen if services correctly associate/fetch budgets with users.
            // If it can, getCurrentUser() might be needed here, or ensure all budget objects passed are user-associated.
            // For now, we'll assume budget.getUser() is populated.
            // If not, an explicit fetch of the user might be required if the budget passed doesn't have user eagerly loaded
            // or if it's a new budget not yet persisted with user.
            // However, since this is a private method called by user-scoped public methods, budget.getUser() should be valid.
             throw new IllegalStateException("Budget user cannot be null for DTO conversion. Ensure budget is user-associated.");
        }
        Long userId = budget.getUser().getId();
        LocalDate monthStart = budget.getMonth();
        LocalDate monthEnd = YearMonth.from(monthStart).atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findByUserIdAndCategoryAndTypeAndDateBetween(
            userId, budget.getCategory(), "expense", monthStart, monthEnd
        );

        BigDecimal spentAmount = transactions.stream()
                                     .map(Transaction::getAmount)
                                     .reduce(BigDecimal.ZERO, BigDecimal::add)
                                     .abs(); // Expenses are negative, so take absolute

        return new BudgetDTO(
            budget.getId(),
            budget.getCategory(),
            budget.getBudgetAmount(),
            spentAmount,
            budget.getMonth()
        );
    }

    public List<BudgetDTO> getAllBudgets() {
        User currentUser = getCurrentUser();
        return budgetRepository.findByUserId(currentUser.getId()).stream()
               .map(this::convertToDto)
               .collect(Collectors.toList());
    }

    public List<BudgetDTO> getBudgetsByMonth(LocalDate monthFirstDay) {
        User currentUser = getCurrentUser();
        return budgetRepository.findByUserIdAndMonth(currentUser.getId(), monthFirstDay).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public Optional<BudgetDTO> getBudgetById(Long id) {
        User currentUser = getCurrentUser();
        return budgetRepository.findByIdAndUserId(id, currentUser.getId()).map(this::convertToDto);
    }

    public Optional<BudgetDTO> getBudgetByCategoryAndMonth(String category, LocalDate monthFirstDay) {
        User currentUser = getCurrentUser();
        return budgetRepository.findByUserIdAndCategoryAndMonth(currentUser.getId(), category, monthFirstDay).map(this::convertToDto);
    }

    public Budget saveBudget(Budget budget) {
        User currentUser = getCurrentUser();
        budget.setUser(currentUser); // Associate with current user
        budget.setMonth(budget.getMonth().withDayOfMonth(1)); // Ensure month is set to the first day

        Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryAndMonth(
                currentUser.getId(), budget.getCategory(), budget.getMonth());
        if (existingBudget.isPresent()) {
            throw new RuntimeException("Budget already exists for category " + budget.getCategory() +
                                       " and month " + budget.getMonth() + " for this user.");
        }
        return budgetRepository.save(budget);
    }

    public Budget updateBudget(Long id, Budget budgetDetails) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        Budget budget = budgetRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id + " or access denied."));

        LocalDate newMonth = budgetDetails.getMonth().withDayOfMonth(1);

        if (!budget.getCategory().equals(budgetDetails.getCategory()) || !budget.getMonth().equals(newMonth)) {
            Optional<Budget> existingBudget = budgetRepository.findByUserIdAndCategoryAndMonth(
                    userId, budgetDetails.getCategory(), newMonth);
            if (existingBudget.isPresent() && !existingBudget.get().getId().equals(id)) {
                 throw new RuntimeException("Another budget already exists for category " + budgetDetails.getCategory() +
                                            " and month " + newMonth + " for this user.");
            }
        }

        budget.setCategory(budgetDetails.getCategory());
        budget.setBudgetAmount(budgetDetails.getBudgetAmount());
        budget.setMonth(newMonth);
        // budget.setUser(currentUser); // User is already set and should not change

        return budgetRepository.save(budget);
    }

    public void deleteBudget(Long id) {
        User currentUser = getCurrentUser();
        Budget budget = budgetRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Budget not found with id: " + id + " or access denied for deletion."));
        budgetRepository.delete(budget);
    }
}
