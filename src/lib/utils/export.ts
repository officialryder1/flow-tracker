import type { Expense, Category } from '$lib/types';
import { formatCurrency, formatDate } from './format';

// Convert expenses to CSV format
export function expensesToCSV(expenses: Expense[], categories: Category[]): string {
  // Create category map for quick lookup
  const categoryMap = new Map(categories.map(c => [c.name, c]));
  
  // Define CSV headers
  const headers = ['Date', 'Description', 'Category', 'Amount (USD)', 'Amount (NGN)', 'Created At'];
  
  // Convert expenses to rows
  const rows = expenses.map(expense => {
    const category = categoryMap.get(expense.category);
    const amountInUSD = expense.amount;
    const amountInNGN = amountInUSD * 1500; // Using exchange rate 1 USD = 1500 NGN
    
    return [
      formatDate(expense.date),
      expense.description,
      expense.category,
      amountInUSD.toFixed(2),
      amountInNGN.toFixed(0),
      formatDate(expense.createdAt)
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Download file
export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate summary statistics
export function generateSummary(expenses: Expense[], categories: Category[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const monthlyData = expenses.reduce((acc, e) => {
    const month = e.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    acc[month] = (acc[month] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total,
    byCategory,
    monthlyData,
    transactionCount: expenses.length,
    averagePerTransaction: expenses.length > 0 ? total / expenses.length : 0,
    topCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'
  };
}