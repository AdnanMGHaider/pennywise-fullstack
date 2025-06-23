-- Sample User
-- Password for 'testuser' is 'password123' (BCrypt encoded)
INSERT INTO users (username, email, password) VALUES ('testuser', 'testuser@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- Default Categories
INSERT INTO categories (name) VALUES ('Food');
INSERT INTO categories (name) VALUES ('Transportation');
INSERT INTO categories (name) VALUES ('Housing');
INSERT INTO categories (name) VALUES ('Entertainment');
INSERT INTO categories (name) VALUES ('Shopping');
INSERT INTO categories (name) VALUES ('Healthcare');
INSERT INTO categories (name) VALUES ('Education');
INSERT INTO categories (name) VALUES ('Bills');
INSERT INTO categories (name) VALUES ('Income');
INSERT INTO categories (name) VALUES ('Other');
INSERT INTO categories (name) VALUES ('Savings'); -- For goals
INSERT INTO categories (name) VALUES ('Travel'); -- For goals
INSERT INTO categories (name) VALUES ('Technology'); -- For goals

-- Sample Transactions (COMMENTED OUT to prevent auto-seeding for new users)
-- If uncommented, these would be for user_id = 1 (testuser)
-- Expenses
-- INSERT INTO transactions (user_id, date, description, category, amount, type) VALUES
-- (1, '2024-05-01', 'Groceries from SuperMart', 'Food', -75.50, 'expense'),
-- (1, '2024-05-01', 'Bus fare', 'Transportation', -2.75, 'expense'),
-- (1, '2024-05-02', 'Movie tickets', 'Entertainment', -25.00, 'expense'),
-- (1, '2024-05-03', 'Rent payment', 'Housing', -1200.00, 'expense'),
-- (1, '2024-05-04', 'New headphones', 'Shopping', -99.99, 'expense');

-- Income
-- INSERT INTO transactions (user_id, date, description, category, amount, type) VALUES
-- (1, '2024-05-01', 'Monthly Salary', 'Income', 3500.00, 'income'),
-- (1, '2024-05-10', 'Freelance Project A', 'Income', 450.00, 'income');

-- Sample Budgets (for May 2024) for user_id = 1 (testuser)
-- Note: spentAmount is calculated, so not stored here
INSERT INTO budgets (user_id, category, budget_amount, month_date) VALUES
(1, 'Food', 400.00, '2024-05-01'),
(1, 'Transportation', 100.00, '2024-05-01'),
(1, 'Entertainment', 150.00, '2024-05-01'),
(1, 'Shopping', 200.00, '2024-05-01');

-- Sample Financial Goals - Also commenting out
-- INSERT INTO financial_goals (title, target_amount, current_amount, deadline, category) VALUES
-- ('Emergency Fund', 5000.00, 1500.00, '2024-12-31', 'Savings'),
-- ('Summer Vacation', 1200.00, 300.00, '2024-08-01', 'Travel'),
-- ('New Laptop', 1500.00, 250.00, '2024-10-01', 'Technology');
