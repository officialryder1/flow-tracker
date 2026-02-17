<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
 
  import { addExpense } from "$lib/store/expenseStore";
  import { categories } from "$lib/store/expenseStore";
  import { currencyConfig, convertToUSD } from "$lib/store/currencyStore";
  import { DollarSign, Receipt, Plus } from "@lucide/svelte";
  import CurrencySwitcher from '$lib/components/CurrencySwitcher.svelte';

  let amount = $state("");
  let description = $state("");
  let category = $state("");
  let date = $state(new Date().toISOString().split('T')[0]);
  let isReady = $state(false);

  // Ensure form is ready once categories are loaded
  $effect(() => {
    if ($categories && $categories.length > 0) {
      isReady = true;
    }
  });

  // Computed derived reactivity for validation
  let isValid = $derived(
    isReady &&
    amount.trim() !== '' && 
    parseFloat(amount) > 0 && 
    description.trim() !== '' && 
    category !== ''
  );

  function handleSubmit() {
    if (!isValid) return;
    
    try {
      const parsedAmount = parseFloat(amount);
      
      // Convert to USD if needed
      let amountInUSD = parsedAmount;
      if ($currencyConfig?.code === 'NGN') {
        amountInUSD = convertToUSD(parsedAmount, 'NGN');
      }
      
      // Parse date correctly - input gives YYYY-MM-DD format
      const expenseDate = new Date(date + 'T00:00:00');
      
      addExpense({
        amount: amountInUSD,
        description: description.trim(),
        category,
        date: expenseDate
      });
      
      // Reset form
      amount = "";
      description = "";
      category = "";
      date = new Date().toISOString().split('T')[0];
    } catch (error) {
      // Silent failure
    }
  }
</script>

<div class="space-y-6 p-6">
  <div class="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
    <div class="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
      <Receipt class="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 class="text-lg font-semibold">Quick Add</h2>
      <p class="text-xs text-muted-foreground">Record an expense instantly</p>
    </div>
    <div class="ml-auto">
      <CurrencySwitcher />
    </div>
  </div>
  
  <div class="space-y-5">
    <!-- Amount Input -->
    <div class="space-y-2">
      <Label for="amount" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Amount ({$currencyConfig?.symbol || '₦'})
      </Label>
      <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
        <div class="relative">
          {#if $currencyConfig?.code === 'NGN'}
            <span class="absolute left-4 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
              ₦
            </span>
            <input
              id="amount"
              type="number"
              step="any"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onchange={(e) => { amount = e.currentTarget.value; }}
              oninput={(e) => { amount = e.currentTarget.value; }}
              class="pl-12 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          {:else}
            <DollarSign class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onchange={(e) => { amount = e.currentTarget.value; }}
              oninput={(e) => { amount = e.currentTarget.value; }}
              class="pl-10 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            />
          {/if}
        </div>
      </div>
      {#if amount && parseFloat(amount) <= 0}
        <p class="text-xs text-red-500 mt-1">Amount must be greater than 0</p>
      {/if}
    </div>
    
    <!-- Description Input -->
    <div class="space-y-2">
      <Label for="description" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
      <input
        id="description"
        placeholder="e.g., Grocery shopping"
        value={description}
        onchange={(e) => { description = e.currentTarget.value; }}
        oninput={(e) => { description = e.currentTarget.value; }}
        class="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
    </div>
    
    <!-- Category Select -->
    <div class="space-y-2">
      <Label for="category" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
      <select 
        id="category"
        value={category}
        onchange={(e) => category = e.currentTarget.value}
        class="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      >
        <option value="" disabled selected>Select a category</option>
        {#each $categories as cat}
          <option value={cat.name}>{cat.name}</option>
        {/each}
      </select>
    </div>
    
    <!-- Date Input -->
    <div class="space-y-2">
      <Label for="date" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</Label>
      <input
        id="date"
        type="date"
        value={date}
        onchange={(e) => { date = e.currentTarget.value; }}
        oninput={(e) => { date = e.currentTarget.value; }}
        class="flex h-9 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
      />
    </div>
    
    <!-- Submit Button -->
    <Button 
      class="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-lg disabled:cursor-not-allowed" 
      onclick={handleSubmit}
      disabled={!isValid}
    >
      <Plus class="w-4 h-4 mr-2" />
      Add Expense
    </Button>
  </div>
</div>