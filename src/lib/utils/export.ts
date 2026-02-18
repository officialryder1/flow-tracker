import type { Expense, Category } from '$lib/types';
import { formatCurrency, formatDate } from './format';
import { get } from 'svelte/store';
import { categories } from '$lib/store/expenseStore';


// Convert expenses and categories to CSV
export function expensesToCSV(expenses: Expense[], includeCategories: boolean = true): string {
  // Create CSV headers
  const headers = ['Date', 'Description', 'Category', 'Amount (USD)', 'Amount (NGN)', 'Created At'];
  
  // Convert expenses to rows
  const rows = expenses.map(expense => {
    const amountInNGN = expense.amount * 1500;
    
    return [
      formatDate(expense.date),
      expense.description,
      expense.category,
      expense.amount.toFixed(2),
      amountInNGN.toFixed(0),
      formatDate(expense.createdAt)
    ];
  });
  
  let csv = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  
  // Add categories section if requested
  if (includeCategories) {
    const cats = get(categories);
    csv += '\n\n# Categories\n';
    csv += ['Name', 'Color', 'Budget', 'Icon'].join(',') + '\n';
    csv += cats.map(cat => 
      `"${cat.name}","${cat.color}","${cat.budget || ''}","${cat.icon}"`
    ).join('\n');
  }
  
  return csv;
}

// Export to JSON (includes all data)
export function expensesToJSON(expenses: Expense[], categories: Category[]): string {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    expenses: expenses.map(e => ({
      ...e,
      date: e.date.toISOString(),
      createdAt: e.createdAt.toISOString()
    })),
    categories: categories
  };
  
  return JSON.stringify(data, null, 2);
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