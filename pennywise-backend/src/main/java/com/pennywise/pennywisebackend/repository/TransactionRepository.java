package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional; // Added this import

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // Example custom query methods (can be added as needed based on frontend filtering)
    List<Transaction> findByCategory(String category); // Will need to be findByUserIdAndCategory
    List<Transaction> findByType(String type); // Will need to be findByUserIdAndType
    List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate); // Will need to be findByUserIdAndDateBetween
    List<Transaction> findByDescriptionContainingIgnoreCase(String keyword); // Will need to be findByUserIdAndDescriptionContainingIgnoreCase

    // For calculating spent amount for a budget category within a month
    List<Transaction> findByCategoryAndTypeAndDateBetween(String category, String type, LocalDate startDate, LocalDate endDate); // Will need to be findByUserIdAndCategoryAndTypeAndDateBetween

    // For dashboard service (e.g., expense breakdown for a period)
    List<Transaction> findByTypeAndDateBetween(String type, LocalDate startDate, LocalDate endDate); // Will need to be findByUserIdAndTypeAndDateBetween


    // User-specific finders
    List<Transaction> findByUserId(Long userId);
    Optional<Transaction> findByIdAndUserId(Long id, Long userId);
    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndCategory(Long userId, String category);
    List<Transaction> findByUserIdAndType(Long userId, String type);
    List<Transaction> findByUserIdAndDescriptionContainingIgnoreCase(Long userId, String keyword);
    List<Transaction> findByUserIdAndCategoryAndTypeAndDateBetween(Long userId, String category, String type, LocalDate startDate, LocalDate endDate);
    List<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, String type, LocalDate startDate, LocalDate endDate);

}
