<script lang="ts">
  import { expenses, categories } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  import { TrendingUp, TrendingDown, Calendar, Award, Coffee, Zap, AlertCircle } from '@lucide/svelte';
  
  $: insights = generateInsights();
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
    
    // Category with most transactions
    const categoryCount = $expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostFrequentCategory = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)[0];
    
    // Weekend vs weekday spending
    const weekendSpending = $expenses
      .filter(e => {
        const day = new Date(e.date).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    const weekdaySpending = $expenses
      .filter(e => {
        const day = new Date(e.date).getDay();
        return day > 0 && day < 6; // Monday to Friday
      })
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalSpending = weekendSpending + weekdaySpending;
    const weekendPercentage = totalSpending > 0 ? (weekendSpending / totalSpending) * 100 : 0;
    
    return {
      monthlyChange,
      thisMonthTotal,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      avgTransaction,
      topDay: topDay ? { date: topDay[0], amount: topDay[1] } : null,
      transactionCount: $expenses.length,
      mostFrequentCategory: mostFrequentCategory ? { name: mostFrequentCategory[0], count: mostFrequentCategory[1] } : null,
      weekendPercentage
    };
  }
  
  function getInsightIcon(insight: string) {
    if (insight.includes('increased')) return TrendingUp;
    if (insight.includes('decreased')) return TrendingDown;
    if (insight.includes('weekend')) return Coffee;
    return Zap;
  }
</script>

<div class="space-y-4">
  <!-- Monthly Change Insight -->
  {#if insights.transactionCount > 0}
    <div class="p-4 rounded-lg border-l-4 {insights.monthlyChange > 0 ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'}">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full {insights.monthlyChange > 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}">
          {#if insights.monthlyChange > 0}
            <TrendingUp class="w-4 h-4" />
          {:else}
            <TrendingDown class="w-4 h-4" />
          {/if}
        </div>
        <div>
          <p class="font-medium">
            Spending {insights.monthlyChange > 0 ? 'increased' : 'decreased'} by 
            <span class={insights.monthlyChange > 0 ? 'text-red-600' : 'text-green-600'}>
              {Math.abs(insights.monthlyChange).toFixed(1)}%
            </span>
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            Compared to last month ({formatCurrencyForDisplay(insights.thisMonthTotal)} this month)
          </p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Top Category Insight -->
  {#if insights.topCategory}
    <div class="p-4 rounded-lg border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/20">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
          <Award class="w-4 h-4" />
        </div>
        <div>
          <p class="font-medium">
            Top spending category: <span class="text-purple-600 font-bold">{insights.topCategory.name}</span>
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            You've spent {formatCurrencyForDisplay(insights.topCategory.amount)} here
          </p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Average Transaction Insight -->
  {#if insights.avgTransaction > 0}
    <div class="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
          <Coffee class="w-4 h-4" />
        </div>
        <div>
          <p class="font-medium">
            Average transaction: <span class="text-blue-600 font-bold">{formatCurrencyForDisplay(insights.avgTransaction)}</span>
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            Across {insights.transactionCount} transactions
          </p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Biggest Spending Day -->
  {#if insights.topDay}
    <div class="p-4 rounded-lg border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600">
          <Calendar class="w-4 h-4" />
        </div>
        <div>
          <p class="font-medium">
            Biggest spending day: <span class="text-orange-600 font-bold">{formatCurrencyForDisplay(insights.topDay.amount)}</span>
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            {new Date(insights.topDay.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Most Frequent Category -->
  {#if insights.mostFrequentCategory}
    <div class="p-4 rounded-lg border-l-4 border-l-teal-500 bg-teal-50/50 dark:bg-teal-950/20">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600">
          <Zap class="w-4 h-4" />
        </div>
        <div>
          <p class="font-medium">
            Most frequent: <span class="text-teal-600 font-bold">{insights.mostFrequentCategory.name}</span>
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            {insights.mostFrequentCategory.count} transactions
          </p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Weekend Spending Insight -->
  {#if insights.weekendPercentage > 0}
    <div class="p-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
      <div class="flex items-start gap-3">
        <div class="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600">
          <Coffee class="w-4 h-4" />
        </div>
        <div>
          <p class="font-medium">
            Weekend spending: <span class="text-amber-600 font-bold">{insights.weekendPercentage.toFixed(1)}%</span> of total
          </p>
          <p class="text-sm text-muted-foreground mt-1">
            {insights.weekendPercentage > 30 ? 'You spend a lot on weekends!' : 'Your weekend spending is under control'}
          </p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- No Data State -->
  {#if insights.transactionCount === 0}
    <div class="p-8 text-center">
      <div class="p-3 rounded-full bg-gray-100 dark:bg-gray-800 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
        <AlertCircle class="w-6 h-6 text-muted-foreground" />
      </div>
      <p class="text-muted-foreground">No data to analyze yet</p>
      <p class="text-sm text-muted-foreground mt-1">Add some expenses to see insights</p>
    </div>
  {/if}
</div>