<script lang="ts">
  import { expenses, categories } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  import { ArrowRight, Clock, AlertCircle } from '@lucide/svelte';
  
  $: recentTransactions = $expenses.slice(0, 5);
  $: currentCurrency = $currencyConfig;
  
  // Format currency for display (converts USD to selected currency)
  function formatCurrencyForDisplay(usdAmount: number) {
    // Convert USD to selected currency
    const convertedAmount = currentCurrency.code === 'USD' 
      ? usdAmount 
      : usdAmount * 1500; // 1 USD = 1500 NGN
    
    return new Intl.NumberFormat(currentCurrency.code === 'USD' ? 'en-US' : 'en-NG', {
      style: 'currency',
      currency: currentCurrency.code,
      minimumFractionDigits: currentCurrency.code === 'USD' ? 2 : 0,
      maximumFractionDigits: currentCurrency.code === 'USD' ? 2 : 0
    }).format(convertedAmount);
  }
  
  function formatDate(date: Date) {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  function getCategoryColor(categoryName: string) {
    const category = $categories.find(c => c.name === categoryName);
    return category?.color || '#94A3B8';
  }
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="font-semibold flex items-center gap-2">
      <Clock class="w-4 h-4" />
      Recent Activity
    </h3>
    <a href="/transactions" class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
      View All
      <ArrowRight class="w-3 h-3" />
    </a>
  </div>
  
  <div class="space-y-3">
    {#each recentTransactions as txn}
      <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
        <div class="flex items-center gap-3">
          <div 
            class="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
            style="background-color: {getCategoryColor(txn.category)}"
          />
          <div>
            <p class="font-medium text-sm">{txn.description}</p>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-muted-foreground">{formatDate(txn.date)}</span>
              <span class="text-xs px-1.5 py-0.5 rounded-full" 
                    style="background-color: {getCategoryColor(txn.category)}20; color: {getCategoryColor(txn.category)}">
                {txn.category}
              </span>
            </div>
          </div>
        </div>
        <p class="font-bold text-sm">{formatCurrencyForDisplay(txn.amount)}</p>
      </div>
    {:else}
      <div class="text-center py-8">
        <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-800 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
          <AlertCircle class="w-6 h-6 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground">No recent transactions</p>
        <p class="text-xs text-muted-foreground mt-1">Add your first expense to get started</p>
      </div>
    {/each}
  </div>
  
  <!-- Quick Stats -->
  {#if recentTransactions.length > 0}
    <div class="pt-3 mt-2 border-t border-gray-200 dark:border-gray-800">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Past 7 days</span>
        <span class="font-medium">
          {formatCurrencyForDisplay(
            $expenses
              .filter(e => {
                const diffDays = Math.floor((new Date().getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 7;
              })
              .reduce((sum, e) => sum + e.amount, 0)
          )}
        </span>
      </div>
    </div>
  {/if}
</div>