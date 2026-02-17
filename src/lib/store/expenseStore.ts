import { writable, derived } from 'svelte/store';
import type { Expense, Category } from '$lib/types';

const initialSummary = {
  total: 0,
  byCategory: {},
  averagePerDay: 0
};

// Default categories
const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#FF6B6B', budget: 500 },
  { id: '2', name: 'Transportation', icon: 'car', color: '#4ECDC4', budget: 200 },
  { id: '3', name: 'Shopping', icon: 'shopping-bag', color: '#45B7D1', budget: 300 },
  { id: '4', name: 'Entertainment', icon: 'film', color: '#96CEB4', budget: 150 },
  { id: '5', name: 'Bills & Utilities', icon: 'file-text', color: '#FFEAA7', budget: 400 },
  { id: '6', name: 'Healthcare', icon: 'heart', color: '#DDA0DD', budget: 200 },
  { id: '7', name: 'Education', icon: 'book', color: '#98D8C8', budget: 300 },
  { id: '8', name: 'Other', icon: 'more-horizontal', color: '#B0B0B0', budget: 100 }
];

// Load from localStorage or use defaults
function loadCategories(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  
  try {
    const saved = localStorage.getItem('flow-categories');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load categories', e);
  }
  return DEFAULT_CATEGORIES;
}

function loadExpenses(): Expense[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem('flow-expenses');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((e: any) => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt)
      }));
    }
  } catch (e) {
    console.error('Failed to load expenses', e);
  }
  return [];
}

// Initialize stores with data
export const expenses = writable<Expense[]>(loadExpenses());
export const categories = writable<Category[]>(loadCategories());

// Save to localStorage on changes
if (typeof window !== 'undefined') {
  expenses.subscribe(value => {
    localStorage.setItem('flow-expenses', JSON.stringify(value));
  });
  
  categories.subscribe(value => {
    localStorage.setItem('flow-categories', JSON.stringify(value));
  });
}

// FIXED: Summary derived store with safe defaults
export const summary = derived(
  expenses, 
  ($expenses) => {
    // Ensure we always return an object with all properties
    const total = $expenses?.reduce((sum, e) => sum + (e?.amount || 0), 0) || 0;
    
    const byCategory = $expenses?.reduce((acc, e) => {
      if (e?.category && e?.amount) {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
      }
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Calculate unique days
    const uniqueDays = new Set(
      $expenses?.map(e => e?.date ? new Date(e.date).toDateString() : '').filter(Boolean)
    ).size;
    
    const averagePerDay = uniqueDays > 0 ? (total / uniqueDays) : 0;
    
    return { 
      total, 
      byCategory, 
      averagePerDay 
    };
  }
);

// Actions
export function addExpense(expense: Omit<Expense, 'id' | 'createdAt'>) {
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    createdAt: new Date()
  };
  expenses.update(current => [newExpense, ...current]);
}

export function deleteExpense(id: string) {
  expenses.update(current => current.filter(e => e.id !== id));
}

// Derived stores
export const categoryColors = derived(categories, $categories => {
  return $categories.reduce((acc, cat) => {
    acc[cat.name] = cat.color;
    return acc;
  }, {} as Record<string, string>);
});

export const recentExpenses = derived(expenses, ($expenses) => 
  ($expenses || []).slice(0, 10)
);

