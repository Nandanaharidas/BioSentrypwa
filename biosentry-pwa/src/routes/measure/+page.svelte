<script>
    import { onMount, onDestroy } from "svelte";
    import {
        Activity,
        Camera,
        AlertTriangle,
        PhoneCall,
        ArrowLeft,
    } from "lucide-svelte";
    import RealTimeChart from "$lib/components/RealTimeChart.svelte";
    import { fade, slide } from "svelte/transition";

    let isMeasuring = false;
    let metricsData = {
        temp: [],
        pressure: [],
        o2: [],
        skin_conductance: [],
    };

    let currentMetrics = {
        temp: 0,
        pressure: 0,
        o2: 0,
        skin_conductance: 0,
    };

    let severity = "Low";
    let interval;
    let showEmergencyPopup = false;

    async function fetchMetrics() {
        try {
            const res = await fetch("http://localhost:3001/metrics");
            const data = await res.json();

            currentMetrics = {
                temp: data.temp,
                pressure: data.pressure,
                o2: data.o2,
                skin_conductance: data.skin_conductance,
            };

            // Keep only last 20 points
            metricsData.temp = [...metricsData.temp.slice(-19), data.temp];
            metricsData.pressure = [
                ...metricsData.pressure.slice(-19),
                data.pressure,
            ];
            metricsData.o2 = [...metricsData.o2.slice(-19), data.o2];
            metricsData.skin_conductance = [
                ...metricsData.skin_conductance.slice(-19),
                data.skin_conductance,
            ];

            // Simple severity logic
            if (data.temp > 38 || data.o2 < 92) {
                severity = "High";
                showEmergencyPopup = true;
            } else if (data.temp > 37.5 || data.o2 < 95) {
                severity = "Medium";
            } else {
                severity = "Low";
            }
        } catch (e) {
            console.error("Failed to fetch metrics from IoT device", e);
        }
    }

    function toggleMeasurement() {
        isMeasuring = !isMeasuring;
        if (isMeasuring) {
            interval = setInterval(fetchMetrics, 1000);
        } else {
            clearInterval(interval);
        }
    }

    onDestroy(() => {
        if (interval) clearInterval(interval);
    });
</script>

<div in:fade class="space-y-6">
    <div class="flex items-center gap-4">
        <a
            href="/dashboard"
            class="p-2 glass hover:bg-surface transition-colors"
        >
            <ArrowLeft size={20} />
        </a>
        <h1 class="text-2xl font-bold">Measure Drug Metrics</h1>
    </div>

    <div class="glass p-6 flex flex-col items-center">
        <div
            class="w-20 h-20 rounded-full flex items-center justify-center mb-4 {isMeasuring
                ? 'bg-red-500/20 animate-pulse'
                : 'bg-primary/20'}"
        >
            <Activity
                class={isMeasuring ? "text-red-500" : "text-primary"}
                size={40}
            />
        </div>
        <button
            on:click={toggleMeasurement}
            class="btn {isMeasuring
                ? 'btn-outline border-red-500 text-red-500'
                : 'btn-primary'} w-full max-w-xs"
        >
            {isMeasuring ? "Stop Measuring" : "Connect to Device & Start"}
        </button>
    </div>

    {#if isMeasuring}
        <div transition:slide class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="glass p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-text-muted"
                        >Temperature</span
                    >
                    <span class="text-xl font-bold"
                        >{currentMetrics.temp}°C</span
                    >
                </div>
                <RealTimeChart
                    data={metricsData.temp}
                    label="Temp"
                    color="#f87171"
                />
            </div>

            <div class="glass p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-text-muted"
                        >Blood Pressure</span
                    >
                    <span class="text-xl font-bold"
                        >{currentMetrics.pressure} mmHg</span
                    >
                </div>
                <RealTimeChart
                    data={metricsData.pressure}
                    label="Pressure"
                    color="#60a5fa"
                />
            </div>

            <div class="glass p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-text-muted"
                        >O2 Level</span
                    >
                    <span class="text-xl font-bold">{currentMetrics.o2}%</span>
                </div>
                <RealTimeChart
                    data={metricsData.o2}
                    label="O2"
                    color="#34d399"
                />
            </div>

            <div class="glass p-4">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-text-muted"
                        >Skin Conductance</span
                    >
                    <span class="text-xl font-bold"
                        >{currentMetrics.skin_conductance} μS</span
                    >
                </div>
                <RealTimeChart
                    data={metricsData.skin_conductance}
                    label="Skin"
                    color="#fbbf24"
                />
            </div>
        </div>

        <div transition:slide class="glass p-6 space-y-4">
            <div class="flex justify-between items-center">
                <h3 class="font-bold flex items-center gap-2">
                    <AlertTriangle
                        class={severity === "Low"
                            ? "text-green-400"
                            : severity === "Medium"
                              ? "text-yellow-400"
                              : "text-red-500"}
                    />
                    ADR Severity:
                    <span
                        class={severity === "High"
                            ? "text-red-500 animate-pulse"
                            : ""}>{severity}</span
                    >
                </h3>
                <button class="btn btn-outline flex items-center gap-2">
                    <Camera size={18} />
                    Record Video
                </button>
            </div>

            <textarea
                class="input h-24 resize-none"
                placeholder="Add additional comments or symptoms..."
            ></textarea>

            <button
                class="btn btn-outline border-accent text-accent w-full flex items-center justify-center gap-2"
            >
                <PhoneCall size={18} />
                Emergency Help
            </button>
        </div>
    {/if}

    {#if showEmergencyPopup}
        <div
            class="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
        >
            <div class="glass max-w-sm w-full p-8 text-center border-red-500">
                <div
                    class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <PhoneCall class="text-red-500" size={32} />
                </div>
                <h2 class="text-2xl font-bold text-red-500 mb-2">
                    High Severity Detected!
                </h2>
                <p class="text-text-muted mb-6">
                    Your metrics indicate a potential adverse reaction. Please
                    contact emergency services immediately.
                </p>
                <div class="flex flex-col gap-3">
                    <button
                        class="btn bg-red-500 hover:bg-red-600 text-white font-bold py-4"
                        >CALL EMERGENCY (911/112)</button
                    >
                    <button
                        on:click={() => (showEmergencyPopup = false)}
                        class="btn btn-outline">Dismiss</button
                    >
                </div>
            </div>
        </div>
    {/if}
</div>
