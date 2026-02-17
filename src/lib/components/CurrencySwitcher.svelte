<script lang="ts">
  import { currentCurrency, currencies, type Currency } from '$lib/store/currencyStore';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { ChevronDown } from "@lucide/svelte";
  
  function setCurrency(currency: Currency) {
    currentCurrency.set(currency);
  }
</script>

<DropdownMenu>
  <DropdownMenuTrigger class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 shadow-xs h-9 px-4 py-2">
    <span class="text-base">{currencies.find(c => c.code === $currentCurrency)?.symbol || '₦'}</span>
    <span class="font-medium">{$currentCurrency || 'NGN'}</span>
    <ChevronDown class="w-3 h-3 opacity-50" />
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    {#each currencies as currency}
      <DropdownMenuItem 
        onclick={() => setCurrency(currency.code)}
        class="flex items-center gap-2 cursor-pointer"
      >
        <span class="text-base">{currency.symbol}</span>
        <span class="font-medium">{currency.code}</span>
        <span class="text-xs text-muted-foreground ml-auto">{currency.name}</span>
        {#if $currentCurrency === currency.code}
          <span class="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Active</span>
        {/if}
      </DropdownMenuItem>
    {/each}
  </DropdownMenuContent>
</DropdownMenu>