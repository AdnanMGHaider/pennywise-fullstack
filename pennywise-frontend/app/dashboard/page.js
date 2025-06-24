"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress"; // Removed unused import
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
// import { mockTransactions, mockMonthlyData, aiAdviceTemplates } from '@/data/mockData'; // No longer needed for AI advice
import { useRefresh } from "@/contexts/RefreshContext"; // Import useRefresh
import { useAuth } from "@/contexts/AuthContext";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
// Helper to get current month in YYYY-MM format
const getCurrentYearMonth = () => new Date().toISOString().slice(0, 7);

export default function DashboardPage() {
  const [dashboardSummary, setDashboardSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    savingsRate: 0,
    netWorthChangePercentage: 0,
    monthlyIncomeChangePercentage: 0,
    monthlyExpensesChangePercentage: 0,
    savingsRateChangePercentage: 0,
  });
  const [expenseBreakdownData, setExpenseBreakdownData] = useState({
    labels: [],
    datasets: [],
  });
  const [spendingTrendsData, setSpendingTrendsData] = useState({
    labels: [],
    datasets: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [aiAdvice, setAiAdvice] = useState("");
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [adviceGenerationsLeft, setAdviceGenerationsLeft] = useState(3); // Initial assumption
  const [aiMessage, setAiMessage] = useState("You can generate AI financial advice up to 3 times in this demo."); // Initial message

  const { refreshKey } = useRefresh(); // Get refreshKey from context
  const { token, logout: authLogout } = useAuth(); // Destructure logout as authLogout to avoid naming conflict if any

  useEffect(() => {
    // Sync adviceGenerationsLeft when dashboardSummary.aiGenerationsLeft is available
    if (typeof dashboardSummary.aiGenerationsLeft === 'number') {
      setAdviceGenerationsLeft(dashboardSummary.aiGenerationsLeft);
      if (dashboardSummary.aiGenerationsLeft <= 0) {
        setAiMessage("You've used all your AI advice generations for this demo.");
        setAiAdvice("");
      } else if (aiMessage === "You've used all your AI advice generations for this demo." && dashboardSummary.aiGenerationsLeft > 0) {
        // If summary reloads and shows generations are available again (e.g. admin reset), clear the "no generations left" message
        setAiMessage("You can generate AI financial advice up to 3 times in this demo.");
      }
    }
  }, [dashboardSummary.aiGenerationsLeft]);


  // Updated generateAIAdvice function will be here later
  async function generateAIAdvice() {
    if (adviceGenerationsLeft <= 0) {
      setAiMessage("You've used all your AI advice generations for this demo.");
      setAiAdvice(""); // Clear any previous advice
      return;
    }

    setIsGeneratingAdvice(true);
    setAiAdvice(""); // Clear previous advice
    setAiMessage(""); // Clear previous messages

    try {
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/dashboard/ai-advice`, {
        method: 'POST',
        headers: authHeaders,
      });

      if (!response.ok) {
        // Try to parse error from backend
        const errorData = await response.json().catch(() => ({ message: "Failed to generate advice. Please try again." }));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json(); // Expected: { advice?: string, error?: string, generationsLeft: number }

      if (data.error) {
        setAiMessage(data.error);
        setAiAdvice("");
      } else if (data.advice) {
        setAiAdvice(data.advice);
        setAiMessage(""); // Clear messages if advice is shown
      }

      if (typeof data.generationsLeft === 'number') {
        setAdviceGenerationsLeft(data.generationsLeft);
        if (data.generationsLeft <= 0) {
          setAiMessage("You've used all your AI advice generations for this demo.");
        }
      }

    } catch (error) {
      console.error("Error generating AI advice:", error);
      setAiMessage(error.message || "An unexpected error occurred while generating advice.");
      setAiAdvice("");
    } finally {
      setIsGeneratingAdvice(false);
    }
  }


  useEffect(() => {
    if (!token) return;
    const fetchDashboardData = async () => {
      setIsLoading(true);
      console.log("Dashboard fetching data due to refreshKey change:", refreshKey); // For debugging
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        const responses = await Promise.all([
          fetch(`${API_URL}/dashboard/summary`, { headers: authHeaders }),
          fetch(`${API_URL}/dashboard/expense-breakdown?month=${getCurrentYearMonth()}`, { headers: authHeaders }),
          fetch(`${API_URL}/dashboard/spending-trends?months=6`, { headers: authHeaders })
        ]);

        const [summaryRes, expenseBreakdownRes, spendingTrendsRes] = responses;

        if (summaryRes.status === 401 || summaryRes.status === 403 ||
            expenseBreakdownRes.status === 401 || expenseBreakdownRes.status === 403 ||
            spendingTrendsRes.status === 401 || spendingTrendsRes.status === 403) {
          console.error("Auth error fetching dashboard data, logging out.");
          authLogout();
          // No need to throw another error here, logout will redirect.
          // setLoading(false) will be handled in finally.
          return; // Exit early
        }

        if (!summaryRes.ok) throw new Error(`Failed to fetch dashboard summary (Status: ${summaryRes.status})`);
        if (!expenseBreakdownRes.ok) throw new Error(`Failed to fetch expense breakdown (Status: ${expenseBreakdownRes.status})`);
        if (!spendingTrendsRes.ok) throw new Error(`Failed to fetch spending trends (Status: ${spendingTrendsRes.status})`);

        const summaryData = await summaryRes.json();
        const breakdownData = await expenseBreakdownRes.json(); // Expected: [{ category: "Food", amount: 100 }, ...]
        const trendsData = await spendingTrendsRes.json(); // Expected: [{ month: "Jan", income: 1000, expenses: 500 }, ...]

        setDashboardSummary(summaryData);

        // Prepare doughnut chart data
        setExpenseBreakdownData({
          labels: breakdownData.map((item) => item.category),
          datasets: [
            {
              data: breakdownData.map((item) => item.amount),
              backgroundColor: [
                "#00ff88",
                "#8b5cf6",
                "#3b82f6",
                "#f59e0b",
                "#ef4444",
                "#10b981",
                "#f97316",
                "#8b5cf6",
              ],
              borderWidth: 0,
            },
          ],
        });

        // Prepare line chart data
        setSpendingTrendsData({
          labels: trendsData.map((d) => d.month),
          datasets: [
            {
              label: "Income",
              data: trendsData.map((d) => d.income),
              borderColor: "#00ff88",
              backgroundColor: "rgba(0, 255, 136, 0.1)",
              tension: 0.4,
            },
            {
              label: "Expenses",
              data: trendsData.map((d) => d.expenses),
              borderColor: "#ef4444",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Consider setting some error state or showing a toast
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey, token]); // Add refreshKey to dependency array

  // REMOVE MOCK DATA BASED CALCULATIONS
  // const totalIncome = mockTransactions ...
  // const totalExpenses = Math.abs(mockTransactions ...
  // const netWorth = totalIncome - totalExpenses;
  // const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100);

  // const expenseCategories = {};
  // mockTransactions ...
  //   expenseCategories[t.category] = (expenseCategories[t.category] || 0) + Math.abs(t.amount);
  // });

  // const doughnutData = expenseBreakdownData; // Use state directly - This was changed to expenseBreakdownChartData
  // The old mock-data based "expenseCategories" is no longer available.
  // The structure of expenseBreakdownChartData is already correct for the chart.
  // So, this old doughnutData constant should be removed.

  const doughnutOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#ffffff",
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "#1f1f1f",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#00ff88",
        borderWidth: 1,
      },
    },
    maintainAspectRatio: false,
  };

  // const lineData = { ... } // This is now replaced by spendingTrendsChartData state
  // So, this old lineData constant should be removed.

  const lineOptions = {
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
      },
      tooltip: {
        backgroundColor: "#1f1f1f",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#00ff88",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "#374151",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "#374151",
        },
      },
    },
    maintainAspectRatio: false,
  };

  // AI Advice functionality is removed as it's not backend-connected and mock templates were removed.
  // const generateAIAdvice = () => { ... };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Net Worth</p>
                  <p className="text-2xl font-bold text-white">
                    ${(dashboardSummary.netWorth || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    {dashboardSummary.netWorthChangePercentage >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`${dashboardSummary.netWorthChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'} ml-1`}>
                      {dashboardSummary.netWorthChangePercentage >= 0 ? '+' : ''}
                      {(dashboardSummary.netWorthChangePercentage || 0).toFixed(1)}% MoM
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* This is the main MoM display for Net Worth, already dynamic */}
              {/* The smaller percentage below card was a dummy, now removed as primary MoM is above */}
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Monthly Income</p>
                  <p className="text-2xl font-bold text-white">
                    ${(dashboardSummary.totalIncome || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-400 mt-2">
                {dashboardSummary.monthlyIncomeChangePercentage >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`${dashboardSummary.monthlyIncomeChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'} ml-1`}>
                  {dashboardSummary.monthlyIncomeChangePercentage >= 0 ? '+' : ''}
                  {(dashboardSummary.monthlyIncomeChangePercentage || 0).toFixed(1)}% MoM
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Monthly Expenses</p>
                  <p className="text-2xl font-bold text-white">
                    ${(dashboardSummary.totalExpenses || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-400 mt-2">
                {/* For expenses, a positive change (increase) is usually bad (red), negative change (decrease) is good (green) */}
                {dashboardSummary.monthlyExpensesChangePercentage > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-green-500" />
                )}
                <span className={`${dashboardSummary.monthlyExpensesChangePercentage > 0 ? 'text-red-500' : 'text-green-500'} ml-1`}>
                  {dashboardSummary.monthlyExpensesChangePercentage > 0 ? '+' : ''}
                  {/* We show the actual percentage. If it's -5%, it means expenses decreased by 5% (good) */}
                  {(dashboardSummary.monthlyExpensesChangePercentage || 0).toFixed(1)}% MoM
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Savings Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {(dashboardSummary.savingsRate || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs text-gray-400 mt-2">
                {dashboardSummary.savingsRateChangePercentage >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`${dashboardSummary.savingsRateChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'} ml-1`}>
                  {dashboardSummary.savingsRateChangePercentage >= 0 ? '+' : ''}
                  {(dashboardSummary.savingsRateChangePercentage || 0).toFixed(1)}% MoM
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <Card className="glass-morphism border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                {expenseBreakdownData.labels &&
                expenseBreakdownData.labels.length > 0 ? (
                  <Doughnut
                    data={expenseBreakdownData}
                    options={doughnutOptions}
                  />
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No expense data for this month.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Spending Trends */}
          <Card className="glass-morphism border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-container">
                {spendingTrendsData.labels &&
                spendingTrendsData.labels.length > 0 ? (
                  <Line data={spendingTrendsData} options={lineOptions} />
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No spending trend data available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Financial Advice Panel */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <CardTitle className="text-white">AI Financial Advice</CardTitle>
              </div>
              <Button
                onClick={generateAIAdvice}
                disabled={isGeneratingAdvice || adviceGenerationsLeft <= 0}
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingAdvice ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Advice"
                )}
              </Button>
            </div>
            {adviceGenerationsLeft > 0 && !isGeneratingAdvice && (
              <p className="text-xs text-gray-400 text-right mt-1 pr-6">
                {adviceGenerationsLeft} generation{adviceGenerationsLeft === 1 ? '' : 's'} left
              </p>
            )}
             {(adviceGenerationsLeft <= 0 && !isGeneratingAdvice) && (
              <p className="text-xs text-red-400 text-right mt-1 pr-6">
                No generations left
              </p>
            )}
          </CardHeader>
          <CardContent>
            {aiAdvice ? (
              <div className="p-4 bg-gradient-to-r from-purple-500/10 to-violet-600/10 rounded-lg border border-purple-500/20">
                <p className="text-gray-200 whitespace-pre-line">{aiAdvice}</p> {/* Added whitespace-pre-line */}
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {aiMessage || "Click \"Generate Advice\" to get personalized financial recommendations using AI."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
