package com.pennywise.pennywisebackend.controller;

import com.pennywise.pennywisebackend.model.FinancialGoal;
import com.pennywise.pennywisebackend.service.FinancialGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FinancialGoalController {

    private final FinancialGoalService financialGoalService;

    @GetMapping
    public ResponseEntity<List<FinancialGoal>> getAllFinancialGoals() {
        return ResponseEntity.ok(financialGoalService.getAllFinancialGoals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FinancialGoal> getFinancialGoalById(@PathVariable Long id) {
        return financialGoalService.getFinancialGoalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<FinancialGoal> createFinancialGoal(@RequestBody FinancialGoal financialGoal) {
        FinancialGoal createdGoal = financialGoalService.saveFinancialGoal(financialGoal);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdGoal);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FinancialGoal> updateFinancialGoal(@PathVariable Long id,
            @RequestBody FinancialGoal goalDetails) {
        try {
            FinancialGoal updatedGoal = financialGoalService.updateFinancialGoal(id, goalDetails);
            return ResponseEntity.ok(updatedGoal);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinancialGoal(@PathVariable Long id) {
        try {
            financialGoalService.deleteFinancialGoal(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
