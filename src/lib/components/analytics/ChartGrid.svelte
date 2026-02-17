<script lang="ts">
  import ChartWrapper from './ChartWrapper.svelte';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { categories } from '$lib/store/expenseStore';
  
  export let period: 'week' | 'month' | 'year' = 'month';
  let selectedCategory = 'all';
</script>

<div class="space-y-6">
  <!-- Category Filter -->
  <div class="flex items-center gap-3">
    <label for="category-filter" class="text-sm font-medium text-muted-foreground">
      Filter by category:
    </label>
    <select
      id="category-filter"
      bind:value={selectedCategory}
      class="h-9 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <option value="all">All Categories</option>
      {#each $categories as cat}
        <option value={cat.name}>{cat.name}</option>
      {/each}
    </select>
  </div>

  <!-- Chart Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Line Chart - Spending Trend -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-blue-500"></span>
          Spending Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <ChartWrapper 
            type="line" 
            period={period} 
            category={selectedCategory}
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2 text-center">
          {selectedCategory === 'all' ? 'All categories' : selectedCategory} • {period} view
        </p>
      </CardContent>
    </Card>
    
    <!-- Bar Chart - Period Comparison -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          Period Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <ChartWrapper 
            type="bar" 
            period={period} 
            category={selectedCategory}
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2 text-center">
          Compare spending across {period === 'week' ? 'days' : period === 'month' ? 'weeks' : 'months'}
        </p>
      </CardContent>
    </Card>
    
    <!-- Pie Chart - Category Distribution -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-purple-500"></span>
          Category Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <ChartWrapper 
            type="pie" 
            category={selectedCategory === 'all' ? 'all' : selectedCategory}
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2 text-center">
          {selectedCategory === 'all' ? 'All categories' : selectedCategory} breakdown
        </p>
      </CardContent>
    </Card>
    
    <!-- Doughnut Chart - Spending Breakdown -->
    <Card>
      <CardHeader class="pb-2">
        <CardTitle class="text-sm font-medium flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-orange-500"></span>
          Spending Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="h-64">
          <ChartWrapper 
            type="doughnut" 
            category={selectedCategory === 'all' ? 'all' : selectedCategory}
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2 text-center">
          Percentage breakdown by category
        </p>
      </CardContent>
    </Card>
  </div>

  <!-- Summary Stats -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
    <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
      <p class="text-xs text-blue-600 dark:text-blue-400">Line Chart</p>
      <p class="text-sm font-medium">Daily trends</p>
    </div>
    <div class="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
      <p class="text-xs text-green-600 dark:text-green-400">Bar Chart</p>
      <p class="text-sm font-medium">Period comparison</p>
    </div>
    <div class="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
      <p class="text-xs text-purple-600 dark:text-purple-400">Pie Chart</p>
      <p class="text-sm font-medium">Category split</p>
    </div>
    <div class="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30">
      <p class="text-xs text-orange-600 dark:text-orange-400">Doughnut</p>
      <p class="text-sm font-medium">Deep dive</p>
    </div>
  </div>
</div>