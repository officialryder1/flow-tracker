<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
  } from "$lib/components/ui/dropdown-menu";
  import { 
    Download, 
    FileSpreadsheet, 
    FileText, 
    Loader2,
    Check,
    Calendar
  } from "@lucide/svelte";
  import { expenses, categories } from "$lib/store/expenseStore";
  import { expensesToCSV, downloadFile, generateSummary } from "$lib/utils/export";
  import { toast } from "svelte-sonner";
  
  // Simple props
  export let filename = 'flow-expenses';
  
  // State
  let isExporting = false;
  let exportSuccess = false;
  let dateRange: 'all' | 'month' | 'year' = 'all';
  
  // Filter expenses based on date range
  $: filteredExpenses = $expenses.filter(expense => {
    const now = new Date();
    const expenseDate = new Date(expense.date);
    
    if (dateRange === 'month') {
      return expenseDate.getMonth() === now.getMonth() && 
             expenseDate.getFullYear() === now.getFullYear();
    } else if (dateRange === 'year') {
      return expenseDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
  
  async function handleExport(format: 'csv' | 'excel' | 'summary') {
    isExporting = true;
    
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (format === 'summary') {
        const summary = generateSummary(filteredExpenses, $categories);
        const summaryContent = `
FLOW FINANCE REPORT
Generated: ${new Date().toLocaleString()}
Period: ${dateRange === 'all' ? 'All Time' : dateRange === 'month' ? 'This Month' : 'This Year'}

SUMMARY STATISTICS
─────────────────
Total Spent: $${summary.total.toFixed(2)} (₦${(summary.total * 1500).toFixed(0)})
Number of Transactions: ${summary.transactionCount}
Average per Transaction: $${summary.averagePerTransaction.toFixed(2)}
Top Category: ${summary.topCategory}

SPENDING BY CATEGORY
─────────────────
${Object.entries(summary.byCategory)
  .map(([cat, amt]) => `${cat.padEnd(20)} $${amt.toFixed(2)} (₦${(amt * 1500).toFixed(0)})`)
  .join('\n')}

MONTHLY BREAKDOWN
─────────────────
${Object.entries(summary.monthlyData)
  .map(([month, amt]) => `${month.padEnd(20)} $${amt.toFixed(2)} (₦${(amt * 1500).toFixed(0)})`)
  .join('\n')}

Powered by Flow Finance Tracker
        `.trim();
        
        downloadFile(
          summaryContent, 
          `${filename}-summary-${new Date().toISOString().split('T')[0]}.txt`, 
          'text/plain'
        );
      } else {
        const csv = expensesToCSV(filteredExpenses, $categories);
        const fileExt = format === 'csv' ? 'csv' : 'xls';
        const mimeType = format === 'csv' 
          ? 'text/csv' 
          : 'application/vnd.ms-excel';
        
        downloadFile(
          csv, 
          `${filename}-${new Date().toISOString().split('T')[0]}.${fileExt}`, 
          mimeType
        );
      }
      
      exportSuccess = true;
      toast.success(`Export successful!`, {
        description: `${filteredExpenses.length} transactions exported.`,
        duration: 3000,
      });
      
      setTimeout(() => {
        exportSuccess = false;
      }, 2000);
      
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again.',
      });
    } finally {
      isExporting = false;
    }
  }
  
  function getDateRangeLabel() {
    switch(dateRange) {
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  }
</script>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button 
      variant="outline" 
      class="relative overflow-hidden"
      disabled={isExporting}
    >
      {#if isExporting}
        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        Exporting...
      {:else if exportSuccess}
        <Check class="w-4 h-4 mr-2 text-green-500" />
        Exported!
      {:else}
        <Download class="w-4 h-4 mr-2" />
        Export Data
      {/if}
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end" class="w-64">
    <DropdownMenuLabel>
      <div class="flex items-center justify-between">
        <span>Export Options</span>
        <span class="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
          {getDateRangeLabel()}
        </span>
      </div>
    </DropdownMenuLabel>
    
    <DropdownMenuSeparator />
    
    <!-- Date Range Selector - Fixed version -->
    <div class="px-2 py-1.5">
      <p class="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
        <Calendar class="w-3 h-3" />
        Date Range
      </p>
      <div class="grid grid-cols-3 gap-1">
        <!-- All Time Button -->
        <button
          type="button"
          onclick={() => dateRange = 'all'}
          class="px-2 py-1.5 text-xs rounded-md transition-colors text-center
            {dateRange === 'all' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}"
        >
          All
        </button>
        
        <!-- This Month Button -->
        <button
          type="button"
          onclick={() => dateRange = 'month'}
          class="px-2 py-1.5 text-xs rounded-md transition-colors text-center
            {dateRange === 'month' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}"
        >
          Month
        </button>
        
        <!-- This Year Button -->
        <button
          type="button"
          onclick={() => dateRange = 'year'}
          class="px-2 py-1.5 text-xs rounded-md transition-colors text-center
            {dateRange === 'year' 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}"
        >
          Year
        </button>
      </div>
    </div>
    
    <DropdownMenuSeparator />
    
    <!-- Export Options -->
    <DropdownMenuItem onclick={() => handleExport('csv')} class="cursor-pointer">
      <FileText class="w-4 h-4 mr-2 text-green-600" />
      <div class="flex-1">
        <p class="font-medium text-sm">CSV Format</p>
        <p class="text-xs text-muted-foreground">Excel, Google Sheets</p>
      </div>
    </DropdownMenuItem>
    
    <DropdownMenuItem onclick={() => handleExport('excel')} class="cursor-pointer">
      <FileSpreadsheet class="w-4 h-4 mr-2 text-green-700" />
      <div class="flex-1">
        <p class="font-medium text-sm">Excel Format</p>
        <p class="text-xs text-muted-foreground">.xls file</p>
      </div>
    </DropdownMenuItem>
    
    <DropdownMenuItem onclick={() => handleExport('summary')} class="cursor-pointer">
      <FileText class="w-4 h-4 mr-2 text-blue-600" />
      <div class="flex-1">
        <p class="font-medium text-sm">Summary Report</p>
        <p class="text-xs text-muted-foreground">Text file with insights</p>
      </div>
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <div class="px-2 py-1.5">
      <p class="text-xs text-muted-foreground">
        Exporting {filteredExpenses.length} transactions
      </p>
    </div>
  </DropdownMenuContent>
</DropdownMenu>