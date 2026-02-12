<script lang="ts">
  import { expenses, summary, categories } from "$lib/store/expenseStore";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { formatCurrency } from "$lib/utils/format";
  import { Calendar, TrendingDown, TrendingUp } from "@lucide/svelte";
  
  $: monthlyData = $expenses.reduce((acc, expense) => {
    const month = expense.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) acc[month] = 0;
    acc[month] += expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  $: topCategories = Object.entries($summary.byCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
</script>

<div class="container mx-auto p-4 max-w-7xl">
  <h1 class="text-3xl font-bold mb-6">Analytics Dashboard</h1>
  
  <div class="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Calendar class="h-5 w-5" />
          Monthly Spending
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each Object.entries(monthlyData).slice(0, 6) as [month, amount]}
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>{month}</span>
                <span class="font-bold">{formatCurrency(amount)}</span>
              </div>
              <div class="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary rounded-full"
                  style="width: {(amount / Math.max(...Object.values(monthlyData))) * 100}%"
                />
              </div>
            </div>
          {/each}
        </div>
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <TrendingUp class="h-5 w-5" />
          Top Categories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          {#each topCategories as [category, amount]}
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  style="background-color: {$categories.find(c => c.name === category)?.color || '#B0B0B0'}"
                />
                <span>{category}</span>
              </div>
              <div class="text-right">
                <div class="font-bold">{formatCurrency(amount)}</div>
                <div class="text-xs text-muted-foreground">
                  {((amount / $summary.total) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          {:else}
            <p class="text-center text-muted-foreground py-4">
              No data available yet
            </p>
          {/each}
        </div>
      </CardContent>
    </Card>
  </div>
</div>