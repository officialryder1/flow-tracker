<script lang="ts">
  import { categories } from "$lib/store/expenseStore";
  import { addCategory, updateCategory, deleteCategory } from "$lib/store/expenseStore";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "$lib/components/ui/dialog";
  import { Pencil, Trash2, Plus } from "@lucide/svelte";
  
  let showAddDialog = $state(false);
  let showEditDialog = $state(false);
  let editingCategory = $state<any>(null);
  let categoryName = $state("");
  let categoryColor = $state("#FF6B6B");
  let categoryBudget = $state("");
  
  function resetForm() {
    categoryName = "";
    categoryColor = "#FF6B6B";
    categoryBudget = "";
    editingCategory = null;
  }
  
  function handleEdit(category: any) {
    editingCategory = category;
    categoryName = category.name;
    categoryColor = category.color;
    categoryBudget = category.budget?.toString() || "";
    showEditDialog = true;
  }
  
  function handleAddSubmit() {
    addCategory({
      name: categoryName,
      icon: "more-horizontal",
      color: categoryColor,
      budget: categoryBudget ? parseFloat(categoryBudget) : undefined
    });
    
    resetForm();
    showAddDialog = false;
  }
  
  function handleEditSubmit() {
    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: categoryName,
        color: categoryColor,
        budget: categoryBudget ? parseFloat(categoryBudget) : undefined
      });
    }
    
    resetForm();
    showEditDialog = false;
  }
</script>

<div class="space-y-4">
  <div class="flex justify-between items-center">
    <h2 class="text-2xl font-bold">Categories</h2>
    
    <!-- Add Category Dialog - FIXED: Button is outside DialogTrigger -->
    <Dialog bind:open={showAddDialog}>
      <DialogTrigger>
        <!-- This button is the trigger - no nested buttons -->
        <Button onclick={() => resetForm()}>
          <Plus class="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new spending category.
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="add-category-name">Name</Label>
            <Input 
              id="add-category-name"
              bind:value={categoryName} 
              placeholder="e.g., Groceries" 
            />
          </div>
          
          <div class="space-y-2">
            <Label for="add-category-color">Color</Label>
            <div class="flex gap-2">
              <div class="flex gap-2">
                <input 
                  id="add-category-color-picker"
                  type="color" 
                  value={categoryColor}
                  onchange={(e) => { categoryColor = e.currentTarget.value; }}
                  class="w-20 h-10 cursor-pointer rounded-md border border-input"
                />
                <input 
                  id="add-category-color-hex"
                  type="text"
                  value={categoryColor}
                  oninput={(e) => { categoryColor = e.currentTarget.value; }}
                  onchange={(e) => { categoryColor = e.currentTarget.value; }}
                  placeholder="#000000"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="add-category-budget">Monthly Budget (Optional)</Label>
            <Input 
              id="add-category-budget"
              type="number" 
              step="0.01"
              bind:value={categoryBudget}
              placeholder="e.g., 500"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onclick={() => showAddDialog = false}>
            Cancel
          </Button>
          <Button onclick={handleAddSubmit}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    <!-- Edit Category Dialog - FIXED: Separate dialog for editing -->
    <Dialog bind:open={showEditDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Modify this spending category.
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="edit-category-name">Name</Label>
            <Input 
              id="edit-category-name"
              bind:value={categoryName} 
              placeholder="e.g., Groceries" 
            />
          </div>
          
          <div class="space-y-2">
            <Label for="edit-category-color">Color</Label>
            <div class="flex gap-2">
              <input 
                id="edit-category-color-picker"
                type="color" 
                value={categoryColor}
                onchange={(e) => { categoryColor = e.currentTarget.value; }}
                class="w-20 h-10 cursor-pointer rounded-md border border-input"
              />
              <input 
                id="edit-category-color-hex"
                type="text"
                value={categoryColor}
                oninput={(e) => { categoryColor = e.currentTarget.value; }}
                onchange={(e) => { categoryColor = e.currentTarget.value; }}
                placeholder="#000000"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          
          <div class="space-y-2">
            <Label for="edit-category-budget">Monthly Budget (Optional)</Label>
            <Input 
              id="edit-category-budget"
              type="number" 
              step="0.01"
              bind:value={categoryBudget}
              placeholder="e.g., 500"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onclick={() => showEditDialog = false}>
            Cancel
          </Button>
          <Button onclick={handleEditSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
  
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each $categories as category}
      <div class="p-4 border rounded-lg space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div 
              class="w-4 h-4 rounded-full" 
              style="background-color: {category.color}"
            ></div>
            <span class="font-medium">{category.name}</span>
          </div>
          <div class="flex gap-1">
            <!-- FIXED: Regular button that opens edit dialog, not wrapped in DialogTrigger -->
            <Button 
              variant="ghost" 
              size="sm"
              onclick={() => handleEdit(category)}
            >
              <Pencil class="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onclick={() => deleteCategory(category.id)}
              disabled={$categories.length <= 1}
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {#if category.budget}
          <div class="text-sm text-muted-foreground">
            Budget: ${category.budget.toFixed(2)}/month
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>