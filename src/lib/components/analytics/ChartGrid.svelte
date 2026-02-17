<script lang="ts">
  import ChartWrapper from './ChartWrapper.svelte';
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Select } from "$lib/components/ui/select";
  
  export let period: 'week' | 'month' | 'year' = 'month';
  let selectedCategory = 'all';
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Line Chart -->
  <Card>
    <CardHeader>
      <CardTitle class="text-sm">Spending Trend</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartWrapper type="line" period={period} category={selectedCategory} />
    </CardContent>
  </Card>
  
  <!-- Bar Chart -->
  <Card>
    <CardHeader>
      <CardTitle class="text-sm">Period Comparison</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartWrapper type="bar" period={period} category={selectedCategory} />
    </CardContent>
  </Card>
  
  <!-- Pie Chart -->
  <Card>
    <CardHeader>
      <CardTitle class="text-sm">Category Distribution</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartWrapper type="pie" category={selectedCategory} />
    </CardContent>
  </Card>
  
  <!-- Doughnut Chart -->
  <Card>
    <CardHeader>
      <CardTitle class="text-sm">Spending Breakdown</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartWrapper type="doughnut" category={selectedCategory} />
    </CardContent>
  </Card>
</div>