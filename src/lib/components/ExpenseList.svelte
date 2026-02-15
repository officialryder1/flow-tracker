<script lang="ts">
  import { expenses, deleteExpense, categoryColors } from "$lib/store/expenseStore";
  import { formatCurrencyReactive, formatDate } from "$lib/utils/format";
  import { currencyConfig } from "$lib/store/currencyStore";
  import { Button } from "$lib/components/ui/button";
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table";
  import { Trash2 } from "@lucide/svelte";
  import Export from "$lib/components/Export.svelte";
</script>

<div class="space-y-4">
  <div class="flex items-center gap-3">
     <h2 class="text-2xl font-bold">Recent Transactions</h2>
      <Export dateRange="month" filename="flow-monthly" />
  </div>
  
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
        {#each $expenses as expense (expense.id)}
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
</div>