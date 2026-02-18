<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "$lib/components/ui/dialog";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
  } from "$lib/components/ui/dropdown-menu";
  import { 
    Upload, 
    FileUp, 
    AlertCircle, 
    CheckCircle2, 
    Loader2,
    Download,
    Merge,
    Replace,
    CopyPlus
  } from "@lucide/svelte";
  import { importFromFile, type ImportResult } from "$lib/utils/import";
  import { toast } from "svelte-sonner";

  let isImporting = false;
  let showImportDialog = false;
  let importStrategy: 'replace' | 'merge' | 'keep-both' = 'merge';
  let importResult: ImportResult | null = null;
  let dragActive = false;
  let fileInput: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragActive = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragActive = false;
  }

  async function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragActive = false;
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }

  async function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }

  async function processFile(file: File) {
    // Check file type
    if (!file.name.endsWith('.json') && !file.name.endsWith('.csv')) {
      toast.error('Invalid file type', {
        description: 'Please upload a JSON or CSV file'
      });
      return;
    }

    isImporting = true;
    importResult = null;

    try {
      const result = await importFromFile(file, importStrategy);
      importResult = result;

      if (result.success) {
        toast.success('Import successful!', {
          description: `Imported ${result.expensesImported} expenses and ${result.categoriesImported} categories`
        });
        
        // Close dialog after 2 seconds on success
        setTimeout(() => {
          showImportDialog = false;
          importResult = null;
        }, 2000);
      } else {
        toast.error('Import failed', {
          description: result.errors.join(', ')
        });
      }
    } catch (error) {
      toast.error('Import failed', {
        description: error.message
      });
    } finally {
      isImporting = false;
      // Clear file input
      if (fileInput) fileInput.value = '';
    }
  }

  function resetDialog() {
    importResult = null;
    isImporting = false;
    dragActive = false;
  }
</script>

<Dialog bind:open={showImportDialog} onclose={resetDialog}>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" class="gap-2">
        <Download class="w-4 h-4" />
       Data
      </Button>
    </DropdownMenuTrigger>
    
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Data Management</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <!-- Export Options -->
      <DropdownMenuItem onclick={() => console.log('export csv')} class="cursor-pointer">
        <FileUp class="w-4 h-4 mr-2" />
        Export as CSV
      </DropdownMenuItem>
      
      <DropdownMenuItem onclick={() => console.log('export json')} class="cursor-pointer">
        <FileUp class="w-4 h-4 mr-2" />
        Export as JSON
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />
      
      <!-- Import Option - Opens Dialog -->
      <DropdownMenuItem onclick={() => showImportDialog = true} class="cursor-pointer">
        <Upload class="w-4 h-4 mr-2" />
        Import Data
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <!-- Import Dialog -->
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Import Data</DialogTitle>
      <DialogDescription>
        Upload a previously exported file to restore your data.
      </DialogDescription>
    </DialogHeader>

    {#if importResult?.success}
      <!-- Success State -->
      <div class="py-8 text-center">
        <div class="flex justify-center mb-4">
          <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 class="font-semibold text-lg mb-2">Import Complete!</h3>
        <p class="text-sm text-muted-foreground">
          Imported {importResult.expensesImported} expenses and {importResult.categoriesImported} categories
        </p>
      </div>

    {:else if importResult && !importResult.success}
      <!-- Error State -->
      <div class="py-8 text-center">
        <div class="flex justify-center mb-4">
          <div class="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle class="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h3 class="font-semibold text-lg mb-2">Import Failed</h3>
        <p class="text-sm text-muted-foreground">
          {importResult.errors[0] || 'Unknown error occurred'}
        </p>
      </div>

    {:else}
      <!-- Import Options -->
      <div class="space-y-4 py-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Import Strategy</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              onclick={() => importStrategy = 'merge'}
              class="p-3 rounded-lg border text-left transition-all"
              class:border-blue-500={importStrategy === 'merge'}
             
            >
              <Merge class="w-4 h-4 mb-1" />
              <div class="text-xs font-medium">Merge</div>
              <div class="text-[10px] text-muted-foreground">Replace duplicates</div>
            </button>
            
            <button
              onclick={() => importStrategy = 'keep-both'}
              class="p-3 rounded-lg border text-left transition-all"
              class:border-blue-500={importStrategy === 'keep-both'}
             
            >
              <CopyPlus class="w-4 h-4 mb-1" />
              <div class="text-xs font-medium">Keep Both</div>
              <div class="text-[10px] text-muted-foreground">Add as new</div>
            </button>
            
            <button
              onclick={() => importStrategy = 'replace'}
              class="p-3 rounded-lg border text-left transition-all"
              class:border-blue-500={importStrategy === 'replace'}
             
            >
              <Replace class="w-4 h-4 mb-1" />
              <div class="text-xs font-medium">Replace</div>
              <div class="text-[10px] text-muted-foreground">Overwrite all</div>
            </button>
          </div>
        </div>

        <!-- File Upload Area -->
        <div
          class="relative border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          class:border-blue-500={dragActive}
      
          ondragover={handleDragOver}
          ondragleave={handleDragLeave}
          ondrop={handleDrop}
        >
          <input
            bind:this={fileInput}
            type="file"
            accept=".json,.csv"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onchange={handleFileSelect}
            disabled={isImporting}
          />
          
          {#if isImporting}
            <Loader2 class="w-8 h-8 mx-auto mb-2 animate-spin text-blue-500" />
            <p class="text-sm text-muted-foreground">Processing file...</p>
          {:else}
            <Upload class="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p class="text-sm font-medium">
              Click to upload or drag and drop
            </p>
            <p class="text-xs text-muted-foreground mt-1">
              JSON or CSV files only
            </p>
          {/if}
        </div>

        <div class="text-xs text-muted-foreground">
          <p>⚠️ This will modify your current data based on the selected strategy.</p>
        </div>
      </div>
    {/if}

    <DialogFooter>
      {#if importResult?.success}
        <Button onclick={() => showImportDialog = false} class="w-full">
          Done
        </Button>
      {:else}
        <Button variant="outline" onclick={() => showImportDialog = false}>
          Cancel
        </Button>
        <!-- Upload button is handled by file input above -->
      {/if}
    </DialogFooter>
  </DialogContent>
</Dialog>