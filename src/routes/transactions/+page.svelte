<script lang="ts">
  import { page } from '$app/stores';

  import ExpenseList from "$lib/components/ExpenseList.svelte";
  import ExportButton from "$lib/components/Export.svelte";
  import { Button } from "$lib/components/ui/button";
  import { expenses, categories } from "$lib/store/expenseStore";
  import { currencyConfig } from "$lib/store/currencyStore";
  import { formatCurrencyReactive } from "$lib/utils/format";
  import { 
    ArrowLeft, 
    Search, 
    Filter, 
    Download,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Calendar,
    ArrowUpDown
  } from "@lucide/svelte";
  
  // Pagination state
  let currentPage = $state(1);
  let itemsPerPage = $state(20);
  let searchTerm = $state("");
  let selectedCategory = $state("all");
  let sortBy = $state<'date' | 'amount' | 'category'>('date');
  let sortOrder = $state<'asc' | 'desc'>('desc');
  
  // Filter and sort expenses
  let filteredExpenses = $derived($expenses
    .filter(expense => {
      // Search filter
      if (searchTerm && !expense.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && expense.category !== selectedCategory) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    })
  );  
  // Pagination calculations
  let totalPages = $derived(Math.ceil(filteredExpenses.length / itemsPerPage));
  let paginatedExpenses = $derived(filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ));
  
  // Reset to first page when filters change
  $effect(() => {
    searchTerm;
    selectedCategory;
    sortBy;
    sortOrder;
    currentPage = 1;
  });
  
  // Calculate totals
  let displayedTotal = $derived(filteredExpenses.reduce((sum, e) => sum + e.amount, 0));
  
  // Toggle sort order
  function toggleSort(field: 'date' | 'amount' | 'category') {
    if (sortBy === field) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = field;
      sortOrder = 'desc';
    }
  }
</script>


<div class="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7x">
    <a href="/" class="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors">
      <Button variant="ghost" size="sm" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        Back to Dashboard
      </Button>
    </a>
  <!-- Header with back button -->
  <div class="flex items-center gap-4 mb-6">
    
    <div>
      <h1 class="text-3xl font-bold">All Transactions</h1>
      <p class="text-muted-foreground">
        {filteredExpenses.length} total transactions • 
        {formatCurrencyReactive(displayedTotal, $currencyConfig)} total
      </p>
    </div>
  </div>
  
  <!-- Filters Bar -->
  <div class="bg-white dark:bg-slate-900 rounded-xl border p-4 mb-6 space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search descriptions..."
          class="pl-9 w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchTerm}
          oninput={(e) => { searchTerm = e.currentTarget.value; }}
          onchange={(e) => { searchTerm = e.currentTarget.value; }}
        />
      </div>
      
      <!-- Category Filter - Native Select -->
      <div class="relative">
        <select 
          value={selectedCategory}
          onchange={(e) => { selectedCategory = e.currentTarget.value; }}
          class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All Categories</option>
          {#each $categories as cat}
            <option value={cat.name}>{cat.name}</option>
          {/each}
        </select>
      </div>
      
      <!-- Sort By - Native Select -->
      <div class="relative">
        <select 
          value={sortBy}
          onchange={(e) => { sortBy = e.currentTarget.value as 'date' | 'amount' | 'category'; }}
          class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>
      
      <!-- Sort Order - Native Select -->
      <div class="relative">
        <select 
          value={sortOrder}
          onchange={(e) => { sortOrder = e.currentTarget.value as 'asc' | 'desc'; }}
          class="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="desc">Descending (Newest first)</option>
          <option value="asc">Ascending (Oldest first)</option>
        </select>
      </div>
    </div>
    
    <!-- Quick Sort Buttons (Alternative) -->
    <div class="flex flex-wrap items-center gap-2 pt-2">
      <span class="text-sm text-muted-foreground">Quick sort:</span>
      <Button 
        variant={sortBy === 'date' ? 'default' : 'outline'} 
        size="sm"
        onclick={() => toggleSort('date')}
        class="gap-1"
      >
        <Calendar class="w-3 h-3" />
        Date
        {#if sortBy === 'date'}
          <span class="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
        {/if}
      </Button>
      <Button 
        variant={sortBy === 'amount' ? 'default' : 'outline'} 
        size="sm"
        onclick={() => toggleSort('amount')}
        class="gap-1"
      >
        <ArrowUpDown class="w-3 h-3" />
        Amount
        {#if sortBy === 'amount'}
          <span class="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
        {/if}
      </Button>
      <Button 
        variant={sortBy === 'category' ? 'default' : 'outline'} 
        size="sm"
        onclick={() => toggleSort('category')}
        class="gap-1"
      >
        <Filter class="w-3 h-3" />
        Category
        {#if sortBy === 'category'}
          <span class="ml-1">{sortOrder === 'desc' ? '↓' : '↑'}</span>
        {/if}
      </Button>
    </div>
    
    <!-- Active Filters Summary -->
    <div class="flex items-center justify-between pt-2 border-t">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter class="w-4 h-4" />
        <span>
          {filteredExpenses.length} of {$expenses.length} transactions
          {#if searchTerm || selectedCategory !== 'all'}
            • Filters applied
          {/if}
        </span>
      </div>
      
      <!-- Export Button -->
      <ExportButton filename="all-transactions" />
    </div>
  </div>
  
  <!-- Transactions Table -->
  <div class="bg-white dark:bg-slate-900 rounded-xl border overflow-hidden">
    <ExpenseList expenses={paginatedExpenses} hideTitle={true} />
  </div>
  
  <!-- Pagination -->
  {#if totalPages > 1}
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
      <p class="text-sm text-muted-foreground order-2 sm:order-1">
        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length} transactions
      </p>
      
      <div class="flex items-center gap-2 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onclick={() => currentPage = Math.max(1, currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft class="w-4 h-4" />
        </Button>
        
        <div class="flex items-center gap-1">
          {#each Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return pageNum;
          }) as pageNum}
            <Button
              variant={currentPage === pageNum ? 'default' : 'outline'}
              size="sm"
              class="w-8"
              onclick={() => currentPage = pageNum}
            >
              {pageNum}
            </Button>
          {/each}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onclick={() => currentPage = Math.min(totalPages, currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight class="w-4 h-4" />
        </Button>
      </div>
    </div>
  {/if}
  
  <!-- Bulk Actions -->
  {#if filteredExpenses.length > 0}
    <div class="mt-6 p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium">Bulk Actions</span>
          <Button variant="outline" size="sm" class="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 class="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download class="w-4 h-4 mr-2" />
            Export Filtered
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>