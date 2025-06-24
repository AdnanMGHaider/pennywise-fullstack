package com.pennywise.pennywisebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {
    private Long id;
    private String category;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private LocalDate month;
}
