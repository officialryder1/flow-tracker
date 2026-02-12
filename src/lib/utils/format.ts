import { get } from 'svelte/store';
import { currencyConfig, currencies, convertFromUSD, type Currency} from '$lib/store/currencyStore';


export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function formatCurrency(amountInUSD: number): string {
  const config = get(currencyConfig);
  const convertedAmount = convertFromUSD(amountInUSD, config.code);
  
  return new Intl.NumberFormat(config.code === 'USD' ? 'en-US' : 'en-NG', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.code === 'USD' ? 2 : 0,
    maximumFractionDigits: config.code === 'USD' ? 2 : 0
  }).format(convertedAmount);
}

// For real-time reactive formatting
export function formatCurrencyReactive(amountInUSD: number, $currencyConfig): string {
  const convertedAmount = convertFromUSD(amountInUSD, $currencyConfig.code);
  
  return new Intl.NumberFormat($currencyConfig.code === 'USD' ? 'en-US' : 'en-NG', {
    style: 'currency',
    currency: $currencyConfig.code,
    minimumFractionDigits: $currencyConfig.code === 'USD' ? 2 : 0,
    maximumFractionDigits: $currencyConfig.code === 'USD' ? 2 : 0
  }).format(convertedAmount);
}

// Convert amount between currencies
export function convertAmount(amount: number, from: 'USD' | 'NGN', to: 'USD' | 'NGN'): number {
  const usdRate = currencies.find(c => c.code === 'USD')!.rate;
  const ngnRate = currencies.find(c => c.code === 'NGN')!.rate;
  
  // Convert to USD first, then to target currency
  const inUSD = from === 'USD' ? amount : amount / ngnRate;
  return to === 'USD' ? inUSD : inUSD * ngnRate;
}


// Format with specific currency (for previews, etc.)
export function formatAmountInCurrency(amount: number, currencyCode: Currency): string {
  const config = currencies.find(c => c.code === currencyCode)!;
  
  return new Intl.NumberFormat(currencyCode === 'USD' ? 'en-US' : 'en-NG', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: currencyCode === 'USD' ? 2 : 0,
    maximumFractionDigits: currencyCode === 'USD' ? 2 : 0
  }).format(amount);
}