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
    FileJson,
    Calendar 
  } from "@lucide/svelte";
  import { expenses, categories } from "$lib/store/expenseStore";
  import { expensesToCSV, expensesToJSON, downloadFile } from "$lib/utils/export";
  import { toast } from "svelte-sonner";
  
  export let filename = 'flow-data';
  
  let isExporting = false;
  
  function handleExport(format: 'csv' | 'json') {
    isExporting = true;
    
    try {
      const currentExpenses = $expenses;
      const currentCategories = $categories;
      
      if (format === 'csv') {
        const csv = expensesToCSV(currentExpenses, true);
        downloadFile(csv, `${filename}-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        toast.success(`Exported ${currentExpenses.length} transactions to CSV`);
      } else {
        const json = expensesToJSON(currentExpenses, currentCategories);
        downloadFile(json, `${filename}-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
        toast.success(`Exported ${currentExpenses.length} transactions to JSON`);
      }
    } catch (error) {
      toast.error('Export failed');
    } finally {
      isExporting = false;
    }
  }
</script>

<DropdownMenu>
  <DropdownMenuTrigger>
    <Button variant="outline" disabled={isExporting}>
      <Download class="w-4 h-4 mr-2" />
      Export
    </Button>
  </DropdownMenuTrigger>
  
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
    <DropdownMenuSeparator />
    
    <DropdownMenuItem onclick={() => handleExport('csv')} class="cursor-pointer">
      <FileSpreadsheet class="w-4 h-4 mr-2 text-green-600" />
      <div>
        <p class="font-medium">CSV Format</p>
        <p class="text-xs text-muted-foreground">Excel, Google Sheets</p>
      </div>
    </DropdownMenuItem>
    
    <DropdownMenuItem onclick={() => handleExport('json')} class="cursor-pointer">
      <FileJson class="w-4 h-4 mr-2 text-blue-600" />
      <div>
        <p class="font-medium">JSON Format</p>
        <p class="text-xs text-muted-foreground">For backup & import</p>
      </div>
    </DropdownMenuItem>
    
    <DropdownMenuSeparator />
    
    <div class="px-2 py-1.5">
      <p class="text-xs text-muted-foreground flex items-center gap-1">
        <Calendar class="w-3 h-3" />
        Exporting {$expenses.length} transactions
      </p>
    </div>
  </DropdownMenuContent>
</DropdownMenu>