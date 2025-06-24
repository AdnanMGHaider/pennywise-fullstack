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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException(
                        "User not found in database. This should not happen if authenticated."));
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
        transaction.setUser(currentUser);

        if ("expense".equalsIgnoreCase(transaction.getType())) {
            transaction.setAmount(transaction.getAmount().abs().negate());
        } else if ("income".equalsIgnoreCase(transaction.getType())) {
            transaction.setAmount(transaction.getAmount().abs());
        } else {
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
                .orElseThrow(() -> new RuntimeException(
                        "Transaction not found with id: " + id + " or access denied for deletion."));
        transactionRepository.delete(transaction);
    }

    public List<Transaction> filterTransactions(String category, String type, String descriptionKeyword,
            LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();

        if (startDate != null && endDate != null) {
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

        return getAllTransactions();
    }

    public List<Transaction> getTransactionsForBudgetCalculation(String category, String type, LocalDate monthStart,
            LocalDate monthEnd) {
        User currentUser = getCurrentUser();
        return transactionRepository.findByUserIdAndCategoryAndTypeAndDateBetween(
                currentUser.getId(), category, type, monthStart, monthEnd);
    }
}
