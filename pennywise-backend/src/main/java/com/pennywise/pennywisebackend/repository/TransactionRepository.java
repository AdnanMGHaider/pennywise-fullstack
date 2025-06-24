package com.pennywise.pennywisebackend.repository;

import com.pennywise.pennywisebackend.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByCategory(String category);

    List<Transaction> findByType(String type);

    List<Transaction> findByDateBetween(LocalDate startDate, LocalDate endDate);

    List<Transaction> findByDescriptionContainingIgnoreCase(String keyword);

    List<Transaction> findByCategoryAndTypeAndDateBetween(String category, String type, LocalDate startDate,
            LocalDate endDate);

    List<Transaction> findByTypeAndDateBetween(String type, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserId(Long userId);

    Optional<Transaction> findByIdAndUserId(Long id, Long userId);

    List<Transaction> findByUserIdAndDateBetween(Long userId, LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserIdAndCategory(Long userId, String category);

    List<Transaction> findByUserIdAndType(Long userId, String type);

    List<Transaction> findByUserIdAndDescriptionContainingIgnoreCase(Long userId, String keyword);

    List<Transaction> findByUserIdAndCategoryAndTypeAndDateBetween(Long userId, String category, String type,
            LocalDate startDate, LocalDate endDate);

    List<Transaction> findByUserIdAndTypeAndDateBetween(Long userId, String type, LocalDate startDate,
            LocalDate endDate);

}
