<script>
    import {
        medicationsStore,
        selectedMedicationStore,
    } from "$lib/medicationStore";
    import { ArrowLeft, Check, Smartphone } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";
    import { goto } from "$app/navigation";

    /** @type {any} */
    let selectedId = null;

    function selectMedication(med) {
        selectedId = med.id;
        selectedMedicationStore.set(med);
    }

    function handleConnect() {
        if (selectedId) {
            goto("/measure");
        }
    }
</script>

<div in:fade class="max-w-md mx-auto space-y-8 pb-12">
    <header class="flex items-center gap-4 py-4">
        <a
            href="/dashboard"
            class="p-2 glass hover:bg-surface transition-colors"
        >
            <ArrowLeft size={20} />
        </a>
        <h1 class="text-xl font-bold">Select Medication</h1>
    </header>

    <section class="space-y-6">
        <div class="text-center space-y-2">
            <h2 class="text-3xl font-extrabold tracking-tight">
                Select your tablet
            </h2>
            <p class="text-text-muted text-sm">
                Which medication are you taking now?
            </p>
        </div>

        {#if $medicationsStore.length === 0}
            <div class="glass p-12 text-center space-y-4 border-dashed">
                <div
                    class="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <Smartphone class="text-text-muted" size={32} />
                </div>
                <p class="font-medium">No medications found</p>
                <p class="text-sm text-text-muted">
                    Please add medications on the dashboard first.
                </p>
                <a href="/dashboard" class="btn btn-primary inline-flex"
                    >Go to Dashboard</a
                >
            </div>
        {:else}
            <div class="grid grid-cols-2 gap-4">
                {#each $medicationsStore as med}
                    <button
                        on:click={() => selectMedication(med)}
                        class="glass p-6 flex flex-col items-center justify-center text-center gap-3 transition-all relative group {selectedId ===
                        med.id
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'hover:border-white/20'}"
                    >
                        {#if selectedId === med.id}
                            <div
                                transition:scale
                                class="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                            >
                                <Check size={14} class="text-white" />
                            </div>
                        {/if}

                        <div
                            class="w-12 h-12 rounded-2xl bg-surface flex items-center justify-center group-hover:scale-110 transition-transform"
                        >
                            <div
                                class="w-6 h-6 rounded-full border-4 {selectedId ===
                                med.id
                                    ? 'border-primary'
                                    : 'border-text-muted/30'}"
                            ></div>
                        </div>

                        <div class="space-y-1">
                            <div class="font-bold text-lg leading-tight">
                                {med.name}
                            </div>
                            <div
                                class="text-[10px] text-text-muted uppercase tracking-widest font-mono"
                            >
                                {med.batch}
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        {/if}
    </section>

    <div class="pt-8">
        <button
            on:click={handleConnect}
            disabled={!selectedId}
            class="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:grayscale text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
            Connect to device
        </button>
    </div>
</div>

<style>
    /* Optional: make the checkmark indicator more prominent */
</style>
