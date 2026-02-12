<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
 
  import { addExpense } from "$lib/store/expenseStore";  
  import { categories } from "$lib/store/expenseStore";  
  import { currencyConfig, convertToUSD } from "$lib/store/currencyStore"; 
  import { DollarSign, Receipt, Plus } from "@lucide/svelte"; 

  let amount = "";
  let description = "";
  let category = "";
  let date = new Date().toISOString().split('T')[0];

  function handleSubmit() {
    if (!amount || !description || !category) return;
    
    // Convert the amount to USD before saving
    let amountInUSD = parseFloat(amount);
    
    // If current currency is NGN, convert to USD
    if ($currencyConfig?.code === 'NGN') {
      amountInUSD = convertToUSD(amountInUSD, 'NGN');
    }
    
    addExpense({
      amount: amountInUSD, // Always store in USD
      description,
      category,
      date: new Date(date)
    });
    
    // Reset form
    amount = "";
    description = "";
    category = "";
    date = new Date().toISOString().split('T')[0];
  }

</script>

<div class="space-y-6 p-6">
  <div class="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
    <div class="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
      <Receipt class="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 class="text-lg font-semibold">Quick Add</h2>
      <p class="text-xs text-muted-foreground">Record an expense instantly</p>
    </div>
  </div>
  
  <div class="space-y-5">
    <div class="space-y-2">
      <Label for="amount" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</Label>
      <div class="relative group">
        <div class="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
        <div class="relative">
          {#if $currencyConfig?.code === 'NGN'}
            <span class="absolute left-4 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors">
              {$currencyConfig.symbol}
            </span>
            <Input
              id="amount"
              type="number"
              step="1"
              placeholder="0"
              class="pl-12 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              bind:value={amount}
            />
          {:else}
            <DollarSign class="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              class="pl-10 border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              bind:value={amount}
            />
          {/if}
        </div>
      </div>
    </div>
    
    <div class="space-y-2">
      <Label for="description" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
      <Input
        id="description"
        placeholder="e.g., Grocery shopping"
        class="border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        bind:value={description}
      />
    </div>
    
    <div class="space-y-2">
      <Label for="category" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</Label>
      <select 
        id="category"
        bind:value={category}
        class="flex h-11 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      >
        <option value="" disabled selected>Select a category</option>
        {#each $categories as cat}
          <option value={cat.name} style="color: {cat.color}">{cat.name}</option>
        {/each}
      </select>
    </div>
    
    <div class="space-y-2">
      <Label for="date" class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</Label>
      <Input
        id="date"
        type="date"
        class="border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        bind:value={date}
      />
    </div>
    
    <Button 
      class="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-lg disabled:cursor-not-allowed" 
      onclick={handleSubmit}
      disabled={!amount || !description || !category}
    >
      <Plus class="w-4 h-4 mr-2" />
      Add Expense
    </Button>
  </div>
</div>