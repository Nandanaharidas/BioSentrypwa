<script>
    import HeartPulse from "lucide-svelte/icons/heart-pulse";
    import Thermometer from "lucide-svelte/icons/thermometer";
    import Droplets from "lucide-svelte/icons/droplets";
    import Zap from "lucide-svelte/icons/zap";

    const vitalsData = [
        {
            label: "O2",
            value: "98%",
            icon: Droplets,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            label: "Temp",
            value: "98.6°F",
            icon: Thermometer,
            color: "text-orange-400",
            bg: "bg-orange-400/10",
        },
        {
            label: "BP",
            value: "120/80",
            icon: HeartPulse,
            color: "text-rose-400",
            bg: "bg-rose-400/10",
        },
        {
            label: "Skin",
            value: "2.5μS",
            icon: Zap,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
        },
    ];
</script>

<section class="space-y-3">
    <h2 class="text-sm font-semibold text-text-muted uppercase tracking-wider">
        Daily Trends
    </h2>
    <div
        class="glass p-6 aspect-video flex flex-col justify-between relative overflow-hidden"
    >
        <!-- Grid/Chart Simulation -->
        <div class="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
                <defs>
                    <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="white"
                            stroke-width="0.5"
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        <!-- Simulated Graph Line -->
        <svg
            class="absolute inset-x-0 bottom-12 h-24 w-full px-6 overflow-visible"
            preserveAspectRatio="none"
        >
            <path
                d="M 0 60 Q 50 20 100 50 T 200 30 T 300 70 T 400 40"
                fill="none"
                stroke="url(#gradient)"
                stroke-width="3"
                stroke-linecap="round"
                class="animate-pulse"
            />
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="var(--color-primary)" />
                    <stop offset="100%" stop-color="var(--color-secondary)" />
                </linearGradient>
            </defs>
        </svg>

        <div class="grid grid-cols-4 gap-2 relative z-10 mt-auto">
            {#each vitalsData as vital}
                <div class="flex flex-col items-center">
                    <div class="{vital.bg} {vital.color} p-2 rounded-lg mb-1">
                        <svelte:component this={vital.icon} size={16} />
                    </div>
                    <span class="text-[10px] text-text-muted uppercase"
                        >{vital.label}</span
                    >
                    <span class="text-xs font-bold">{vital.value}</span>
                </div>
            {/each}
        </div>
    </div>
</section>
