'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  PiggyBank, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
// import { mockBudgets as initialBudgets, categories as initialCategories } from '@/data/mockData'; // Remove mock
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function BudgetsPage() {
  const { token } = useAuth();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const [budgets, setBudgets] = useState([]); // Will hold BudgetDTO from backend
  const [allCategories, setAllCategories] = useState([]); // For dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null); // Will hold BudgetDTO

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    budgetAmount: '',
    month: new Date().toISOString().slice(0, 7) // YYYY-MM format, e.g., "2024-07"
  });

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [budgetsRes, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/budgets`, { headers: authHeaders }), // Fetches BudgetDTOs
          fetch(`${API_URL}/categories`, { headers: authHeaders })
        ]);

        if (!budgetsRes.ok) throw new Error('Failed to fetch budgets');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');

        const budgetsData = await budgetsRes.json();
        const categoriesData = await categoriesRes.json();

        setBudgets(budgetsData);
        setAllCategories(categoriesData.map(c => c.name).filter(name => name !== "Income")); // Filter out "Income" for budget categories

      } catch (error) {
        toast.error(`Error fetching data: ${error.message}`);
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);


  const handleAddBudget = async () => {
    if (!formData.category || !formData.budgetAmount || !formData.month) {
      toast.error('Please fill in all fields');
      return;
    }

    const budgetData = {
      category: formData.category,
      budgetAmount: parseFloat(formData.budgetAmount),
      month: `${formData.month}-01` // Convert YYYY-MM to YYYY-MM-DD (first day)
    };

    try {
      const response = await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(budgetData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add budget');
      }
      const newBudgetDTO = await response.json();
      setBudgets([...budgets, newBudgetDTO]);
      setFormData({ category: '', budgetAmount: '', month: new Date().toISOString().slice(0, 7) });
      setIsAddModalOpen(false);
      toast.success('Budget added successfully');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Add budget error:", error);
    }
  };

  const handleEditBudget = async () => {
    if (!formData.category || !formData.budgetAmount || !formData.month || !editingBudget) {
      toast.error('Please fill in all fields or select a budget to edit');
      return;
    }

    const budgetData = {
      category: formData.category,
      budgetAmount: parseFloat(formData.budgetAmount),
      month: `${formData.month}-01` // Convert YYYY-MM to YYYY-MM-DD
    };

    try {
      const response = await fetch(`${API_URL}/budgets/${editingBudget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(budgetData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update budget');
      }
      const updatedBudgetDTO = await response.json();
      setBudgets(budgets.map(b => (b.id === editingBudget.id ? updatedBudgetDTO : b)));
      setIsEditModalOpen(false);
      setEditingBudget(null);
      toast.success('Budget updated successfully');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Update budget error:", error);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      const response = await fetch(`${API_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) {
        let errorMessage = `Failed to delete budget. Status: ${response.status}`;
        try { const errorData = await response.json(); errorMessage = errorData.message || errorMessage; }
        catch (e) { /* Ignore if no JSON body */ }
        throw new Error(errorMessage);
      }
      setBudgets(budgets.filter(b => b.id !== id));
      toast.success('Budget deleted successfully');
    } catch (error) {
      toast.error(`Error: ${error.message}`);
      console.error("Delete budget error:", error);
    }
  };

  const openEditModal = (budget) => { // budget is BudgetDTO from backend
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      budgetAmount: budget.budgetAmount.toString(),
      // budget.month is YYYY-MM-DD from backend, convert to YYYY-MM for input type="month"
      month: budget.month.slice(0, 7)
    });
    setIsEditModalOpen(true);
  };

  const getSpentPercentage = (spent, budget) => {
    return (spent / budget) * 100;
  };

  const getBudgetStatus = (spent, budget) => {
    const percentage = getSpentPercentage(spent, budget);
    if (percentage >= 100) return 'over';
    if (percentage >= 80) return 'warning';
    return 'good';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'over': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'over': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Budget Management</h1>
            <p className="text-gray-400">Track your spending against your monthly budgets</p>
          </div>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 glow-effect">
                <Plus className="w-4 h-4 mr-2" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Budget</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category" className="text-gray-300">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {allCategories.map(categoryName => (
                        <SelectItem key={categoryName} value={categoryName} className="text-white">
                          {categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="budgetAmount" className="text-gray-300">Budget Amount</Label>
                  <Input
                    id="budgetAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="month" className="text-gray-300">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <Button onClick={handleAddBudget} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  Add Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Budget</p>
                  <p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-white">${totalSpent.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Remaining</p>
                  <p className="text-2xl font-bold text-green-400">${(totalBudget - totalSpent).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card className="glass-morphism border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Overall Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Progress</span>
                <span className={`font-semibold ${getStatusColor(getBudgetStatus(totalSpent, totalBudget))}`}>
                  {overallPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(overallPercentage, 100)} 
                className="h-3 bg-gray-700"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>${totalSpent.toLocaleString()} spent</span>
                <span>${totalBudget.toLocaleString()} budgeted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const spentPercentage = getSpentPercentage(budget.spentAmount, budget.budgetAmount);
            const status = getBudgetStatus(budget.spentAmount, budget.budgetAmount);
            const remaining = budget.budgetAmount - budget.spentAmount;
            
            return (
              <Card key={budget.id} className="glass-morphism border-gray-700 hover:glow-effect transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-lg mb-2">{budget.category}</CardTitle>
                      <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                        {new Date(budget.month + '-01').toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {status === 'over' && (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(budget)}
                        className="text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">Spent</span>
                      <span className={`font-semibold ${getStatusColor(status)}`}>
                        {spentPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(spentPercentage, 100)} 
                      className="h-2 bg-gray-700"
                    />
                  </div>
                  
                  {/* Amounts */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Spent</span>
                      <span className="text-white font-semibold">
                        ${budget.spentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Budget</span>
                      <span className="text-white font-semibold">
                        ${budget.budgetAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                      <span className="text-gray-400 text-sm">Remaining</span>
                      <span className={`font-semibold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${Math.abs(remaining).toLocaleString()}
                        {remaining < 0 && ' over'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Status Message */}
                  {status === 'over' && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-red-400 text-sm font-medium">Budget Exceeded</p>
                      <p className="text-red-300 text-xs">Consider adjusting your spending or budget amount</p>
                    </div>
                  )}
                  
                  {status === 'warning' && (
                    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                      <p className="text-yellow-400 text-sm font-medium">Approaching Budget Limit</p>
                      <p className="text-yellow-300 text-xs">You've used 80% of your budget</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {budgets.length === 0 && (
          <Card className="glass-morphism border-gray-700">
            <CardContent className="text-center py-16">
              <PiggyBank className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Budgets Yet</h3>
              <p className="text-gray-400 mb-6">Create your first budget to start tracking your spending</p>
              <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Budget
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="glass-morphism border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-category" className="text-gray-300">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                      {allCategories.map(categoryName => (
                        <SelectItem key={categoryName} value={categoryName} className="text-white">
                          {categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-budgetAmount" className="text-gray-300">Budget Amount</Label>
                <Input
                  id="edit-budgetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-month" className="text-gray-300">Month</Label>
                <Input
                  id="edit-month"
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <Button onClick={handleEditBudget} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                Update Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}