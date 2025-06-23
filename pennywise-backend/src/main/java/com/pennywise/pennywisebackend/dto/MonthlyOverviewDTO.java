package com.pennywise.pennywisebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyOverviewDTO {
    private String currentMonthYearString; // e.g., "July 2024"
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netIncome;
    private BigDecimal savingsRate; // As a percentage, e.g., 15.5 for 15.5%
}
