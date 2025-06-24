package com.pennywise.pennywisebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private BigDecimal totalIncome;
    private BigDecimal totalExpenses;
    private BigDecimal netWorth;
    private BigDecimal savingsRate;
    private BigDecimal netWorthChangePercentage;

    private BigDecimal monthlyIncomeChangePercentage;
    private BigDecimal monthlyExpensesChangePercentage;
    private BigDecimal savingsRateChangePercentage;

    private Integer aiGenerationsLeft;
}
