<script lang="ts">
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  
  export let type: 'line' | 'bar' | 'doughnut' | 'pie' = 'line';
  export let data: any;
  export let options: any = {};
  
  let canvas: HTMLCanvasElement;
  let chart: Chart;
  
  function createChart() {
    if (chart) chart.destroy();
    
    chart = new Chart(canvas, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options
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

<div class="w-full h-full">
  <canvas bind:this={canvas}></canvas>
</div>