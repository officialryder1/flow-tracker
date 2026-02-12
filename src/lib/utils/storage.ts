import { browser } from '$app/environment';
import type { Expense, Category } from '$lib/types';
import { DEFAULT_CATEGORIES } from '$lib/types';

const STORAGE_KEYS = {
  EXPENSES: 'finance-tracker-expenses',
  CATEGORIES: 'finance-tracker-categories'
};

export function loadExpenses(): Expense[] {
  if (!browser) return [];
  
  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((exp: any) => ({
        ...exp,
        date: new Date(exp.date),
        createdAt: new Date(exp.createdAt)
      }));
    } catch (e) {
      console.error('Failed to parse expenses', e);
      return [];
    }
  }
  return [];
}

export function saveExpenses(expenses: Expense[]): void {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function loadCategories(): Category[] {
  if (!browser) return DEFAULT_CATEGORIES;
  
  const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse categories', e);
      return DEFAULT_CATEGORIES;
    }
  }
  return DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  if (!browser) return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}