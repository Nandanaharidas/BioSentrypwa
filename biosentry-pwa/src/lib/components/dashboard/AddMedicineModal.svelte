<script>
    import { medicationsStore } from "$lib/medicationStore";
    import { fade, scale } from "svelte/transition";
    import { clickOutside } from "$lib/clickOutside";
    import X from "lucide-svelte/icons/x";

    let { showModal, onClose } = $props();

    let newMedName = $state("");
    let newMedBatch = $state("");

    // Reset fields when shown
    $effect(() => {
        if (showModal) {
            newMedName = "";
            newMedBatch = "";
        }
    });

    function addMedicine() {
        if (newMedName.trim()) {
            medicationsStore.add({
                name: newMedName,
                batch: newMedBatch || "N/A",
            });
            onClose();
        }
    }
</script>

{#if showModal}
    <div
        transition:fade={{ duration: 200 }}
        class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
        <div
            use:clickOutside
            on:click_outside={onClose}
            transition:scale={{ duration: 200, start: 0.9 }}
            class="glass w-full max-w-sm p-6 space-y-4 border border-white/20 shadow-2xl"
        >
            <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold">Add Medicine</h2>
                <button
                    on:click={onClose}
                    class="text-text-muted hover:text-text transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div class="space-y-4">
                <div class="space-y-1">
                    <label
                        class="text-xs font-semibold text-text-muted uppercase"
                        for="medName">Medicine Name</label
                    >
                    <input
                        id="medName"
                        type="text"
                        bind:value={newMedName}
                        placeholder="e.g. Paracetamol"
                        class="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <div class="space-y-1">
                    <label
                        class="text-xs font-semibold text-text-muted uppercase"
                        for="medBatch">Batch Number</label
                    >
                    <input
                        id="medBatch"
                        type="text"
                        bind:value={newMedBatch}
                        placeholder="e.g. BT12345 (Optional)"
                        class="w-full bg-surface border border-white/10 rounded-xl p-3 focus:outline-none focus:border-primary transition-colors"
                    />
                </div>

                <button
                    on:click={addMedicine}
                    disabled={!newMedName.trim()}
                    class="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                >
                    Add to List
                </button>
            </div>
        </div>
    </div>
{/if}
