package com.pennywise.pennywisebackend.controller;

import com.pennywise.pennywisebackend.model.Transaction;
import com.pennywise.pennywisebackend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow all origins for now, configure properly for prod
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<List<Transaction>> getAllTransactions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String descriptionKeyword,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        // Basic filtering logic, can be expanded in service layer
        if (category != null || type != null || descriptionKeyword != null || (startDate != null && endDate != null)) {
            return ResponseEntity.ok(transactionService.filterTransactions(category, type, descriptionKeyword, startDate, endDate));
        }
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getTransactionById(@PathVariable Long id) {
        return transactionService.getTransactionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@RequestBody Transaction transaction) {
        try {
            Transaction createdTransaction = transactionService.saveTransaction(transaction);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTransaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build(); // Or return error message
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @RequestBody Transaction transactionDetails) {
        try {
            Transaction updatedTransaction = transactionService.updateTransaction(id, transactionDetails);
            return ResponseEntity.ok(updatedTransaction);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build(); // Or return error message for other errors like IllegalArgumentException
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        try {
            transactionService.deleteTransaction(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            // Handle cases like transaction not found
            return ResponseEntity.notFound().build();
        }
    }
}
