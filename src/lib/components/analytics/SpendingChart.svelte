<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { expenses } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  
  export let period: 'week' | 'month' | 'year' = 'week';
  
  let canvas: HTMLCanvasElement;
  let chart: Chart;
  
  // Process data based on period
  $: chartData = processData($expenses, period);
  $: currentCurrency = $currencyConfig;
  
  function processData(expenses: any[], period: string) {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];
    
    if (period === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayTotal = expenses
          .filter(e => {
            const eDate = new Date(e.date);
            return eDate.toDateString() === date.toDateString();
          })
          .reduce((sum, e) => sum + e.amount, 0); // Amount in USD
        
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
        
        const weekTotal = expenses
          .filter(e => {
            const eDate = new Date(e.date);
            return eDate >= startDate && eDate <= endDate;
          })
          .reduce((sum, e) => sum + e.amount, 0); // Amount in USD
        
        data.push(weekTotal);
      }
    } else {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
        
        const monthTotal = expenses
          .filter(e => {
            const eDate = new Date(e.date);
            return eDate.getMonth() === date.getMonth() && 
                   eDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, e) => sum + e.amount, 0); // Amount in USD
        
        data.push(monthTotal);
      }
    }
    
    return { labels, data };
  }
  
  // Format currency for display (converts USD to selected currency)
  function formatCurrencyForDisplay(usdAmount: number) {
    // Convert USD to selected currency
    const convertedAmount = currentCurrency.code === 'USD' 
      ? usdAmount 
      : usdAmount * 1500; // 1 USD = 1500 NGN
    
    return new Intl.NumberFormat(currentCurrency.code === 'USD' ? 'en-US' : 'en-NG', {
      style: 'currency',
      currency: currentCurrency.code,
      minimumFractionDigits: currentCurrency.code === 'USD' ? 2 : 0,
      maximumFractionDigits: currentCurrency.code === 'USD' ? 2 : 0
    }).format(convertedAmount);
  }
  
  function createChart() {
    if (chart) chart.destroy();
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Spending',
          data: chartData.data,
          borderColor: 'rgb(99, 102, 241)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(99, 102, 241)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
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
                return formatCurrencyForDisplay(context.raw as number);
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return formatCurrencyForDisplay(value as number);
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

<div class="w-full h-80">
  {#if chartData.data.some(v => v > 0)}
    <canvas bind:this={canvas}></canvas>
  {:else}
    <div class="h-full flex items-center justify-center">
      <p class="text-muted-foreground">No spending data for this period</p>
    </div>
  {/if}
</div>