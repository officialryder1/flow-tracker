import { writable, derived } from 'svelte/store';
import type { Expense, Category } from '$lib/types';
import { DEFAULT_CATEGORIES } from '$lib/types';

const initialSummary = {
  total: 0,
  byCategory: {},
  averagePerDay: 0
};

// Create stores with empty defaults first
export const expenses = writable<Expense[]>([]);
export const categories = writable<Category[]>(DEFAULT_CATEGORIES);

// Initialize from localStorage only on client side
if (typeof window !== 'undefined') {
  try {
    // Load expenses
    const savedExpenses = localStorage.getItem('flow-expenses');
    if (savedExpenses) {
      const parsed = JSON.parse(savedExpenses);
      const withDates = parsed.map((e: any) => ({
        ...e,
        date: new Date(e.date),
        createdAt: new Date(e.createdAt)
      }));
      expenses.set(withDates);
    } else {
      // First time user - create a dummy expense to prime the reactive system
      const dummyExpense: Expense = {
        id: crypto.randomUUID(),
        amount: 50, // $50 USD
        description: 'Sample expense - Delete me!',
        category: 'Food & Dining',
        date: new Date(),
        createdAt: new Date()
      };
      expenses.set([dummyExpense]);
    }
    
    // Load categories
    const savedCategories = localStorage.getItem('flow-categories');
    if (savedCategories) {
      categories.set(JSON.parse(savedCategories));
    }
  } catch (e) {
    console.error('Failed to load from localStorage', e);
  }
  
  // Save to localStorage on changes
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

// Category management
export function addCategory(category: Omit<Category, 'id'> & { id?: string }) {
  const newCategory: Category = {
    ...category,
    id: category.id || crypto.randomUUID()
  };
  categories.update(current => [...current, newCategory]);
}

export function updateCategory(id: string, updates: Partial<Category>) {
  categories.update(current => 
    current.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
  );
}

export function deleteCategory(id: string) {
  categories.update(current => current.filter(cat => cat.id !== id));
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

