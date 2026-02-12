<script lang="ts">
  import { currentCurrency, currencies, type Currency } from '$lib/store/currencyStore';
  import { Button } from "$lib/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "$lib/components/ui/dropdown-menu";
  import { DollarSign, ChevronDown } from "@lucide/svelte";
  
  function setCurrency(currency: Currency) {
    currentCurrency.set(currency);
  }
</script>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" class="flex items-center gap-2 px-3">
      <DollarSign class="w-4 h-4" />
      <span class="font-medium">{$currentCurrency}</span>
      <ChevronDown class="w-3 h-3 opacity-50" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {#each currencies as currency}
      <DropdownMenuItem 
        onclick={() => setCurrency(currency.code)}
        class="flex items-center gap-2 cursor-pointer {$currentCurrency === currency.code ? 'bg-accent' : ''}"
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