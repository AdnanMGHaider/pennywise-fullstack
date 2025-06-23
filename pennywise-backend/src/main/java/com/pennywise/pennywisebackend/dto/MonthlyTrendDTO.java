
package com.pennywise.pennywisebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// Grouping dashboard DTOs in one file for convenience, or they can be separate files.

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDTO {
    private String month; // e.g., "Jan", "Feb" or "YYYY-MM"
    private BigDecimal income;
    private BigDecimal expenses;
}
