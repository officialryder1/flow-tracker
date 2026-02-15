<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { expenses } from '$lib/store/expenseStore';
  import { currencyConfig } from '$lib/store/currencyStore';
  
  export let period: 'week' | 'month' | 'year' = 'month';
  
  let canvas: HTMLCanvasElement;
  let chart: Chart;
  
  // Process data based on period
  $: chartData = processData($expenses, period);
  
  function processData(expenses: any[], period: string) {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];
    
    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayTotal = expenses
          .filter(e => {
            const eDate = new Date(e.date);
            return eDate.toDateString() === date.toDateString();
          })
          .reduce((sum, e) => sum + e.amount, 0);
        
        data.push(dayTotal);
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i -= 3) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        const periodTotal = expenses
          .filter(e => {
            const eDate = new Date(e.date);
            const daysDiff = Math.floor((now.getTime() - eDate.getTime()) / (1000 * 3600 * 24));
            return daysDiff <= i && daysDiff > i - 3;
          })
          .reduce((sum, e) => sum + e.amount, 0);
        
        data.push(periodTotal);
      }
    } else {
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
          .reduce((sum, e) => sum + e.amount, 0);
        
        data.push(monthTotal);
      }
    }
    
    return { labels, data };
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
  
  onMount(() => {
    createChart();
    
    // Cleanup on unmount
    return () => {
      if (chart) chart.destroy();
    };
  });
  
  // Recreate chart when data or period changes
  $: {
    if (canvas) {
      createChart();
    }
  }
</script>

<div class="w-full h-80">
  <canvas bind:this={canvas}></canvas>
</div>