package com.pennywise.pennywisebackend.service;

import com.pennywise.pennywisebackend.model.Transaction;
import com.pennywise.pennywisebackend.model.User;
import com.pennywise.pennywisebackend.repository.TransactionRepository;
import com.pennywise.pennywisebackend.repository.UserRepository;
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
@Transactional(readOnly = true)
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
                                .orElseThrow(() -> new RuntimeException(
                                                "User not found in database. This should not happen if authenticated."));
        }

        public DashboardSummaryDTO getDashboardSummary(LocalDate reportDate) {
                User currentUser = getCurrentUser();
                Long userId = currentUser.getId();

                YearMonth currentYearMonth = YearMonth.from(reportDate);
                YearMonth previousYearMonth = currentYearMonth.minusMonths(1);

                LocalDate currentMonthStartDate = currentYearMonth.atDay(1);
                LocalDate currentMonthEndDate = currentYearMonth.atEndOfMonth();
                LocalDate previousMonthEndDate = previousYearMonth.atEndOfMonth();
                LocalDate veryStartDate = LocalDate.of(1970, 1, 1);

                List<Transaction> currentMonthTransactions = transactionRepository.findByUserIdAndDateBetween(userId,
                                currentMonthStartDate, currentMonthEndDate);

                BigDecimal monthlyIncome = currentMonthTransactions.stream()
                                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal monthlyExpenses = currentMonthTransactions.stream()
                                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .abs();

                List<Transaction> allTransactionsUpToReportDate = transactionRepository
                                .findByUserIdAndDateBetween(userId, veryStartDate, reportDate);
                BigDecimal lifetimeIncome = allTransactionsUpToReportDate.stream()
                                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal lifetimeExpenses = allTransactionsUpToReportDate.stream()
                                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .abs();
                BigDecimal lifetimeNetWorth = lifetimeIncome.subtract(lifetimeExpenses);

                List<Transaction> allTransactionsUpToCurrentMonthEnd = transactionRepository
                                .findByUserIdAndDateBetween(userId, veryStartDate, currentMonthEndDate);
                BigDecimal netWorthCurrentMonthEnd = allTransactionsUpToCurrentMonthEnd.stream()
                                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .subtract(allTransactionsUpToCurrentMonthEnd.stream()
                                                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                                .map(Transaction::getAmount)
                                                .reduce(BigDecimal.ZERO, BigDecimal::add).abs());

                BigDecimal netWorthPreviousMonthEnd = BigDecimal.ZERO;
                if (reportDate.isAfter(previousMonthEndDate) || reportDate.isEqual(previousMonthEndDate)) {
                        List<Transaction> allTransactionsUpToPreviousMonthEnd = transactionRepository
                                        .findByUserIdAndDateBetween(userId, veryStartDate, previousMonthEndDate);
                        netWorthPreviousMonthEnd = allTransactionsUpToPreviousMonthEnd.stream()
                                        .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                        .map(Transaction::getAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .subtract(allTransactionsUpToPreviousMonthEnd.stream()
                                                        .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                                        .map(Transaction::getAmount)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add).abs());
                }

                BigDecimal netWorthChangePercentage = BigDecimal.ZERO;
                if (netWorthPreviousMonthEnd.compareTo(BigDecimal.ZERO) != 0) {
                        BigDecimal change = netWorthCurrentMonthEnd.subtract(netWorthPreviousMonthEnd);
                        netWorthChangePercentage = change.divide(netWorthPreviousMonthEnd, 4, RoundingMode.HALF_UP)
                                        .multiply(new BigDecimal(100));
                } else if (netWorthCurrentMonthEnd.compareTo(BigDecimal.ZERO) > 0) {
                        netWorthChangePercentage = new BigDecimal(100);
                }

                BigDecimal monthlySavingsRate = BigDecimal.ZERO;
                if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal netMonthlySavings = monthlyIncome.subtract(monthlyExpenses);
                        monthlySavingsRate = netMonthlySavings.divide(monthlyIncome, 4, RoundingMode.HALF_UP)
                                        .multiply(new BigDecimal(100));
                }

                LocalDate previousMonthStartDate = previousYearMonth.atDay(1);

                List<Transaction> previousMonthTransactions = transactionRepository.findByUserIdAndDateBetween(userId,
                                previousMonthStartDate, previousMonthEndDate);

                BigDecimal previousMonthIncome = previousMonthTransactions.stream()
                                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal previousMonthExpenses = previousMonthTransactions.stream()
                                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .abs();

                BigDecimal previousMonthSavingsRate = BigDecimal.ZERO;
                if (previousMonthIncome.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal netPreviousMonthSavings = previousMonthIncome.subtract(previousMonthExpenses);
                        previousMonthSavingsRate = netPreviousMonthSavings
                                        .divide(previousMonthIncome, 4, RoundingMode.HALF_UP)
                                        .multiply(new BigDecimal(100));
                }

                BigDecimal monthlyIncomeChangePercentage = calculatePercentageChange(monthlyIncome,
                                previousMonthIncome);
                BigDecimal monthlyExpensesChangePercentage = calculatePercentageChange(monthlyExpenses,
                                previousMonthExpenses);
                BigDecimal savingsRateChangePercentage = calculatePercentageChange(monthlySavingsRate,
                                previousMonthSavingsRate);

                return new DashboardSummaryDTO(
                                monthlyIncome,
                                monthlyExpenses,
                                lifetimeNetWorth,
                                monthlySavingsRate,
                                netWorthChangePercentage,
                                monthlyIncomeChangePercentage,
                                monthlyExpensesChangePercentage,
                                savingsRateChangePercentage,
                                (3 - (currentUser.getAiAdviceCount() == null ? 0 : currentUser.getAiAdviceCount())));
        }

        private BigDecimal calculatePercentageChange(BigDecimal currentValue, BigDecimal previousValue) {
                if (previousValue == null || previousValue.compareTo(BigDecimal.ZERO) == 0) {
                        if (currentValue.compareTo(BigDecimal.ZERO) == 0)
                                return BigDecimal.ZERO;
                        return currentValue.compareTo(BigDecimal.ZERO) > 0 ? new BigDecimal(100) : new BigDecimal(-100);
                }
                BigDecimal change = currentValue.subtract(previousValue);
                return change.divide(previousValue.abs(), 4, RoundingMode.HALF_UP)
                                .multiply(new BigDecimal(100));
        }

        public List<ExpenseBreakdownDTO> getExpenseBreakdown(LocalDate startDate, LocalDate endDate) {
                User currentUser = getCurrentUser();
                Long userId = currentUser.getId();
                List<Transaction> expenseTransactions = transactionRepository.findByUserIdAndTypeAndDateBetween(userId,
                                "expense", startDate, endDate);

                Map<String, BigDecimal> breakdownMap = expenseTransactions.stream()
                                .collect(Collectors.groupingBy(
                                                Transaction::getCategory,
                                                Collectors.mapping(Transaction::getAmount, Collectors
                                                                .reducing(BigDecimal.ZERO, BigDecimal::add))));

                return breakdownMap.entrySet().stream()
                                .map(entry -> new ExpenseBreakdownDTO(entry.getKey(), entry.getValue().abs()))
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

                        List<Transaction> monthTransactions = transactionRepository.findByUserIdAndDateBetween(userId,
                                        startDate, endDate);

                        BigDecimal income = monthTransactions.stream()
                                        .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                        .map(Transaction::getAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                        BigDecimal expenses = monthTransactions.stream()
                                        .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                        .map(Transaction::getAmount)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                                        .abs();

                        trends.add(new MonthlyTrendDTO(targetMonth.getMonth().name().substring(0, 3).toUpperCase(),
                                        income, expenses));
                }
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

                List<Transaction> currentMonthTransactions = transactionRepository.findByUserIdAndDateBetween(userId,
                                startDate, endDate);

                BigDecimal totalIncome = currentMonthTransactions.stream()
                                .filter(t -> "income".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalExpenses = currentMonthTransactions.stream()
                                .filter(t -> "expense".equalsIgnoreCase(t.getType()))
                                .map(Transaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add)
                                .abs();

                BigDecimal netIncome = totalIncome.subtract(totalExpenses);

                BigDecimal savingsRate = BigDecimal.ZERO;
                if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
                        savingsRate = netIncome.divide(totalIncome, 4, RoundingMode.HALF_UP)
                                        .multiply(new BigDecimal(100));
                }

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM yyyy");
                String monthYearString = currentYearMonth.format(formatter);

                return new MonthlyOverviewDTO(monthYearString, totalIncome, totalExpenses, netIncome, savingsRate);
        }
}
