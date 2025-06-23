package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.model.Transaction;
import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.repository.TransactionRepository;
import com.pennywise.pennywisebackend.repository.UserRepository;
// Import DTOs
import com.pennywise.pennywisebackend.dto.DashboardSummaryDTO;
import com.pennywise.pennywisebackend.dto.ExpenseBreakdownDTO;
import com.pennywise.pennywisebackend.dto.MonthlyTrendDTO;
import com.pennywise.pennywisebackend.dto.MonthlyOverviewDTO;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // Dashboard services are typically read-only
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found in database. This should not happen if authenticated."));
    }

    public DashboardSummaryDTO getDashboardSummary(LocalDate upToDate) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        LocalDate startDate = LocalDate.of(1970, 1, 1); // Consider if this start date is always appropriate

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, upToDate);

        BigDecimal totalIncome = transactions.stream()
                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = transactions.stream()
                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount) // expenses are stored negative
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .abs(); // make it positive for summary display

        BigDecimal netWorth = totalIncome.subtract(totalExpenses);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            // Ensure netWorth is not negative for savings rate calculation if income is positive
            // Or clarify how savings rate is defined if netWorth is negative.
            // savingsRate = (netWorth.max(BigDecimal.ZERO)).divide(totalIncome, 4, BigDecimal.ROUND_HALF_UP)
            savingsRate = netWorth.divide(totalIncome, 4, RoundingMode.HALF_UP) // Retained original logic
                                  .multiply(new BigDecimal(100));
        }

        return new DashboardSummaryDTO(totalIncome, totalExpenses, netWorth, savingsRate);
    }

    public List<ExpenseBreakdownDTO> getExpenseBreakdown(LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        List<Transaction> expenseTransactions = transactionRepository.findByUserIdAndTypeAndDateBetween(userId, "expense", startDate, endDate);

        Map<String, BigDecimal> breakdownMap = expenseTransactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.mapping(Transaction::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        return breakdownMap.entrySet().stream()
                .map(entry -> new ExpenseBreakdownDTO(entry.getKey(), entry.getValue().abs())) // make amounts positive
                .collect(Collectors.toList());
    }

    public List<MonthlyTrendDTO> getSpendingTrends(int numberOfMonths) {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        List<MonthlyTrendDTO> trends = new ArrayList<>();
        YearMonth currentMonth = YearMonth.now();

        for (int i = 0; i < numberOfMonths; i++) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDate startDate = targetMonth.atDay(1);
            LocalDate endDate = targetMonth.atEndOfMonth();

            List<Transaction> monthTransactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

            BigDecimal income = monthTransactions.stream()
                    .filter(t -> "income".equalsIgnoreCase(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal expenses = monthTransactions.stream()
                    .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .abs(); // make positive

            // Using short month name e.g. "Jan", "Feb"
            trends.add(new MonthlyTrendDTO(targetMonth.getMonth().name().substring(0,3).toUpperCase(), income, expenses));
        }
        // Reverse to have oldest month first for chart
        return trends.stream().collect(Collectors.collectingAndThen(Collectors.toList(), lst -> {
            java.util.Collections.reverse(lst);
            return lst;
        }));
    }

    public MonthlyOverviewDTO getCurrentMonthOverview() {
        User currentUser = getCurrentUser();
        Long userId = currentUser.getId();
        YearMonth currentYearMonth = YearMonth.now();
        LocalDate startDate = currentYearMonth.atDay(1);
        LocalDate endDate = currentYearMonth.atEndOfMonth();

        List<Transaction> currentMonthTransactions = transactionRepository.findByUserIdAndDateBetween(userId, startDate, endDate);

        BigDecimal totalIncome = currentMonthTransactions.stream()
                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalExpenses = currentMonthTransactions.stream()
                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                .map(Transaction::getAmount) // expenses are stored negative
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .abs(); // make it positive for display

        BigDecimal netIncome = totalIncome.subtract(totalExpenses);

        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            // Savings Rate = (Net Income / Total Income) * 100
            savingsRate = netIncome.divide(totalIncome, 4, RoundingMode.HALF_UP)
                                   .multiply(new BigDecimal(100));
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
        String monthYearString = currentYearMonth.format(formatter);

        return new MonthlyOverviewDTO(monthYearString, totalIncome, totalExpenses, netIncome, savingsRate);
    }
}
