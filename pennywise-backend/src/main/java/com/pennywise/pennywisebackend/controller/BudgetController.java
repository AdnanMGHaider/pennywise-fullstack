package com.pennywise.pennywisebackend.controller;

import com.pennywise.pennywisebackend.dto.BudgetDTO;

import com.pennywise.pennywisebackend.model.Budget;
import com.pennywise.pennywisebackend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<BudgetDTO>> getAllBudgets(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        if (month != null) {
            return ResponseEntity.ok(budgetService.getBudgetsByMonth(month.atDay(1)));
        }
        return ResponseEntity.ok(budgetService.getAllBudgets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetDTO> getBudgetById(@PathVariable Long id) {
        return budgetService.getBudgetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category-month")
    public ResponseEntity<BudgetDTO> getBudgetByCategoryAndMonth(
            @RequestParam String category,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return budgetService.getBudgetByCategoryAndMonth(category, month.atDay(1))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Budget budget) {
        try {
            Budget createdBudget = budgetService.saveBudget(budget);
            BudgetDTO resultDTO = budgetService.getBudgetById(createdBudget.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to fetch created budget as DTO"));
            return ResponseEntity.status(HttpStatus.CREATED).body(resultDTO);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Budget budgetDetails) {
        try {
            Budget updatedBudget = budgetService.updateBudget(id, budgetDetails);
            BudgetDTO resultDTO = budgetService.getBudgetById(updatedBudget.getId())
                    .orElseThrow(() -> new RuntimeException("Failed to fetch updated budget as DTO"));
            return ResponseEntity.ok(resultDTO);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
