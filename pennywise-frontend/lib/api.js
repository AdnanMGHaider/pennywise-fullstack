const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch all budgets for the current user.
 * @param {string} token
 */
export async function fetchBudgets(token) {
  const res = await fetch(`${API_URL}/api/budgets`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to load budgets: ${res.status}`);
  return res.json();
}

/**
 * Fetch all transactions for the current user.
 * @param {string} token
 */
export async function fetchTransactions(token) {
  const res = await fetch(`${API_URL}/api/transactions`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to load transactions: ${res.status}`);
  return res.json();
}
