// Mock data for the application
export const mockTransactions = [
  {
    id: '1',
    date: '2025-01-15',
    description: 'Grocery Shopping',
    category: 'Food',
    amount: -85.32,
    type: 'expense'
  },
  {
    id: '2',
    date: '2025-01-14',
    description: 'Salary',
    category: 'Income',
    amount: 3500.00,
    type: 'income'
  },
  {
    id: '3',
    date: '2025-01-13',
    description: 'Coffee Shop',
    category: 'Food',
    amount: -12.50,
    type: 'expense'
  },
  {
    id: '4',
    date: '2025-01-12',
    description: 'Gas Station',
    category: 'Transportation',
    amount: -65.00,
    type: 'expense'
  },
  {
    id: '5',
    date: '2025-01-11',
    description: 'Netflix Subscription',
    category: 'Entertainment',
    amount: -15.99,
    type: 'expense'
  },
  {
    id: '6',
    date: '2025-01-10',
    description: 'Freelance Work',
    category: 'Income',
    amount: 450.00,
    type: 'income'
  },
  {
    id: '7',
    date: '2025-01-09',
    description: 'Rent Payment',
    category: 'Housing',
    amount: -1200.00,
    type: 'expense'
  },
  {
    id: '8',
    date: '2025-01-08',
    description: 'Online Shopping',
    category: 'Shopping',
    amount: -89.99,
    type: 'expense'
  }
];

export const mockGoals = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: '2025-12-31',
    category: 'Savings'
  },
  {
    id: '2',
    title: 'Vacation Fund',
    targetAmount: 3000,
    currentAmount: 1250,
    deadline: '2025-08-15',
    category: 'Travel'
  },
  {
    id: '3',
    title: 'New Laptop',
    targetAmount: 1500,
    currentAmount: 800,
    deadline: '2025-06-01',
    category: 'Technology'
  }
];

export const mockBudgets = [
  {
    id: '1',
    category: 'Food',
    budgetAmount: 400,
    spentAmount: 285.32,
    month: '2025-01'
  },
  {
    id: '2',
    category: 'Transportation',
    budgetAmount: 200,
    spentAmount: 165.00,
    month: '2025-01'
  },
  {
    id: '3',
    category: 'Entertainment',
    budgetAmount: 100,
    spentAmount: 45.99,
    month: '2025-01'
  },
  {
    id: '4',
    category: 'Shopping',
    budgetAmount: 300,
    spentAmount: 289.99,
    month: '2025-01'
  },
  {
    id: '5',
    category: 'Housing',
    budgetAmount: 1200,
    spentAmount: 1200.00,
    month: '2025-01'
  }
];

export const mockMonthlyData = [
  { month: 'Sep', income: 3500, expenses: 2800 },
  { month: 'Oct', income: 3500, expenses: 3100 },
  { month: 'Nov', income: 4000, expenses: 2900 },
  { month: 'Dec', income: 3500, expenses: 3200 },
  { month: 'Jan', income: 3950, expenses: 2650 }
];

export const categories = [
  'Food',
  'Transportation',
  'Housing',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Bills',
  'Income',
  'Other'
];

export const aiAdviceTemplates = [
  "Based on your spending patterns, you could save $120/month by reducing takeout orders and cooking more meals at home.",
  "Your entertainment budget is well-managed! Consider allocating the surplus $54 to your emergency fund.",
  "You're spending 32% of your income on housing, which is excellent. Financial experts recommend keeping it under 30%.",
  "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. You're currently at 55/25/20 - consider adjusting.",
  "Your grocery spending has increased by 15% this month. Consider meal planning to optimize your food budget.",
  "Great job on your savings rate! You're saving 18% of your income, which puts you ahead of most people your age."
];