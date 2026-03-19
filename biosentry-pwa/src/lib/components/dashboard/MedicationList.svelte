<script>
    import { medicationsStore } from "$lib/medicationStore";
    import Plus from "lucide-svelte/icons/plus";
    import Trash2 from "lucide-svelte/icons/trash-2";

    let { onAddClick } = $props();

    /** @param {any} id */
    function removeMedication(id) {
        medicationsStore.remove(id);
    }
</script>

<section class="space-y-3">
    <div class="flex justify-between items-end">
        <h2
            class="text-sm font-semibold text-text-muted uppercase tracking-wider"
        >
            Current Medication
        </h2>
        <button
            on:click={onAddClick}
            class="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
            <Plus size={14} /> Add New
        </button>
    </div>

    <div class="space-y-2">
        {#each $medicationsStore as med (med.id)}
            <div
                class="glass p-4 flex justify-between items-center group hover:border-primary/50 transition-all"
            >
                <div class="flex items-center gap-3">
                    <div class="w-2 h-8 bg-primary/40 rounded-full"></div>
                    <div>
                        <div class="font-bold text-lg">{med.name}</div>
                        <div class="text-xs text-text-muted">
                            Batch: <span class="font-mono">{med.batch}</span>
                        </div>
                    </div>
                </div>
                <button
                    on:click={() => removeMedication(med.id)}
                    class="text-text-muted hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/5 cursor-pointer"
                    aria-label="Remove medication"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        {:else}
            <div
                class="glass p-8 flex flex-col items-center justify-center text-center opacity-60 border-dashed cursor-pointer hover:opacity-100 transition-opacity"
                on:click={onAddClick}
                on:keydown={(e) => e.key === "Enter" && onAddClick()}
                role="button"
                tabindex="0"
            >
                <div
                    class="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3"
                >
                    <Plus class="text-text-muted" size={24} />
                </div>
                <p class="text-sm font-medium">No medications added yet</p>
                <p class="text-xs text-text-muted">
                    Click "Add New" to track your medicine
                </p>
            </div>
        {/each}
    </div>
</section>
