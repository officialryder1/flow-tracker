<script lang="ts">
  import ExpenseForm from "$lib/components/ExpenseForm.svelte";
  import ExpenseList from "$lib/components/ExpenseList.svelte";
  import SummaryCards from "$lib/components/SummaryCard.svelte";
  import CategoryPieChart from "$lib/components/CategoryPieChart.svelte";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import CategoryManager from "$lib/components/CategoryManager.svelte";
  import { Wallet, TrendingUp, PieChart, Settings, Sparkles } from "@lucide/svelte";
  
  
  let activeTab = "overview";
</script>

<div class="container mx-auto px-4 py-8 max-w-7xl">
  <!-- Animated Header -->
  <div class="relative mb-12">
  <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl -z-10"></div>
  <div class="flex items-center justify-between">
    <div class="space-y-2">
      <div class="flex items-center gap-3">
        <div class="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
          <Wallet class="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 class="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Flow
          </h1>
          <p class="text-sm font-medium text-muted-foreground tracking-wider uppercase">Financial Intelligence</p>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3">
      <!-- Currency is now in the layout, but keep this if you want dual placement -->
      <div class="px-4 py-2 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur border shadow-sm">
        <span class="text-sm font-medium flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-yellow-500" />
          Track. Analyze. Grow.
        </span>
      </div>
    </div>
  </div>
</div>

  <!-- Main Grid -->
  <div class="grid gap-8 lg:grid-cols-12">

    <!-- Left Column - Quick Add -->
    <div class="lg:col-span-4 space-y-6">
      <div class="sticky top-6">
        <div class="relative group">
          <div class="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div class="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">

            <ExpenseForm />
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column - Overview -->
    <div class="lg:col-span-8 space-y-8">
      <!-- Summary Cards with Animation -->
      <div class="grid gap-6 lg:grid-cols-3">
        <SummaryCards />
      </div>
      
      <!-- Chart Card -->
      <div class="relative">
        <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl blur-2xl"></div>
        <div class="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6">
          <CategoryPieChart />
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs Section -->
  <div class="mt-12">
    <Tabs bind:value={activeTab} class="space-y-3">
      <div class="border-b border-slate-200 dark:border-slate-800">
        <TabsList class="w-full justify-start bg-transparent h-auto p-0 space-x-3">
          <TabsTrigger 
            value="overview" 
            class="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400"
          >
            <TrendingUp class="w-4 h-4 mr-2" />
            Recent Activity
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            class="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-purple-500 rounded-none bg-transparent data-[state=active]:shadow-none data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400"
          >
            <PieChart class="w-4 h-4 mr-2" />
            <a href="/analytics">Analytics</a>
          </TabsTrigger>
          <TabsTrigger 
            value="categories" 
            class="px-4 py-3 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none bg-transparent data-[state=active]:shadow-none data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400"
          >
            <Settings class="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview" class="mt-6">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6">
          <ExpenseList />
        </div>
      </TabsContent>
      
      <TabsContent value="analytics" class="mt-6">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6">
          <!-- Your analytics content -->
        </div>
      </TabsContent>
      
      <TabsContent value="categories" class="mt-6">
        <div class="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6">
          <CategoryManager />
        </div>
      </TabsContent>
    </Tabs>
  </div>
  
  <!-- Footer -->
  <footer class="mt-16 text-center">
    <p class="text-sm text-muted-foreground">
      Flow — Track your money, understand your habits, achieve your goals.
    </p>
  </footer>
</div>