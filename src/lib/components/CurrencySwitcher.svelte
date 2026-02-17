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

<!-- Fixed: No nested buttons -->
<DropdownMenu>
  <!-- Use asChild to avoid nested buttons -->
  <DropdownMenuTrigger asChild>
    <Button variant="outline" class="flex items-center gap-2 px-3">
      <span class="text-base">{currencies.find(c => c.code === $currentCurrency)?.symbol || '₦'}</span>
      <span class="font-medium">{$currentCurrency || 'NGN'}</span>
      <ChevronDown class="w-3 h-3 opacity-50" />
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    {#each currencies as currency}
      <!-- Regular div with click handler, not a button inside button -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        onclick={() => setCurrency(currency.code)}
        class="flex items-center gap-2 cursor-pointer px-2 py-1.5 hover:bg-accent rounded-sm"
        class:bg-accent={$currentCurrency === currency.code}
      >
        <span class="text-base">{currency.symbol}</span>
        <span class="font-medium">{currency.code}</span>
        <span class="text-xs text-muted-foreground ml-auto">{currency.name}</span>
        {#if $currentCurrency === currency.code}
          <span class="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Active</span>
        {/if}
      </div>
    {/each}
  </DropdownMenuContent>
</DropdownMenu>