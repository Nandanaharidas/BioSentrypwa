<script>
    import { fade } from "svelte/transition";
    import {
        AlertTriangle,
        TrendingUp,
        TrendingDown,
        Filter,
        ChevronDown,
    } from "lucide-svelte";
    import RealTimeChart from "$lib/components/RealTimeChart.svelte";

    const stats = [
        { label: "Total ADR Reports", value: "1,284", delta: "+12%", up: true },
        { label: "Serious Reactions", value: "42", delta: "-5%", up: false },
        { label: "Active Monitors", value: "856", delta: "+8%", up: true },
        {
            label: "Avg. Detection Time",
            value: "4.2m",
            delta: "-14%",
            up: false,
        },
    ];

    const drugReports = [
        { drug: "Paracetamol", reports: 342, severity: "Low", trend: "Stable" },
        {
            drug: "Amoxicillin",
            reports: 156,
            severity: "Medium",
            trend: "Rising",
        },
        { drug: "Ibuprofen", reports: 221, severity: "Low", trend: "Falling" },
        { drug: "Lisinopril", reports: 89, severity: "High", trend: "Stable" },
        {
            drug: "Metformin",
            reports: 112,
            severity: "Medium",
            trend: "Rising",
        },
    ];

    let selectedDrug = "Paracetamol";
    // Simulated trend data
    let trendData = Array.from(
        { length: 20 },
        () => Math.floor(Math.random() * 50) + 10,
    );
</script>

<div in:fade class="space-y-8">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each stats as stat}
            <div class="glass p-6">
                <div class="text-text-muted text-sm font-medium mb-1">
                    {stat.label}
                </div>
                <div class="flex items-end gap-3">
                    <div class="text-3xl font-bold">{stat.value}</div>
                    <div
                        class="flex items-center text-xs font-bold mb-1 {stat.up
                            ? 'text-green-400'
                            : 'text-red-400'}"
                    >
                        {#if stat.up}<TrendingUp
                                size={14}
                            />{:else}<TrendingDown size={14} />{/if}
                        {stat.delta}
                    </div>
                </div>
            </div>
        {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Reports Table -->
        <div class="lg:col-span-2 space-y-4">
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold flex items-center gap-2">
                    <Filter class="text-primary" size={20} />
                    Drug ADR Metrics
                </h2>
                <div class="flex gap-2">
                    <button
                        class="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
                        >Severity <ChevronDown size={14} /></button
                    >
                    <button
                        class="btn btn-outline py-1 px-3 text-xs flex items-center gap-1"
                        >Timeframe <ChevronDown size={14} /></button
                    >
                </div>
            </div>

            <div class="glass overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr
                            class="bg-surface/50 text-xs uppercase tracking-wider text-text-muted"
                        >
                            <th class="p-4 font-semibold">Drug Name</th>
                            <th class="p-4 font-semibold">Total Reports</th>
                            <th class="p-4 font-semibold">Avg. Severity</th>
                            <th class="p-4 font-semibold">Trend</th>
                            <th class="p-4 font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                        {#each drugReports as report}
                            <tr
                                class="hover:bg-surface/30 cursor-pointer transition-colors"
                                on:click={() => (selectedDrug = report.drug)}
                            >
                                <td class="p-4 font-medium">{report.drug}</td>
                                <td class="p-4">{report.reports}</td>
                                <td class="p-4">
                                    <span
                                        class="px-2 py-0.5 rounded text-[10px] font-bold uppercase {report.severity ===
                                        'High'
                                            ? 'bg-red-500/20 text-red-500'
                                            : report.severity === 'Medium'
                                              ? 'bg-yellow-500/20 text-yellow-500'
                                              : 'bg-green-500/20 text-green-500'}"
                                    >
                                        {report.severity}
                                    </span>
                                </td>
                                <td class="p-4 text-sm">{report.trend}</td>
                                <td class="p-4">
                                    <button
                                        class="text-primary text-xs font-bold hover:underline"
                                        >Details</button
                                    >
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Details Sidebar -->
        <div class="space-y-6">
            <div class="glass p-6 sticky top-24">
                <div class="flex items-center gap-3 mb-6">
                    <div
                        class="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center"
                    >
                        <AlertTriangle class="text-primary" />
                    </div>
                    <div>
                        <h3 class="font-bold text-lg">
                            {selectedDrug} Analysis
                        </h3>
                        <p class="text-text-muted text-xs">
                            Last updated 2h ago
                        </p>
                    </div>
                </div>

                <div class="space-y-6">
                    <div>
                        <div
                            class="text-xs font-semibold text-text-muted uppercase mb-4"
                        >
                            Report Frequency (7 Days)
                        </div>
                        <RealTimeChart
                            data={trendData}
                            label="Reports"
                            color="#4f46e5"
                        />
                    </div>

                    <div class="space-y-3">
                        <div
                            class="text-xs font-semibold text-text-muted uppercase"
                        >
                            Common Symptoms
                        </div>
                        <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-1 glass text-xs"
                                >Nausea (65%)</span
                            >
                            <span class="px-2 py-1 glass text-xs"
                                >Dizziness (42%)</span
                            >
                            <span class="px-2 py-1 glass text-xs"
                                >Rash (12%)</span
                            >
                            <span class="px-2 py-1 glass text-xs"
                                >Headache (38%)</span
                            >
                        </div>
                    </div>

                    <button class="btn btn-primary w-full text-sm"
                        >Download Detailed Report</button
                    >
                </div>
            </div>
        </div>
    </div>
</div>
