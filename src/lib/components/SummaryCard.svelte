<script lang="ts">
  import { summary } from "$lib/store/expenseStore";
  import { currencyConfig } from "$lib/store/currencyStore";
  import { formatCurrencyReactive } from "$lib/utils/format";
  import { Wallet, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "@lucide/svelte";
</script>

{#each [
  { 
    title: "Total Spent", 
    value: $summary.total, 
    icon: Wallet, 
    color: "from-blue-500 to-cyan-500",
    trend: "+2.5%",
    trendUp: true 
  },
  { 
    title: "Daily Average", 
    value: $summary.averagePerDay, 
    icon: TrendingUp, 
    color: "from-purple-500 to-pink-500",
    trend: "-5.2%",
    trendUp: false 
  },
  { 
    title: "Categories", 
    value: Object.keys($summary.byCategory).length, 
    icon: Calendar, 
    color: "from-amber-500 to-orange-500",
    subtitle: "active",
    isNumber: true
  }
] as item}
  <div class="relative group">
    <div class="absolute -inset-0.5 bg-gradient-to-r {item.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
    <div class="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-muted-foreground">{item.title}</p>
          <div class="flex items-baseline gap-2 mt-2">
            <h3 class="text-3xl font-bold">
              {item.isNumber 
                ? item.value 
                : formatCurrencyReactive(item.value, $currencyConfig)}
            </h3>
            {#if item.trend}
              {@const TrendIcon = item.trendUp ? ArrowUpRight : ArrowDownRight}
              <span class="text-xs font-medium flex items-center {item.trendUp ? 'text-emerald-600' : 'text-rose-600'}">
                <TrendIcon class="w-3 h-3" />
                {item.trend}
              </span>
            {/if}
          </div>
          {#if item.subtitle}
            <p class="text-xs text-muted-foreground mt-1">{item.subtitle} categories</p>
          {/if}
        </div>
        <div class="p-3 rounded-xl bg-gradient-to-br {item.color} shadow-lg">
          <svelte:component this={item.icon} class="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  </div>
{/each}