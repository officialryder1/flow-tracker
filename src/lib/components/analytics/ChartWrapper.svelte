<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { expenses } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  import { categories } from '$lib/store/expenseStore';
  
  export let type: 'line' | 'bar' | 'doughnut' | 'pie' = 'bar';
  export let period: 'week' | 'month' | 'year' = 'month';
  export let category: string | 'all' = 'all';
  
  let canvas: HTMLCanvasElement;
  let chart: Chart;
  
  // Process data based on chart type
  $: chartData = processChartData();
  
  function processChartData() {
    const now = new Date();
    
    if (type === 'doughnut' || type === 'pie') {
      // Category breakdown
      const byCategory = $expenses.reduce((acc, e) => {
        if (category === 'all' || e.category === category) {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
        }
        return acc;
      }, {} as Record<string, number>);
      
      const sorted = Object.entries(byCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8);
      
      const labels = sorted.map(([cat]) => cat);
      const data = sorted.map(([,amt]) => amt);
      const colors = sorted.map(([cat]) => {
        const catObj = $categories.find(c => c.name === cat);
        return catObj?.color || `hsl(${Math.random() * 360}, 70%, 60%)`;
      });
      
      return { labels, data, colors };
      
    } else if (type === 'line' || type === 'bar') {
      // Time-based data
      let labels: string[] = [];
      let data: number[] = [];
      
      if (period === 'week') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
          
          const dayTotal = $expenses
            .filter(e => {
              if (category !== 'all' && e.category !== category) return false;
              const eDate = new Date(e.date);
              return eDate.toDateString() === date.toDateString();
            })
            .reduce((sum, e) => sum + e.amount, 0);
          
          data.push(dayTotal);
        }
      } else if (period === 'month') {
        // Last 30 days (grouped by week)
        for (let i = 3; i >= 0; i--) {
          const endDate = new Date(now);
          endDate.setDate(endDate.getDate() - (i * 7));
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - 7);
          
          labels.push(`Week ${4 - i}`);
          
          const weekTotal = $expenses
            .filter(e => {
              if (category !== 'all' && e.category !== category) return false;
              const eDate = new Date(e.date);
              return eDate >= startDate && eDate <= endDate;
            })
            .reduce((sum, e) => sum + e.amount, 0);
          
          data.push(weekTotal);
        }
      } else {
        // Last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
          
          const monthTotal = $expenses
            .filter(e => {
              if (category !== 'all' && e.category !== category) return false;
              const eDate = new Date(e.date);
              return eDate.getMonth() === date.getMonth() && 
                     eDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, e) => sum + e.amount, 0);
          
          data.push(monthTotal);
        }
      }
      
      return { labels, data };
    }
    
    return { labels: [], data: [] };
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
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (type === 'doughnut' || type === 'pie') {
      // Pie/Doughnut chart configuration
      chart = new Chart(ctx, {
        type: type,
        data: {
          labels: chartData.labels,
          datasets: [{
            data: chartData.data,
            backgroundColor: chartData.colors || [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
                  const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    } else {
      // Line/Bar chart configuration
      chart = new Chart(ctx, {
        type: type,
        data: {
          labels: chartData.labels,
          datasets: [{
            label: type === 'bar' ? 'Spending by Period' : 'Spending Trend',
            data: chartData.data,
            backgroundColor: type === 'bar' 
              ? 'rgba(59, 130, 246, 0.5)' 
              : 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            tension: type === 'line' ? 0.4 : 0,
            fill: type === 'line' ? true : false,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: type === 'line' ? 4 : 0,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return formatCurrency(context.raw as number);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return formatCurrency(value as number);
                }
              }
            }
          }
        }
      });
    }
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

<div class="w-full h-80">
  {#if chartData.data.length > 0}
    <canvas bind:this={canvas}></canvas>
  {:else}
    <div class="h-full flex items-center justify-center">
      <div class="text-center">
        <p class="text-muted-foreground">No data available</p>
        <p class="text-xs text-muted-foreground mt-1">Add expenses to see charts</p>
      </div>
    </div>
  {/if}
</div>