<script>
    // Simple SVG Line Chart Component
</script>

<div class="glass p-6 rounded-2xl relative h-48 mb-8">
    <svg viewBox="0 0 400 200" class="w-full h-full">
        <!-- Grid/Axes -->
        <line
            x1="40"
            y1="20"
            x2="40"
            y2="180"
            stroke="black"
            stroke-width="2"
        />
        <line
            x1="40"
            y1="180"
            x2="380"
            y2="180"
            stroke="black"
            stroke-width="2"
        />

        <!-- Labels -->
        <text x="50" y="195" font-size="10" class="fill-text-muted">day 1</text>
        <text x="150" y="195" font-size="10" class="fill-text-muted">day 2</text
        >
        <text x="250" y="195" font-size="10" class="fill-text-muted">day 3</text
        >

        <!-- Temp Line (Grey) -->
        <path
            d="M 40,150 L 100,140 L 200,160 L 300,120"
            fill="none"
            stroke="#94a3b8"
            stroke-width="2"
        />
        <text x="310" y="125" font-size="10" fill="#94a3b8">temp</text>

        <!-- BP Line (Red) -->
        <path
            d="M 40,130 L 100,120 L 200,140 L 300,90"
            fill="none"
            stroke="#ef4444"
            stroke-width="2"
        />
        <text x="310" y="85" font-size="10" fill="#ef4444">bp</text>

        <!-- Arrow on BP -->
        <path
            d="M 290,95 L 300,90 L 295,100"
            fill="none"
            stroke="#ef4444"
            stroke-width="2"
        />

        <!-- Vertical markers -->
        {#each [100, 200, 300] as x}
            <line
                x1={x}
                y1="20"
                x2={x}
                y2="180"
                stroke="black"
                stroke-dasharray="4"
                stroke-opacity="0.2"
            />
        {/each}
    </svg>
</div>

<style>
    .glass {
        border: 2px solid rgba(0, 0, 0, 0.8);
        background: transparent;
    }
</style>
