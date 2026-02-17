import { writable, derived } from 'svelte/store';

export type Currency = 'USD' | 'NGN';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  name: string;
  rate: number;
}

export const currencies: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 1500 }
];

// Load saved currency from localStorage with immediate default
const getInitialCurrency = (): Currency => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('flow-currency') as Currency;
      if (saved && ['USD', 'NGN'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    }
  }
  return 'NGN'; // Default to NGN
};

// Create store with initial value
export const currentCurrency = writable<Currency>(getInitialCurrency());

// Save to localStorage when currency changes (only in browser)
if (typeof window !== 'undefined') {
  currentCurrency.subscribe(($currency) => {
    try {
      localStorage.setItem('flow-currency', $currency);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  });
}

// Get current currency config with fallback
export const currencyConfig = derived(
  currentCurrency, 
  ($currency) => currencies.find(c => c.code === $currency) || currencies[1] // Default to NGN (index 1)
);

// Helper functions
export function convertFromUSD(amountInUSD: number, targetCurrency: Currency): number {
  const targetRate = currencies.find(c => c.code === targetCurrency)?.rate || 1500;
  return amountInUSD * targetRate;
}

export function convertToUSD(amount: number, fromCurrency: Currency): number {
  const fromRate = currencies.find(c => c.code === fromCurrency)?.rate || 1500;
  return amount / fromRate;
}

export function toggleCurrency() {
  currentCurrency.update(($currency) => $currency === 'USD' ? 'NGN' : 'USD');
}

export function setCurrency(currency: Currency) {
  currentCurrency.set(currency);
}