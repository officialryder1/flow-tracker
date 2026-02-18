import type { Expense, Category } from '$lib/types';
import { expenses, categories } from '$lib/store/expenseStore';
import { toast } from 'svelte-sonner';

export interface ImportResult {
  success: boolean;
  expensesImported: number;
  categoriesImported: number;
  errors: string[];
}

export function validateImportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check if data exists
  if (!data) {
    errors.push('No data provided');
    return { valid: false, errors };
  }

  // Check if it's an object
  if (typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors };
  }

  // Handle different export formats
  if (data.expenses || data.categories) {
    // New format with separate expenses and categories
    if (data.expenses && !Array.isArray(data.expenses)) {
      errors.push('Expenses must be an array');
    }
    if (data.categories && !Array.isArray(data.categories)) {
      errors.push('Categories must be an array');
    }
  } else if (Array.isArray(data)) {
    // Old format - just an array of expenses
    // This is still valid, we'll handle it
  } else {
    errors.push('Data must contain expenses array or be an expenses array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function parseImportedData(data: any): { expenses: any[]; categories: any[] } {
  let importedExpenses: any[] = [];
  let importedCategories: any[] = [];

  if (data.expenses || data.categories) {
    // New format
    importedExpenses = Array.isArray(data.expenses) ? data.expenses : [];
    importedCategories = Array.isArray(data.categories) ? data.categories : [];
  } else if (Array.isArray(data)) {
    // Old format - just expenses array
    importedExpenses = data;
  }

  // Validate and clean expenses
  const validExpenses = importedExpenses
    .filter(exp => exp && typeof exp === 'object')
    .map(exp => ({
      ...exp,
      amount: parseFloat(exp.amount) || 0,
      date: exp.date ? new Date(exp.date) : new Date(),
      createdAt: exp.createdAt ? new Date(exp.createdAt) : new Date(),
      id: exp.id || crypto.randomUUID()
    }))
    .filter(exp => exp.amount > 0 && exp.description && exp.category);

  // Validate and clean categories
  const validCategories = importedCategories
    .filter(cat => cat && typeof cat === 'object')
    .map(cat => ({
      ...cat,
      id: cat.id || crypto.randomUUID(),
      name: cat.name || 'Unnamed',
      color: cat.color || '#94A3B8',
      icon: cat.icon || 'more-horizontal',
      budget: cat.budget ? parseFloat(cat.budget) : undefined
    }))
    .filter(cat => cat.name);

  return {
    expenses: validExpenses,
    categories: validCategories
  };
}

export function mergeWithExistingData(
  existingExpenses: Expense[],
  existingCategories: Category[],
  importedExpenses: any[],
  importedCategories: any[],
  strategy: 'replace' | 'merge' | 'keep-both' = 'merge'
): { expenses: Expense[]; categories: Category[] } {
  
  let newExpenses: Expense[] = [...existingExpenses];
  let newCategories: Category[] = [...existingCategories];

  if (strategy === 'replace') {
    // Replace all existing data
    newExpenses = importedExpenses;
    newCategories = importedCategories.length > 0 ? importedCategories : existingCategories;
  } else if (strategy === 'merge') {
    // Merge, replacing duplicates by ID
    const expenseMap = new Map(existingExpenses.map(e => [e.id, e]));
    importedExpenses.forEach(exp => expenseMap.set(exp.id, exp));
    newExpenses = Array.from(expenseMap.values());

    const categoryMap = new Map(existingCategories.map(c => [c.id, c]));
    importedCategories.forEach(cat => categoryMap.set(cat.id, cat));
    newCategories = Array.from(categoryMap.values());
  } else if (strategy === 'keep-both') {
    // Keep both, adding imported with new IDs
    const importedWithNewIds = importedExpenses.map(exp => ({
      ...exp,
      id: crypto.randomUUID()
    }));
    newExpenses = [...existingExpenses, ...importedWithNewIds];

    const categoriesWithNewIds = importedCategories.map(cat => ({
      ...cat,
      id: crypto.randomUUID()
    }));
    newCategories = [...existingCategories, ...categoriesWithNewIds];
  }

  // Sort expenses by date (newest first)
  newExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { expenses: newExpenses, categories: newCategories };
}

export async function importFromFile(
  file: File,
  strategy: 'replace' | 'merge' | 'keep-both' = 'merge'
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const result: ImportResult = {
      success: false,
      expensesImported: 0,
      categoriesImported: 0,
      errors: []
    };

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate data
        const validation = validateImportData(data);
        if (!validation.valid) {
          result.errors = validation.errors;
          resolve(result);
          return;
        }

        // Parse data
        const { expenses: importedExpenses, categories: importedCategories } = parseImportedData(data);

        if (importedExpenses.length === 0 && importedCategories.length === 0) {
          result.errors.push('No valid data found in file');
          resolve(result);
          return;
        }

        // Get current data
        const currentExpenses = await new Promise<Expense[]>((resolve) => {
          expenses.subscribe(value => resolve(value))();
        });
        const currentCategories = await new Promise<Category[]>((resolve) => {
          categories.subscribe(value => resolve(value))();
        });

        // Merge with existing data
        const { expenses: newExpenses, categories: newCategories } = mergeWithExistingData(
          currentExpenses,
          currentCategories,
          importedExpenses,
          importedCategories,
          strategy
        );

        // Update stores
        expenses.set(newExpenses);
        if (newCategories.length > 0) {
          categories.set(newCategories);
        }

        result.success = true;
        result.expensesImported = importedExpenses.length;
        result.categoriesImported = importedCategories.length;

      } catch (error) {
        result.errors.push(`Failed to parse file: ${error.message}`);
      }
      resolve(result);
    };

    reader.onerror = () => {
      result.errors.push('Failed to read file');
      resolve(result);
    };

    reader.readAsText(file);
  });
}