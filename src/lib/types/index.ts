// place files you want to import through the `$lib` alias in this folder.
export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budget?: number;
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<string, number>;
  averagePerDay: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Food & Dining', icon: 'utensils', color: '#FF6B6B', budget: 500 },
  { id: '2', name: 'Transportation', icon: 'car', color: '#4ECDC4', budget: 200 },
  { id: '3', name: 'Shopping', icon: 'shopping-bag', color: '#45B7D1', budget: 300 },
  { id: '4', name: 'Entertainment', icon: 'film', color: '#96CEB4', budget: 150 },
  { id: '5', name: 'Bills & Utilities', icon: 'file-text', color: '#FFEAA7', budget: 400 },
  { id: '6', name: 'Healthcare', icon: 'heart', color: '#DDA0DD', budget: 200 },
  { id: '7', name: 'Education', icon: 'book', color: '#98D8C8', budget: 300 },
  { id: '8', name: 'Other', icon: 'more-horizontal', color: '#B0B0B0', budget: 100 }
];