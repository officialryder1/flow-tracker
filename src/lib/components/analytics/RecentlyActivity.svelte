<script lang="ts">
  import { expenses } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  import { formatCurrencyReactive, formatDate } from '$lib/utils/format';
  import { ArrowRight, Clock } from '@lucide/svelte';
  
  $: recentTransactions = $expenses.slice(0, 5);
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h3 class="font-semibold flex items-center gap-2">
      <Clock class="w-4 h-4" />
      Recent Activity
    </h3>
    <a href="/" class="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
      View All
      <ArrowRight class="w-3 h-3" />
    </a>
  </div>
  
  <div class="space-y-3">
    {#each recentTransactions as txn}
      <div class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
        <div class="flex items-center gap-3">
          <div 
            class="w-2 h-2 rounded-full"
            style="background-color: {txn.category.color || '#94A3B8'}"
          />
          <div>
            <p class="font-medium text-sm">{txn.description}</p>
            <p class="text-xs text-muted-foreground">{formatDate(txn.date)}</p>
          </div>
        </div>
        <p class="font-bold text-sm">{formatCurrencyReactive(txn.amount, $currencyConfig)}</p>
      </div>
    {:else}
      <div class="text-center py-8 text-muted-foreground">
        No recent transactions
      </div>
    {/each}
  </div>
</div>