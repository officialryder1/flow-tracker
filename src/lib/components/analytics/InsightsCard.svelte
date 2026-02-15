<script lang="ts">
  import { expenses, categories } from '$lib/store/expenseStore';
  import { TrendingUp, TrendingDown, Calendar, Award, Coffee, Home, Zap } from '@lucide/svelte';
  import { formatCurrencyReactive } from '$lib/utils/format';
  import { currencyConfig } from '$lib/store/currencyStore';
  
  $: insights = generateInsights();
  
  function generateInsights() {
    const now = new Date();
    const thisMonth = $expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    
    const lastMonth = $expenses.filter(e => {
      const d = new Date(e.date);
      d.setMonth(d.getMonth() + 1);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    
    const thisMonthTotal = thisMonth.reduce((sum, e) => sum + e.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, e) => sum + e.amount, 0);
    
    const monthlyChange = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;
    
    // Find top category
    const byCategory = $expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topCategory = Object.entries(byCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Average transaction
    const avgTransaction = $expenses.length > 0 
      ? $expenses.reduce((sum, e) => sum + e.amount, 0) / $expenses.length 
      : 0;
    
    // Most expensive day
    const byDay = $expenses.reduce((acc, e) => {
      const day = new Date(e.date).toDateString();
      acc[day] = (acc[day] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const topDay = Object.entries(byDay)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      monthlyChange,
      thisMonthTotal,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      avgTransaction,
      topDay: topDay ? { date: topDay[0], amount: topDay[1] } : null,
      transactionCount: $expenses.length
    };
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Monthly Change -->
  <div class="p-4 rounded-xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-muted-foreground">vs Last Month</p>
        <div class="flex items-baseline gap-2 mt-1">
          <span class="text-2xl font-bold">
            {insights.monthlyChange > 0 ? '+' : ''}{insights.monthlyChange.toFixed(1)}%
          </span>
          {#if insights.monthlyChange > 0}
            <TrendingUp class="w-5 h-5 text-red-500" />
            <span class="text-xs text-red-500">Spending increased</span>
          {:else}
            <TrendingDown class="w-5 h-5 text-green-500" />
            <span class="text-xs text-green-500">Spending decreased</span>
          {/if}
        </div>
      </div>
      <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
        <Calendar class="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </div>
  
  <!-- Top Category -->
  <div class="p-4 rounded-xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-muted-foreground">Top Category</p>
        {#if insights.topCategory}
          <p class="text-2xl font-bold mt-1">{insights.topCategory.name}</p>
          <p class="text-xs text-muted-foreground mt-1">
            {formatCurrencyReactive(insights.topCategory.amount, $currencyConfig)}
          </p>
        {:else}
          <p class="text-lg mt-1">No data</p>
        {/if}
      </div>
      <div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
        <Award class="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
    </div>
  </div>
  
  <!-- Average Transaction -->
  <div class="p-4 rounded-xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-muted-foreground">Average Transaction</p>
        <p class="text-2xl font-bold mt-1">
          {formatCurrencyReactive(insights.avgTransaction, $currencyConfig)}
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          Across {insights.transactionCount} transactions
        </p>
      </div>
      <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
        <Coffee class="w-5 h-5 text-green-600 dark:text-green-400" />
      </div>
    </div>
  </div>
  
  <!-- Most Expensive Day -->
  <div class="p-4 rounded-xl border bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm text-muted-foreground">Biggest Spending Day</p>
        {#if insights.topDay}
          <p class="text-2xl font-bold mt-1">
            {formatCurrencyReactive(insights.topDay.amount, $currencyConfig)}
          </p>
          <p class="text-xs text-muted-foreground mt-1">
            {new Date(insights.topDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        {:else}
          <p class="text-lg mt-1">No data</p>
        {/if}
      </div>
      <div class="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
        <Zap class="w-5 h-5 text-orange-600 dark:text-orange-400" />
      </div>
    </div>
  </div>
</div>