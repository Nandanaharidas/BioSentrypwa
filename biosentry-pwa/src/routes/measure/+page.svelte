<script>
    import { onMount, onDestroy } from "svelte";
    import {
        Activity,
        Camera,
        AlertTriangle,
        PhoneCall,
        ArrowLeft,
        CheckCircle2,
        Zap,
        Circle,
        X,
        ChevronRight,
        History,
    } from "lucide-svelte";
    import { selectedMedicationStore } from "$lib/medicationStore";
    import RealTimeChart from "$lib/components/RealTimeChart.svelte";
    import { fade, slide, scale } from "svelte/transition";
    import { goto } from "$app/navigation";

    // Stage management: 'pairing' | 'data' | 'camera' | 'confirmation' | 'thankyou' | 'risk'
    let currentStage = "pairing";
    let isPaired = false;
    let isPairing = false;

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
    let metricInterval;
    let showEmergencyPopup = false;

    // Camera logic
    let videoElement;
    let stream;
    let isRecording = false;
    let recordingTime = 6;
    let recordingInterval;

    async function startPairing() {
        isPairing = true;
        // Simulate pairing process
        setTimeout(() => {
            isPairing = false;
            isPaired = true;
        }, 2500);
    }

    async function activateMonitoring() {
        currentStage = "data";
        startVitalsFetch();
    }

    async function startCameraMonitoring() {
        currentStage = "camera";
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
            });
            if (videoElement) videoElement.srcObject = stream;

            isRecording = true;
            recordingTime = 6;
            recordingInterval = setInterval(() => {
                recordingTime--;
                if (recordingTime <= 0) {
                    stopRecording();
                }
            }, 1000);
        } catch (err) {
            console.error("Camera access denied", err);
        }
    }

    function stopRecording() {
        isRecording = false;
        clearInterval(recordingInterval);
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    }

    function handleEndSession() {
        stopRecording();
        stopVitalsFetch();
        currentStage = "confirmation";
    }

    function confirmSessionEnd(isOver) {
        if (isOver) {
            currentStage = "thankyou";
            setTimeout(() => {
                currentStage = "risk";
            }, 2000);
        } else {
            currentStage = "data";
            startVitalsFetch();
        }
    }

    let showRiskAlert = true;

    function finish() {
        goto("/dashboard");
    }

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

            if (data.temp > 38 || data.o2 < 92) {
                severity = "High";
                showEmergencyPopup = true;
            } else if (data.temp > 37.5 || data.o2 < 95) {
                severity = "Medium";
            } else {
                severity = "Low";
            }
        } catch (e) {
            console.error("Failed to fetch metrics", e);
        }
    }

    function startVitalsFetch() {
        isMeasuring = true;
        metricInterval = setInterval(fetchMetrics, 1000);
    }

    function stopVitalsFetch() {
        isMeasuring = false;
        clearInterval(metricInterval);
    }

    onMount(() => {
        startPairing();
    });

    onDestroy(() => {
        stopVitalsFetch();
        stopRecording();
    });
</script>

<div in:fade class="max-w-md mx-auto space-y-6 pb-24">
    <!-- Header (Hidden in summary stages) -->
    {#if !["thankyou", "risk", "confirmation"].includes(currentStage)}
        <div class="flex items-center justify-between py-4">
            <div class="flex items-center gap-4">
                <button
                    on:click={() =>
                        currentStage === "pairing"
                            ? goto("/measure/select")
                            : (currentStage = "pairing")}
                    class="p-2 glass hover:bg-surface transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 class="text-xl font-bold">
                    {#if currentStage === "pairing"}Pairing Device{:else if currentStage === "data"}Vitals
                        Data{:else}Camera Monitoring{/if}
                </h1>
            </div>

            {#if $selectedMedicationStore}
                <div
                    class="glass px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border-primary/20"
                >
                    {$selectedMedicationStore.name}
                </div>
            {/if}
        </div>
    {/if}

    <!-- STAGE 1: PAIRING -->
    {#if currentStage === "pairing"}
        <div
            class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8"
        >
            <div class="relative">
                {#if isPairing}
                    <div
                        class="absolute inset-0 bg-primary/20 rounded-full animate-ping"
                    ></div>
                {/if}
                <div
                    class="w-32 h-32 rounded-full glass border-2 flex items-center justify-center relative z-10 {isPaired
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-primary/50'}"
                >
                    {#if isPaired}
                        <div in:scale>
                            <CheckCircle2 size={64} class="text-green-500" />
                        </div>
                    {:else if isPairing}
                        <Activity
                            size={48}
                            class="text-primary animate-pulse"
                        />
                    {:else}
                        <Zap size={48} class="text-text-muted" />
                    {/if}
                </div>
            </div>

            <div class="space-y-2">
                <h2 class="text-3xl font-extrabold tracking-tight">
                    {#if isPairing}Connecting...{:else if isPaired}Pairing
                        Successful{:else}Connection Failed{/if}
                </h2>
                <p class="text-text-muted">
                    {#if isPairing}Establishing secure connection to your
                        wearable...{:else if isPaired}Device linked and
                        calibrated. Ready to monitor.{:else}Unknown error
                        occurred while pairing.{/if}
                </p>
            </div>

            <button
                on:click={activateMonitoring}
                disabled={!isPaired}
                class="btn btn-primary w-full h-16 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95"
            >
                Activate monitoring
            </button>
        </div>
    {/if}

    <!-- STAGE 2: DATA -->
    {#if currentStage === "data"}
        <div in:fade class="space-y-6">
            <!-- Vitals Grid -->
            <div class="grid grid-cols-2 gap-4">
                <div class="glass p-4 space-y-2">
                    <span
                        class="text-[10px] font-bold text-text-muted uppercase"
                        >Temperature</span
                    >
                    <div class="text-2xl font-bold">
                        {currentMetrics.temp}°C
                    </div>
                    <div class="h-16">
                        <RealTimeChart
                            data={metricsData.temp}
                            label="Temp"
                            color="#f87171"
                        />
                    </div>
                </div>
                <div class="glass p-4 space-y-2">
                    <span
                        class="text-[10px] font-bold text-text-muted uppercase"
                        >Blood Pressure</span
                    >
                    <div class="text-2xl font-bold">
                        {currentMetrics.pressure}
                    </div>
                    <div class="h-16">
                        <RealTimeChart
                            data={metricsData.pressure}
                            label="BP"
                            color="#60a5fa"
                        />
                    </div>
                </div>
                <div class="glass p-4 space-y-2">
                    <span
                        class="text-[10px] font-bold text-text-muted uppercase"
                        >O2 Level</span
                    >
                    <div class="text-2xl font-bold">{currentMetrics.o2}%</div>
                    <div class="h-16">
                        <RealTimeChart
                            data={metricsData.o2}
                            label="O2"
                            color="#34d399"
                        />
                    </div>
                </div>
                <div class="glass p-4 space-y-2">
                    <span
                        class="text-[10px] font-bold text-text-muted uppercase"
                        >Skin Conductance</span
                    >
                    <div class="text-2xl font-bold">
                        {currentMetrics.skin_conductance}μS
                    </div>
                    <div class="h-16">
                        <RealTimeChart
                            data={metricsData.skin_conductance}
                            label="GSR"
                            color="#fbbf24"
                        />
                    </div>
                </div>
            </div>

            <!-- Severity Badge -->
            <div
                class="glass p-4 flex justify-between items-center {severity ===
                'High'
                    ? 'border-red-500/50 bg-red-500/5'
                    : ''}"
            >
                <div class="flex items-center gap-3">
                    <div
                        class="w-3 h-3 rounded-full {severity === 'Low'
                            ? 'bg-green-500'
                            : severity === 'Medium'
                              ? 'bg-yellow-500'
                              : 'bg-red-500 animate-pulse'}"
                    ></div>
                    <span class="font-bold">ADR Severity: {severity}</span>
                </div>
                <AlertTriangle
                    size={20}
                    class={severity === "High"
                        ? "text-red-500"
                        : "text-text-muted"}
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
    {/if}

    <!-- STAGE 3: CAMERA -->
    {#if currentStage === "camera"}
        <div in:fade class="space-y-6">
            <div
                class="glass aspect-[3/4] rounded-3xl overflow-hidden relative border-white/20"
            >
                <!-- Video Feed -->
                <video
                    bind:this={videoElement}
                    autoplay
                    playsinline
                    muted
                    class="w-full h-full object-cover grayscale brightness-110"
                ></video>

                <!-- Overlay -->
                <div
                    class="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between"
                >
                    <div class="flex justify-between items-start">
                        {#if isRecording}
                            <div
                                class="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse"
                            >
                                <Circle size={10} fill="currentColor" /> REC
                            </div>
                            <div
                                class="glass px-3 py-1 text-xs font-bold border-white/40"
                            >
                                00:0{recordingTime}s
                            </div>
                        {:else}
                            <div
                                class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                            >
                                CAPTURE COMPLETE
                            </div>
                        {/if}
                    </div>

                    <div class="space-y-2 text-center">
                        <div
                            class="bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10"
                        >
                            <p class="text-sm font-medium">
                                Keep your face and upper body visible
                            </p>
                            <p class="text-[10px] text-white/60">
                                Detecting: stress, symptom, shivering, body
                                posture
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="glass p-6 space-y-4">
                <div class="flex items-center gap-4">
                    <div
                        class="w-12 h-12 rounded-xl bg-surface flex items-center justify-center"
                    >
                        <Activity class="text-primary" />
                    </div>
                    <div>
                        <div class="font-bold">Vision AI Active</div>
                        <div class="text-xs text-text-muted">
                            Analyzing micro-symptoms in real-time
                        </div>
                    </div>
                </div>

                <button
                    on:click={handleEndSession}
                    class="w-full h-16 rounded-2xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all active:scale-95"
                >
                    End Session
                </button>
            </div>
        </div>
    {/if}

    <!-- STAGE 4: CONFIRMATION -->
    {#if currentStage === "confirmation"}
        <div
            in:scale
            class="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12"
        >
            <h2 class="text-4xl font-black tracking-tight">
                Is today's session over?
            </h2>
            <div class="grid grid-cols-2 gap-4 w-full px-4">
                <button
                    on:click={() => confirmSessionEnd(true)}
                    class="glass h-20 text-2xl font-bold border-primary/20 hover:bg-primary/10 transition-all"
                    >Yes</button
                >
                <button
                    on:click={() => confirmSessionEnd(false)}
                    class="glass h-20 text-2xl font-bold border-white/10 hover:bg-white/10 transition-all"
                    >No</button
                >
            </div>
            <button
                on:click={() => (currentStage = "risk")}
                class="glass p-4 px-8 rounded-full border-green-500/30 bg-green-500/5 text-green-400 font-bold hover:bg-green-500/10 transition-all active:scale-95"
            >
                Overall session completed!
            </button>
        </div>
    {/if}

    <!-- STAGE 5: THANK YOU -->
    {#if currentStage === "thankyou"}
        <div
            in:fade
            out:fade
            class="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8"
        >
            <h2 class="text-5xl font-black">Thank you!</h2>
            <div
                class="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.2)]"
            >
                <div in:scale={{ delay: 200 }}>
                    <CheckCircle2 size={64} class="text-green-500" />
                </div>
            </div>
            <p class="text-2xl text-text-muted italic font-medium">
                Have a great day!
            </p>
        </div>
    {/if}

    <!-- STAGE 6: RISK PREDICTION -->
    {#if currentStage === "risk"}
        <div in:fade class="space-y-6 pt-6 px-2">
            <!-- Title & Line -->
            <div class="space-y-4 relative">
                <button
                    class="absolute top-0 right-0 p-2 text-text-muted hover:text-primary transition-colors"
                    on:click={() => goto("/dashboard")}
                >
                    <History size={24} />
                </button>
                <h2 class="text-3xl font-bold tracking-tight text-white">
                    ADR Risk Prediction
                </h2>
                <div class="h-[1px] w-full bg-white/20"></div>
            </div>

            <!-- Radio Options style selection -->
            <div class="space-y-4 py-4">
                {#each ["Low", "Medium", "High"] as level}
                    <div
                        class="flex items-center gap-4 transition-opacity {severity ===
                        level
                            ? 'opacity-100'
                            : 'opacity-40'}"
                    >
                        <div
                            class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center relative"
                        >
                            {#if severity === level}
                                <div
                                    class="w-5 h-5 bg-white rounded-full flex items-center justify-center"
                                >
                                    <div
                                        in:scale
                                        class="w-2 h-2 bg-black rounded-full"
                                    ></div>
                                </div>
                            {/if}
                        </div>
                        <span class="text-2xl font-bold">{level}</span>
                    </div>
                {/each}
            </div>

            <!-- Alert Box (matching wireframe) -->
            {#if severity === "High" && showRiskAlert}
                <div
                    in:scale
                    class="bg-white rounded-[40px] p-8 space-y-6 relative text-black shadow-2xl"
                >
                    <button
                        on:click={() => (showRiskAlert = false)}
                        class="absolute top-6 right-8 text-black/40 hover:text-black transition-colors"
                    >
                        <X size={28} />
                    </button>

                    <div class="text-center space-y-2 pt-2">
                        <h3 class="text-3xl font-black">High ADR Risk</h3>
                        <p class="text-xl font-medium">
                            Please consult a doctor!
                        </p>
                    </div>

                    <button
                        on:click={() => (showRiskAlert = false)}
                        class="w-40 bg-zinc-200 hover:bg-zinc-300 text-black font-bold h-14 rounded-2xl mx-auto block text-xl border border-black/10 shadow-sm"
                    >
                        OK
                    </button>
                </div>
            {/if}

            <!-- Bottom Buttons (matching wireframe) -->
            <div class="pt-8 grid grid-cols-2 gap-4">
                <button
                    class="bg-zinc-100 hover:bg-zinc-200 text-black font-bold h-16 rounded-2xl flex items-center justify-center gap-2 text-lg border border-zinc-300 shadow-sm"
                >
                    <PhoneCall size={20} /> Emergency Call
                </button>
                <button
                    class="bg-zinc-100 hover:bg-zinc-200 text-black font-bold h-16 rounded-2xl flex items-center justify-center text-lg border border-zinc-300 shadow-sm"
                >
                    Report ADR
                </button>
            </div>

            <button
                on:click={finish}
                class="w-full text-text-muted hover:text-white transition-colors py-4 font-medium"
            >
                Return to Home
            </button>
        </div>
    {/if}

    <!-- Emergency Popup (Persistent overlay for high vitals) -->
    {#if showEmergencyPopup}
        <div
            class="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6"
            transition:fade
        >
            <div
                class="glass max-w-sm w-full p-8 text-center border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.3)]"
            >
                <div
                    class="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <PhoneCall class="text-red-500" size={40} />
                </div>
                <h2 class="text-3xl font-bold text-red-500 mb-2">
                    High Severity!
                </h2>
                <p class="text-text-muted mb-8 text-lg">
                    Metrics indicate an adverse reaction. Emergency contact has
                    been alerted.
                </p>
                <div class="space-y-3">
                    <button
                        class="w-full bg-red-500 hover:bg-red-600 text-white font-bold h-16 rounded-2xl text-xl shadow-lg shadow-red-500/30"
                    >
                        CALL 911 / 112
                    </button>
                    <button
                        on:click={() => (showEmergencyPopup = false)}
                        class="w-full glass h-14 rounded-2xl font-bold text-text-muted"
                    >
                        Dismiss Alert
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    /* Add any local styles here */
    :global(body) {
        overflow-x: hidden;
    }
</style>
