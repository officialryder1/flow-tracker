<script lang="ts">
  import { expenses as storeExpenses, deleteExpense, categoryColors } from "$lib/store/expenseStore";
  import { currencyConfig } from "$lib/store/currencyStore";
  import { formatCurrencyReactive, formatDate } from "$lib/utils/format";
  import { Button } from "$lib/components/ui/button";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Trash2, ArrowRight } from "@lucide/svelte";

  
  // New prop to limit the number of transactions shown
  export let limit: number | null = null;
  export let expenses: any[] | null = null; // Allow external expenses array
  export let hideTitle: boolean = false;  
  
  // If limit is set, show only that many, otherwise show all
  $: sourceExpenses = expenses || $storeExpenses;
  $: displayedExpenses = limit ? sourceExpenses.slice(0, limit) : sourceExpenses;
</script>

<div class="space-y-4">
  {#if !hideTitle}
    <h2 class="text-2xl font-bold">
      {limit ? 'Recent Transactions' : 'All Transactions'}
    </h2>
  {/if}

  {#if !limit}
    <!-- Only show title on full page -->
    <h2 class="text-2xl font-bold">All Transactions</h2>
  {/if}
  
 <div class="rounded-md border">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead class="text-right">Amount</TableHead>
          <TableHead class="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each displayedExpenses as expense (expense.id)}
          <TableRow>
            <TableCell>{formatDate(expense.date)}</TableCell>
            <TableCell class="font-medium">{expense.description}</TableCell>
            <TableCell>
              <span 
                class="px-2 py-1 rounded-full text-xs" 
                style="background-color: {$categoryColors[expense.category] || '#B0B0B0'}20; color: {$categoryColors[expense.category] || '#B0B0B0'}"
              >
                {expense.category}
              </span>
            </TableCell>
            <TableCell class="text-right font-bold">
              {formatCurrencyReactive(expense.amount, $currencyConfig)}
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onclick={() => deleteExpense(expense.id)}
              >
                <Trash2 class="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan="5" class="text-center py-8 text-muted-foreground">
              No expenses yet. Add your first expense above!
            </TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </div>
  
  {#if limit && sourceExpenses.length > limit}
    <div class="text-center text-sm text-muted-foreground">
      Showing {Math.min(limit, sourceExpenses.length)} of {sourceExpenses.length} transactions.
      <a href="/transactions" class="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center gap-1">
        View all
        <ArrowRight class="w-3 h-3" />
      </a>
    </div>
  {/if}
</div>