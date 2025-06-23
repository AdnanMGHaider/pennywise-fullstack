'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  DollarSign,
  TrendingUp,
  PieChart
} from 'lucide-react';
// import { mockTransactions, mockMonthlyData } from '@/data/mockData'; // Removed
import { useState, useEffect } from 'react'; // Added
import { toast } from 'sonner'; // Added for error handling
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"; // API URL

// Helper to get current month in YYYY-MM format
const getCurrentYearMonthString = () => new Date().toISOString().slice(0, 7);

export default function ReportsPage() {
  const { token } = useAuth();
  const [monthlyOverviewData, setMonthlyOverviewData] = useState({
    currentMonthYearString: "",
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    savingsRate: 0,
    // transactionsCount: 0, // Optional: if backend provides transaction count
  });
  const [topCategoriesData, setTopCategoriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })); // Will be set from API

  // Remove mock data calculations
  // const currentMonthTransactions = mockTransactions.filter(...);
  // const totalIncome = ...;
  // const totalExpenses = ...;
  // const netIncome = ...;
  // const savingsRate = ...;
  // const categoryBreakdown = ...;
  // const topCategories = ...;


  useEffect(() => {
    const fetchReportData = async () => {
      if (!token) return; // Wait for token to be available
      const authHeaders = { Authorization: `Bearer ${token}` };
      setIsLoading(true);
      try {
        const currentMonthParam = getCurrentYearMonthString(); // YYYY-MM

        // Fetch Current Month Overview
        const overviewRes = await fetch(`${API_URL}/dashboard/current-month-overview`, { headers: authHeaders });
        if (!overviewRes.ok) {
          const errorData = await overviewRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch monthly overview. Status: ${overviewRes.status}`);
        }
        const overviewData = await overviewRes.json();
        setMonthlyOverviewData(overviewData);

        // Fetch Top Spending Categories for the current month
        const categoriesRes = await fetch(`${API_URL}/dashboard/expense-breakdown?month=${currentMonthParam}`, { headers: authHeaders });
        if (!categoriesRes.ok) {
          const errorData = await categoriesRes.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch top spending categories. Status: ${categoriesRes.status}`);
        }
        let categoriesData = await categoriesRes.json();
        // Sort by amount descending and take top 5
        categoriesData = categoriesData
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5);
        setTopCategoriesData(categoriesData);

      } catch (error) {
        console.error("Failed to fetch report data:", error);
        toast.error(`Error fetching report data: ${error.message}`);
        // Set to default/empty states on error
        setMonthlyOverviewData({
            currentMonthYearString: "Error", totalIncome: 0, totalExpenses: 0,
            netIncome: 0, savingsRate: 0
        });
        setTopCategoriesData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [token]);


  const handleDownloadReport = (reportType) => {
    // Mock download functionality
    console.log(`Downloading ${reportType} report...`);
    alert(`${reportType} report download started! (This is a demo)`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const reportTypes = [
    {
      id: 'monthly',
      title: 'Monthly Financial Summary',
      description: 'Comprehensive overview of income, expenses, and savings',
      icon: BarChart3,
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'category',
      title: 'Category Breakdown Report',
      description: 'Detailed spending analysis by category',
      icon: PieChart,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 'trends',
      title: 'Spending Trends Analysis',
      description: 'Historical spending patterns and trends',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'yearly',
      title: 'Annual Financial Report',
      description: 'Year-to-date financial performance summary',
      icon: Calendar,
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Financial Reports</h1>
          <p className="text-gray-400">Generate and download detailed financial reports</p>
        </div>

        {/* Current Month Overview */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Current Month Overview - {monthlyOverviewData.currentMonthYearString || "Loading..."}</CardTitle>
              {/* Optional: Display transaction count if available from backend
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                {monthlyOverviewData.transactionsCount || 0} Transactions
              </Badge>
              */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-400">${(monthlyOverviewData.totalIncome || 0).toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-400">${(monthlyOverviewData.totalExpenses || 0).toLocaleString()}</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Net Income</p>
                <p className={`text-2xl font-bold ${(monthlyOverviewData.netIncome || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${(monthlyOverviewData.netIncome || 0).toLocaleString()}
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-400 text-sm mb-1">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-400">{(monthlyOverviewData.savingsRate || 0).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Spending Categories */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Top Spending Categories - {monthlyOverviewData.currentMonthYearString || "Current Month"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategoriesData.map((categoryItem, index) => {
                // Calculate percentage based on total expenses for the month from monthlyOverviewData
                const percentage = (monthlyOverviewData.totalExpenses || 0) > 0
                  ? (Math.abs(categoryItem.amount) / monthlyOverviewData.totalExpenses) * 100
                  : 0;
                return (
                  <div key={categoryItem.category} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{categoryItem.category}</p>
                        <p className="text-gray-400 text-sm">{percentage.toFixed(1)}% of total expenses</p>
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-white">${Math.abs(categoryItem.amount).toFixed(2)}</p>
                  </div>
                );
              })}
              
              {topCategoriesData.length === 0 && (
                <div className="text-center py-8">
                  <PieChart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No expense data available for this month</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Reports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 bg-gradient-to-r ${report.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{report.title}</CardTitle>
                        <p className="text-gray-400 text-sm mt-1">{report.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Generated on demand</span>
                    </div>
                    <Button
                      onClick={() => handleDownloadReport(report.title)}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report History (Mock) */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'December 2024 Monthly Report', date: '2025-01-01', size: '245 KB' },
                { name: 'Q4 2024 Quarterly Summary', date: '2024-12-31', size: '1.2 MB' },
                { name: 'November 2024 Monthly Report', date: '2024-12-01', size: '198 KB' }
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{report.name}</p>
                      <p className="text-gray-400 text-sm">Generated on {report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownloadReport(report.name)}
                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}