import { writable, derived } from 'svelte/store';

export type Currency = 'USD' | 'NGN';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate relative to USD (for future API integration)
}

export const currencies: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1500 } // Approximate rate
];

// Load saved currency from localStorage
const getInitialCurrency = (): Currency => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('flow-currency') as Currency;
    if (saved && ['USD', 'NGN'].includes(saved)) {
      return saved;
    }
  }
  return 'USD'; // Default
};

export const currentCurrency = writable<Currency>(getInitialCurrency());

// Save to localStorage when currency changes
if (typeof window !== 'undefined') {
  currentCurrency.subscribe(($currency) => {
    localStorage.setItem('flow-currency', $currency);
  });
}

// Get current currency config
export const currencyConfig = derived(currentCurrency, ($currency) => 
  currencies.find(c => c.code === $currency) || currencies[0]
);

// Toggle between currencies
export function toggleCurrency() {
  currentCurrency.update(($currency) => $currency === 'USD' ? 'NGN' : 'USD');
}

// Set specific currency
export function setCurrency(currency: Currency) {
  currentCurrency.set(currency);
}

// Convert USD amount to selected currency
export function convertFromUSD(amountInUSD: number, targetCurrency: Currency): number {
  const targetRate = currencies.find(c => c.code === targetCurrency)?.rate || 1;
  return amountInUSD * targetRate;
}

// Convert any amount to USD (if needed)
export function convertToUSD(amount: number, fromCurrency: Currency): number {
  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1;
  return amount / fromRate;
}