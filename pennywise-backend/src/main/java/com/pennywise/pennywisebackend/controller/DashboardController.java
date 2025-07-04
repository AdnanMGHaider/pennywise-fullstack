package com.pennywise.pennywisebackend.controller;

import com.pennywise.pennywisebackend.dto.DashboardSummaryDTO;
import com.pennywise.pennywisebackend.dto.ExpenseBreakdownDTO;
import com.pennywise.pennywisebackend.dto.MonthlyTrendDTO;
import com.pennywise.pennywisebackend.dto.MonthlyOverviewDTO;
import com.pennywise.pennywisebackend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate upToDate) {
        LocalDate effectiveDate = (upToDate == null) ? LocalDate.now() : upToDate;
        return ResponseEntity.ok(dashboardService.getDashboardSummary(effectiveDate));
    }

    @GetMapping("/expense-breakdown")
    public ResponseEntity<List<ExpenseBreakdownDTO>> getExpenseBreakdown(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        LocalDate startDate = month.atDay(1);
        LocalDate endDate = month.atEndOfMonth();
        return ResponseEntity.ok(dashboardService.getExpenseBreakdown(startDate, endDate));
    }

    @GetMapping("/spending-trends")
    public ResponseEntity<List<MonthlyTrendDTO>> getSpendingTrends(
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(dashboardService.getSpendingTrends(months));
    }

    @GetMapping("/current-month-overview")
    public ResponseEntity<MonthlyOverviewDTO> getCurrentMonthOverview() {
        return ResponseEntity.ok(dashboardService.getCurrentMonthOverview());
    }
}
