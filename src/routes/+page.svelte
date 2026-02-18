<script lang="ts">
  import ExpenseForm from "$lib/components/ExpenseForm.svelte";
  import ExpenseList from "$lib/components/ExpenseList.svelte";
  import SummaryCards from "$lib/components/SummaryCard.svelte";
  import CategoryPieChart from "$lib/components/CategoryPieChart.svelte";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Button } from "$lib/components/ui/button";
  import CategoryManager from "$lib/components/CategoryManager.svelte";
  import { Wallet, TrendingUp, PieChart, Settings, Sparkles, ArrowRight } from "@lucide/svelte";
  import InsightsCard from "$lib/components/analytics/InsightsCard.svelte";
  import ChartGrid from "$lib/components/analytics/ChartGrid.svelte";

 
  let activeTab = $state("overview");
</script>

<div class="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
  <!-- Animated Header - Mobile Optimized -->
  <div class="relative mb-8 sm:mb-12">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10"></div>
    
    <!-- Stack on mobile, row on desktop -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="space-y-2">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 shrink-0">
            <Wallet class="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          
          <div class="min-w-0">
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent truncate">
              Flow
            </h1>
            <p class="text-xs sm:text-sm font-medium text-muted-foreground tracking-wider uppercase">Financial Intelligence</p>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-auto">
        <div class="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur border shadow-sm">
          <span class="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 whitespace-nowrap">
            <Sparkles class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 shrink-0" />
            <span class="hidden xs:inline">Track. Analyze. Grow.</span>
            <span class="xs:hidden">Flow</span>
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Main Grid - Stack on mobile, columns on desktop -->
  <div class="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
    <!-- Left Column - Quick Add (Full width on mobile) -->
    <div class="lg:col-span-4 w-full">
      <div class="lg:sticky lg:top-6">
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
            <ExpenseForm />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column - Overview (Full width on mobile) -->
    <div class="lg:col-span-8 w-full space-y-6 lg:space-y-8">
      <!-- Summary Cards - Stack on mobile, grid on tablet+ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <SummaryCards />
      </div>
      
      <!-- Chart Card -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-2xl"></div>
        <div class="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-4 sm:p-6">
          <CategoryPieChart />
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs Section - Mobile Optimized -->
  <div class="mt-8 sm:mt-12 w-full">
    <Tabs bind:value={activeTab} class="space-y-3">
      <div class="border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        <TabsList class="w-max sm:w-full flex justify-start bg-transparent h-auto border-b-0 min-w-full sm:min-w-0">
          <TabsTrigger 
            value="overview" 
            class="px-3 sm:px-4 py-2 sm:py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 text-sm sm:text-base whitespace-nowrap"
          >
            <TrendingUp class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
            <span>Recent Activity</span>
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            class="px-3 sm:px-4 py-2 sm:py-3 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent data-[state=active]:shadow-none data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 text-sm sm:text-base whitespace-nowrap"
          >
            <PieChart class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
            <span class="inline-block">Analytics</span>
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            class="px-3 sm:px-4 py-2 sm:py-3 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 text-sm sm:text-base whitespace-nowrap"
          >
            <Settings class="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 shrink-0" />
            <span>Categories</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" class="mt-6">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6">
          <!-- Recent Transactions Header with View All button -->
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-semibold">Recent Transactions</h3>
              <p class="text-sm text-muted-foreground">Your last 10 expenses</p>
            </div>
            <a href="/transactions">
              <Button variant="outline" class="gap-2">
                View All
                <ArrowRight class="w-4 h-4" />
              </Button>
            </a>
          </div>
          
          <!-- Recent Transactions List (only 10) -->
          <ExpenseList limit={10} />
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" class="mt-4 sm:mt-6">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-3 sm:p-6">
        <a href="/analytics" class="inline-flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors">
          <Button variant="ghost" size="sm" class="gap-2">
            <ArrowRight class="w-4 h-4" />
            View Full Analytics
          </Button>
        </a>
          <InsightsCard />
          <ChartGrid period="week" />
        </div>
      </TabsContent>
      
      <TabsContent value="categories" class="mt-4 sm:mt-6">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-3 sm:p-6">
          <CategoryManager />
        </div>
      </TabsContent>
    </Tabs>
  </div>
  
  <!-- Footer -->
  <footer class="mt-12 sm:mt-16 text-center px-4">

    <p>
      &copy; {new Date().getFullYear()} Flow. made with 💖 by 
      <a href="https://rydertech.ng" class="text-xs text-blue-500 hover:underline">Rydertech</a>
    </p>
  </footer>
</div>

<style>
  @media (max-width: 480px) {
    .xs\:inline {
      display: inline;
    }
    .xs\:hidden {
      display: none;
    }
  }
</style>