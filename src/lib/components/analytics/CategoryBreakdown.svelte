<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { expenses, categories } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  
  let canvas: HTMLCanvasElement;
  let chart: Chart;
  
  $: categoryData = processCategoryData();
  
  function processCategoryData() {
    const byCategory = $expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const sorted = Object.entries(byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
    
    const otherTotal = Object.entries(byCategory)
      .sort(([,a], [,b]) => b - a)
      .slice(6)
      .reduce((sum, [,amt]) => sum + amt, 0);
    
    let labels = sorted.map(([cat]) => cat);
    let data = sorted.map(([,amt]) => amt);
    let colors = sorted.map(([cat]) => {
      const category = $categories.find(c => c.name === cat);
      return category?.color || '#94A3B8';
    });
    
    if (otherTotal > 0) {
      labels.push('Other');
      data.push(otherTotal);
      colors.push('#94A3B8');
    }
    
    return { labels, data, colors, total: data.reduce((a, b) => a + b, 0) };
  }
  
  function formatCurrency(value: number) {
    const currency = $currencyConfig;
    return new Intl.NumberFormat(currency.code === 'USD' ? 'en-US' : 'en-NG', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'USD' ? 2 : 0
    }).format(value);
  }
  
  function createChart() {
    if (chart) chart.destroy();
    
    chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.data,
          backgroundColor: categoryData.colors,
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw as number;
                const percentage = ((value / categoryData.total) * 100).toFixed(1);
                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  onMount(() => {
    createChart();
    
    return () => {
      if (chart) chart.destroy();
    };
  });
  
  $: {
    if (canvas) {
      createChart();
    }
  }
</script>

<div class="w-full h-80 relative">
  {#if categoryData.data.length > 0}
    <canvas bind:this={canvas}></canvas>
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="text-center">
        <p class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {categoryData.labels.length}
        </p>
        <p class="text-xs text-muted-foreground">Categories</p>
      </div>
    </div>
  {:else}
    <div class="h-full flex items-center justify-center">
      <p class="text-muted-foreground">No data to display</p>
    </div>
  {/if}
</div>