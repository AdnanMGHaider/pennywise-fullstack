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

-- Sample Transactions for user_id = 1 (testuser)

-- Previous Month Transactions (e.g., May 2024)
INSERT INTO transactions (user_id, date, description, category, amount, type) VALUES
(1, '2024-05-01', 'Rent Payment May', 'Housing', -1000.00, 'expense'),
(1, '2024-05-05', 'Salary May', 'Income', 3000.00, 'income'),
(1, '2024-05-10', 'Groceries May', 'Food', -200.00, 'expense'),
(1, '2024-05-15', 'Utilities May', 'Bills', -150.00, 'expense');

-- Current Month Transactions (e.g., June 2024)
INSERT INTO transactions (user_id, date, description, category, amount, type) VALUES
(1, '2024-06-01', 'Rent Payment June', 'Housing', -1000.00, 'expense'),
(1, '2024-06-05', 'Salary June', 'Income', 3200.00, 'income'),
(1, '2024-06-10', 'Groceries June', 'Food', -250.00, 'expense'),
(1, '2024-06-12', 'Weekend Fun June', 'Entertainment', -100.00, 'expense');


-- Sample Budgets (for June 2024) for user_id = 1 (testuser)
-- Note: spentAmount is calculated, so not stored here
INSERT INTO budgets (user_id, category, budget_amount, month_date) VALUES
(1, 'Food', 400.00, '2024-06-01'),
(1, 'Transportation', 100.00, '2024-06-01'),
(1, 'Entertainment', 150.00, '2024-06-01'),
(1, 'Shopping', 200.00, '2024-06-01');

-- Sample Financial Goals - Also commenting out
-- INSERT INTO financial_goals (user_id, title, target_amount, current_amount, deadline, category) VALUES
-- (1, 'Emergency Fund', 5000.00, 1500.00, '2024-12-31', 'Savings'),
-- (1, 'Summer Vacation', 1200.00, 300.00, '2024-08-01', 'Travel'),
-- (1, 'New Laptop', 1500.00, 250.00, '2024-10-01', 'Technology');
