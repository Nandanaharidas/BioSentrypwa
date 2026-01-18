<script>
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";

  let Line;
  let ChartJS;

  if (browser) {
    import("chart.js").then((mod) => {
      ChartJS = mod.Chart;
      const {
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
      } = mod;
      ChartJS.register(
        Title,
        Tooltip,
        Legend,
        LineElement,
        LinearScale,
        PointElement,
        CategoryScale,
      );
    });
    import("svelte-chartjs").then((mod) => {
      Line = mod.Line;
    });
  }

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
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { display: false },
      y: {
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: { color: "#94a3b8", font: { size: 10 } },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    animation: { duration: 0 },
  };

  $: if (data) {
    chartData = {
      labels: data.map((_, i) => i),
      datasets: [
        {
          ...chartData.datasets[0],
          data: data,
        },
      ],
    };
  }
</script>

<div class="h-32 w-full">
  {#if browser && Line}
    <Line {data} {chartData} {options} />
  {:else}
    <div class="h-full w-full bg-surface/20 animate-pulse rounded"></div>
  {/if}
</div>
