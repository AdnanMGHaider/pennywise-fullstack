package com.pennywise.pennywisebackend.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate; // Representing the first day of the budget month

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category; // Could be an entity later
    private BigDecimal budgetAmount;

    // spentAmount will be calculated dynamically, not stored directly in this
    // entity.
    // It can be a @Transient field populated by a service if needed.

    // private LocalDate month; // Represents the first day of the month (e.g.,
    // 2025-01-01 for Jan 2025)

    @Column(name = "month_date", nullable = false)
    private LocalDate month; // Represents the first day of the month

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Custom constructor if needed, for example, if spentAmount were to be included
    // public Budget(Long id, String category, BigDecimal budgetAmount, LocalDate
    // month) {
    // this.id = id;
    // this.category = category;
    // this.budgetAmount = budgetAmount;
    // this.month = month;
    // }
}
