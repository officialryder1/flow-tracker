<script lang="ts">
  import { summary, categories } from "$lib/store/expenseStore";
  import { formatCurrencyReactive } from "$lib/utils/format";
  import { currencyConfig } from "$lib/store/currencyStore";
  import { PieChart, ArrowRight } from "@lucide/svelte";
  
  let chartData = $derived.by(() => {
    const data = [];
    for (const [category, amount] of Object.entries($summary?.byCategory || {})) {
      const cat = $categories.find(c => c.name === category);
      data.push({
        name: category,
        value: amount,
        color: cat?.color || '#B0B0B0'
      });
    }
    return data.sort((a, b) => b.value - a.value).slice(0, 5);
  });
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
        <PieChart class="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 class="font-semibold">Spending Breakdown</h3>
        <p class="text-xs text-muted-foreground">Your top 5 categories</p>
      </div>
    </div>
    <a href="/analytics" class="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
      View all
      <ArrowRight class="w-4 h-4" />
    </a>
  </div>
  
  <div class="space-y-5">
    {#each chartData as item, index}
      <div class="space-y-2 group">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium text-muted-foreground w-5">{index + 1}.</span>
            <div class="flex items-center gap-2">
              <div 
                class="w-3 h-3 rounded-full transition-transform group-hover:scale-125" 
                style="background-color: {item.color}"
              ></div>
              <span class="text-sm font-medium">{item.name}</span>
            </div>
          </div>
          <div class="text-right">
            <span class="text-sm font-bold">{formatCurrencyReactive(item.value, $currencyConfig)}</span>
            <span class="text-xs text-muted-foreground ml-2">
              {((item.value / ($summary?.total || 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div class="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
            style="width: {(item.value / ($summary?.total || 1)) * 100}%; background: linear-gradient(to right, {item.color}80, {item.color})"
          ></div>
        </div>
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <PieChart class="w-8 h-8 text-muted-foreground" />
        </div>
        <p class="text-muted-foreground">No spending data yet</p>
        <p class="text-sm text-muted-foreground mt-1">Add your first expense to see insights</p>
      </div>
    {/each}
  </div>
  
  {#if chartData.length > 0}
    <div class="pt-4 border-t border-slate-200 dark:border-slate-800">
      <div class="flex justify-between text-sm">
        <span class="font-medium text-muted-foreground">Total Spent</span>
        <span class="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {formatCurrencyReactive($summary?.total || 0, $currencyConfig)}
        </span>
      </div>
    </div>
  {/if}
</div>