<script>
  import { onMount, onDestroy } from 'svelte';
  import { Line } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
  } from 'chart.js';

  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale
  );

  export let data = [];
  export let label = "Metric";
  export let color = "#4f46e5";

  let chartData = {
    labels: [],
    datasets: [
      {
        label,
        data: [],
        borderColor: color,
        backgroundColor: color + "20",
        fill: true,
        tension: 0.4,
        pointRadius: 0
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { size: 10 } }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    animation: { duration: 0 }
  };

  $: if (data) {
    chartData = {
      labels: data.map((_, i) => i),
      datasets: [
        {
          ...chartData.datasets[0],
          data: data
        }
      ]
    };
  }
</script>

<div class="h-32 w-full">
  <Line {data} {chartData} {options} />
</div>
