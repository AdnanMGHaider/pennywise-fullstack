package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.model.Transaction;
import com.pennywise.pennywisebackend.repository.TransactionRepository;
import com.pennywise.pennywisebackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// import org.springframework.security.access.AccessDeniedException; // Consider specific exceptions

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
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

    public List<Transaction> getAllTransactions() {
        User currentUser = getCurrentUser();
        return transactionRepository.findByUserId(currentUser.getId());
    }

    public Optional<Transaction> getTransactionById(Long id) {
        User currentUser = getCurrentUser();
        return transactionRepository.findByIdAndUserId(id, currentUser.getId());
    }

    public Transaction saveTransaction(Transaction transaction) {
        User currentUser = getCurrentUser();
        transaction.setUser(currentUser); // Associate with current user

        // Ensure amount is stored correctly based on type
        if ("expense".equalsIgnoreCase(transaction.getType())) {
            transaction.setAmount(transaction.getAmount().abs().negate());
        } else if ("income".equalsIgnoreCase(transaction.getType())) {
            transaction.setAmount(transaction.getAmount().abs());
        } else {
            // Handle unknown type or throw exception
            throw new IllegalArgumentException("Transaction type must be 'income' or 'expense'");
        }
        return transactionRepository.save(transaction);
    }

    public Transaction updateTransaction(Long id, Transaction transactionDetails) {
        User currentUser = getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id + " or access denied."));

        transaction.setDate(transactionDetails.getDate());
        transaction.setDescription(transactionDetails.getDescription());
        transaction.setCategory(transactionDetails.getCategory());
        transaction.setType(transactionDetails.getType());
        // User remains the same, no need to set transaction.setUser() again unless transferring ownership (not supported here)

        // Ensure amount is stored correctly based on type for update
        if ("expense".equalsIgnoreCase(transactionDetails.getType())) {
            transaction.setAmount(transactionDetails.getAmount().abs().negate());
        } else if ("income".equalsIgnoreCase(transactionDetails.getType())) {
            transaction.setAmount(transactionDetails.getAmount().abs());
        } else {
            throw new IllegalArgumentException("Transaction type must be 'income' or 'expense'");
        }

        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(Long id) {
        User currentUser = getCurrentUser();
        Transaction transaction = transactionRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id + " or access denied for deletion."));
        transactionRepository.delete(transaction); // Use delete(entity) or deleteById(id) after confirming ownership
    }

    // Methods for filtering based on frontend needs
    public List<Transaction> filterTransactions(String category, String type, String descriptionKeyword, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        // This filtering logic needs to be more robust.
        // For now, it will prioritize the first non-null filter.
        // A better approach would use JPA Specifications or build a query dynamically.
        // This is a simplified adaptation of the previous logic.

        if (startDate != null && endDate != null) {
            // If date range is primary, filter by it first, then potentially others if needed
            // For simplicity, only one filter at a time is shown here as per original structure
            return transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        }
        if (category != null && !category.equalsIgnoreCase("all")) {
            return transactionRepository.findByUserIdAndCategory(userId, category);
        }
        if (type != null && !type.equalsIgnoreCase("all")) {
            return transactionRepository.findByUserIdAndType(userId, type);
        }
        if (descriptionKeyword != null && !descriptionKeyword.isEmpty()) {
            return transactionRepository.findByUserIdAndDescriptionContainingIgnoreCase(userId, descriptionKeyword);
        }

        // If no specific filters, return all transactions for the user
        return getAllTransactions(); // This already calls findByUserId
    }

    public List<Transaction> getTransactionsForBudgetCalculation(String category, String type, LocalDate monthStart, LocalDate monthEnd) {
        User currentUser = getCurrentUser();
        return transactionRepository.findByUserIdAndCategoryAndTypeAndDateBetween(
                currentUser.getId(), category, type, monthStart, monthEnd);
    }
}
