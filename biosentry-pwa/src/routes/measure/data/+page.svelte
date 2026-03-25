<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import Camera from "lucide-svelte/icons/camera";
    import ChevronRight from "lucide-svelte/icons/chevron-right";
    import AlertTriangle from "lucide-svelte/icons/alert-triangle";
    import Fingerprint from "lucide-svelte/icons/fingerprint";
    import RealTimeChart from "$lib/components/RealTimeChart.svelte";
    import { goto } from "$app/navigation";
    import {
        metricsData,
        currentMetrics,
        severity,
        startVitalsFetch,
    } from "$lib/measureStore";

    function startCameraMonitoring() {
        goto("/measure/camera");
    }

    onMount(() => {
        startVitalsFetch();
    });
</script>

<div in:fade class="space-y-6">
    <!-- Finger Detection Status -->
    <div
        class="glass p-3 flex items-center gap-3 {$currentMetrics.finger_detected
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-yellow-500/30 bg-yellow-500/5'}"
    >
        <Fingerprint
            size={20}
            class={$currentMetrics.finger_detected
                ? "text-green-400"
                : "text-yellow-400"}
        />
        <span class="text-sm font-medium">
            {$currentMetrics.finger_detected
                ? "Finger detected — reading vitals"
                : "Place finger on sensor to begin"}
        </span>
    </div>

    <!-- Vitals Grid -->
    <div class="grid grid-cols-2 gap-4">
        <div class="glass p-4 space-y-2">
            <span class="text-[10px] font-bold text-text-muted uppercase"
                >Heart Rate</span
            >
            <div class="text-2xl font-bold">
                {$currentMetrics.bpm.toFixed(0)}
                <span class="text-sm text-text-muted">bpm</span>
            </div>
            <div class="h-16">
                <RealTimeChart
                    data={$metricsData.bpm}
                    label="BPM"
                    color="#f87171"
                />
            </div>
        </div>
        <div class="glass p-4 space-y-2">
            <span class="text-[10px] font-bold text-text-muted uppercase"
                >SpO2</span
            >
            <div class="text-2xl font-bold">
                {$currentMetrics.spo2.toFixed(1)}%
            </div>
            <div class="h-16">
                <RealTimeChart
                    data={$metricsData.spo2}
                    label="SpO2"
                    color="#60a5fa"
                />
            </div>
        </div>
        <div class="glass p-4 space-y-2">
            <span class="text-[10px] font-bold text-text-muted uppercase"
                >Temperature</span
            >
            <div class="text-2xl font-bold">
                {$currentMetrics.temp.toFixed(1)}°C
            </div>
            <div class="h-16">
                <RealTimeChart
                    data={$metricsData.temp}
                    label="Temp"
                    color="#34d399"
                />
            </div>
        </div>
        <div class="glass p-4 space-y-2">
            <span class="text-[10px] font-bold text-text-muted uppercase"
                >EMG</span
            >
            <div class="text-2xl font-bold">
                {$currentMetrics.emg.toFixed(0)}
                <span class="text-sm text-text-muted">mV</span>
            </div>
            <div class="h-16">
                <RealTimeChart
                    data={$metricsData.emg}
                    label="EMG"
                    color="#fbbf24"
                />
            </div>
        </div>
        <div class="glass p-4 space-y-2 col-span-2">
            <span class="text-[10px] font-bold text-text-muted uppercase"
                >GSR (Skin Conductance)</span
            >
            <div class="text-2xl font-bold">
                {$currentMetrics.gsr.toFixed(2)}
                <span class="text-sm text-text-muted">kΩ</span>
            </div>
            <div class="h-16">
                <RealTimeChart
                    data={$metricsData.gsr}
                    label="GSR"
                    color="#a78bfa"
                />
            </div>
        </div>
    </div>

    <!-- Severity Badge -->
    <div
        class="glass p-4 flex justify-between items-center {$severity === 'High'
            ? 'border-red-500/50 bg-red-500/5'
            : ''}"
    >
        <div class="flex items-center gap-3">
            <div
                class="w-3 h-3 rounded-full {$severity === 'Low'
                    ? 'bg-green-500'
                    : $severity === 'Medium'
                      ? 'bg-yellow-500'
                      : 'bg-red-500 animate-pulse'}"
            ></div>
            <span class="font-bold">ADR Severity: {$severity}</span>
        </div>
        <AlertTriangle
            size={20}
            class={$severity === "High" ? "text-red-500" : "text-text-muted"}
        />
    </div>

    <!-- Action -->
    <button
        on:click={startCameraMonitoring}
        class="w-full h-20 glass border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between px-6 group"
    >
        <div class="flex items-center gap-4">
            <div
                class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"
            >
                <Camera size={20} />
            </div>
            <div class="text-left">
                <div class="font-bold">Start Camera Monitoring</div>
                <div class="text-xs text-text-muted">
                    Identify symptoms via vision AI
                </div>
            </div>
        </div>
        <ChevronRight
            class="text-text-muted group-hover:text-primary transition-colors"
        />
    </button>
</div>
