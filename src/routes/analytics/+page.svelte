<script lang="ts">
  import { page } from '$app/stores';

  import ExportButton from "$lib/components/Export.svelte";
  import SpendingChart from "$lib/components/analytics/SpendingChart.svelte";
  import CategoryBreakdown from "$lib/components/analytics/CategoryBreakdown.svelte";
  import InsightsCard from "$lib/components/analytics/InsightsCard.svelte";
  import RecentActivity from "$lib/components/analytics/RecentlyActivity.svelte";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { 
    BarChart3, 
    PieChart, 
    TrendingUp, 
    Calendar,
    Download,
    ArrowLeft,
    RefreshCw
  } from "@lucide/svelte";
  import { expenses } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  import { formatCurrencyReactive } from '$lib/utils/format';
  import ChartWrapper from "$lib/components/analytics/ChartWrapper.svelte";
  
  let selectedPeriod: 'week' | 'month' | 'year' = 'week';
  let selectedView: 'spending' | 'categories' | 'insights' = 'spending';
  let isRefreshing = false;

  
  function refreshData() {
    isRefreshing = true;
    setTimeout(() => {
      isRefreshing = false;
    }, 1000);
  }
  
  $: totalSpent = $expenses.reduce((sum, e) => sum + e.amount, 0);
</script>


<div class="container mx-auto px-4 py-8 max-w-7xl">
  <a href="/" class="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors">
      <Button variant="ghost" size="sm" class="gap-2">
        <ArrowLeft class="w-4 h-4" />
        Back to Dashboard
      </Button>
    </a>
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/25">
          <BarChart3 class="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 class="text-3xl font-bold">Analytics Dashboard</h1>
          <p class="text-muted-foreground">Understand your spending habits</p>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-3">
      <!-- Period Selector -->
      <div class="flex rounded-lg border p-1 bg-white dark:bg-gray-900">
        <button
          onclick={() => selectedPeriod = 'week'}
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-all
            {selectedPeriod === 'week' 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          Week
        </button>
        <button
          onclick={() => selectedPeriod = 'month'}
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-all
            {selectedPeriod === 'month' 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          Month
        </button>
        <button
          onclick={() => selectedPeriod = 'year'}
          class="px-3 py-1.5 text-sm font-medium rounded-md transition-all
            {selectedPeriod === 'year' 
              ? 'bg-blue-500 text-white shadow-sm' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
        >
          Year
        </button>
      </div>
      
      <button
        onclick={refreshData}
        class="p-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        disabled={isRefreshing}
      >
        <RefreshCw class={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
      
      <ExportButton filename="flow-analytics" />
    </div>
  </div>
  
  <!-- Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <Card class="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
      <CardContent class="p-6">
        <p class="text-blue-100 text-sm">Total Spent</p>
        <p class="text-3xl font-bold mt-1">{formatCurrencyReactive(totalSpent, $currencyConfig)}</p>
        <p class="text-blue-100 text-xs mt-2">Lifetime</p>
      </CardContent>
    </Card>
    
    <Card class="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
      <CardContent class="p-6">
        <p class="text-purple-100 text-sm">Transactions</p>
        <p class="text-3xl font-bold mt-1">{$expenses.length}</p>
        <p class="text-purple-100 text-xs mt-2">Total entries</p>
      </CardContent>
    </Card>
    
    <Card class="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
      <CardContent class="p-6">
        <p class="text-green-100 text-sm">Categories</p>
        <p class="text-3xl font-bold mt-1">{new Set($expenses.map(e => e.category)).size}</p>
        <p class="text-green-100 text-xs mt-2">Active</p>
      </CardContent>
    </Card>
    
    <Card class="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
      <CardContent class="p-6">
        <p class="text-orange-100 text-sm">Daily Average</p>
        <p class="text-3xl font-bold mt-1">
          {formatCurrencyReactive(totalSpent / 30 || 0, $currencyConfig)}
        </p>
        <p class="text-orange-100 text-xs mt-2">Last 30 days</p>
      </CardContent>
    </Card>
  </div>
  
  <!-- Main Charts Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
    <!-- Spending Trend Chart - Takes 2 columns -->
    <div class="lg:col-span-2">
      <Card class="overflow-hidden">
        <CardHeader class="border-b">
          <div class="flex items-center justify-between">
            <CardTitle class="flex items-center gap-2">
              <TrendingUp class="w-5 h-5 text-blue-500" />
              Spending Trend
            </CardTitle>
            <div class="text-sm text-muted-foreground">
              {selectedPeriod === 'week' ? 'Last 7 days' : 
               selectedPeriod === 'month' ? 'Last 30 days' : 'Last 12 months'}
            </div>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <SpendingChart period={selectedPeriod} />
        </CardContent>
      </Card>
    </div>
    
    <!-- Category Breakdown - Takes 1 column -->
    <div class="lg:col-span-1">
      <Card class="h-full">
        <CardHeader class="border-b">
          <CardTitle class="flex items-center gap-2">
            <PieChart class="w-5 h-5 text-purple-500" />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <CategoryBreakdown />
        </CardContent>
      </Card>
    </div>
    <div class="lg:col-span-1">
      <Card class="h-full">
        <CardHeader class="border-b">
          <CardTitle class="flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-green-500" />
            Weekly Comparison
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <ChartWrapper type="bar" period={selectedPeriod} />
        </CardContent>
      </Card>
    </div>
  </div>

  
  
  <!-- Insights and Recent Activity -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Insights Cards - Takes 2 columns -->
    <div class="lg:col-span-2">
      <Card>
        <CardHeader class="border-b">
          <CardTitle class="flex items-center gap-2">
            <BarChart3 class="w-5 h-5 text-green-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <InsightsCard />
        </CardContent>
      </Card>
    </div>
    
    <!-- Recent Activity - Takes 1 column -->
    <div class="lg:col-span-1">
      <Card>
        <CardHeader class="border-b">
          <CardTitle class="flex items-center gap-2">
            <Calendar class="w-5 h-5 text-orange-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <RecentActivity />
        </CardContent>
      </Card>
    </div>
  </div>
  
  <!-- Export Options Section -->
  <div class="mt-8 p-6 border rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <Download class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 class="font-semibold">Export Your Data</h3>
          <p class="text-sm text-muted-foreground">Download your financial data for analysis</p>
        </div>
      </div>
      <ExportButton filename="flow-full-export" />
    </div>
  </div>
</div>