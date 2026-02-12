import { writable, derived } from 'svelte/store';
import type { Expense, Category } from '$lib/types/index';
import { loadExpenses, saveExpenses, loadCategories, saveCategories } from '$lib/utils/storage';

// Initialize store
export const expenses = writable<Expense[]>(loadExpenses());
export const categories = writable<Category[]>(loadCategories());

// Save to localStorage whenever store change
if (typeof window !== 'undefined') {
  expenses.subscribe((value) => saveExpenses(value));
  categories.subscribe((value) => saveCategories(value));
}

// Actions
export function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  
  expenses.update((current) => [newExpense, ...current]);
}

export function deleteExpense(id: string) {
  expenses.update((current) => current.filter((e) => e.id !== id));
}

export function updateExpense(id: string, updates: Partial<Expense>) {
  expenses.update((current) =>
    current.map((e) => (e.id === id ? { ...e, ...updates } : e))
  );
}

export function addCategory(category: Omit<Category, 'id'>) {
  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID()
  };
  
  categories.update((current) => [...current, newCategory]);
}

export function updateCategory(id: string, updates: Partial<Category>) {
  categories.update((current) =>
    current.map((c) => (c.id === id ? { ...c, ...updates } : c))
  );
}

export function deleteCategory(id: string) {
  categories.update((current) => current.filter((c) => c.id !== id));
}

// Derived store
export const summary = derived(expenses, ($expenses) => {
  const total = $expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const byCategory = $expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const uniqueDays = new Set(
    $expenses.map((e) => e.date.toDateString())
  ).size;
  
  const averagePerDay = uniqueDays > 0 ? total / uniqueDays : 0;
  
  return { total, byCategory, averagePerDay };
});

export const recentExpenses = derived(expenses, ($expenses) => 
  $expenses.slice(0, 10)
);

export const expensesByDate = derived(expenses, ($expenses) => {
  return $expenses.reduce((acc, expense) => {
    const dateStr = expense.date.toDateString();
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
});

export const categoryColors = derived(categories, ($categories) => {
  return $categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>);
});