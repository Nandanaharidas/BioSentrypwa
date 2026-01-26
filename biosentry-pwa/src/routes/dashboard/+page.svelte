<script>
  import { onMount } from "svelte";
  import { userStore } from "$lib/authStore";
  import { medicationsStore } from "$lib/medicationStore";
  import {
    Activity,
    Plus,
    User,
    ChevronRight,
    HeartPulse,
    Thermometer,
    Droplets,
    Zap,
    LogOut,
    X,
  } from "lucide-svelte";
  import { fade, slide, scale } from "svelte/transition";
  import { clickOutside } from "$lib/clickOutside";

  let showProfile = false;
  let showAddMedicine = false;
  let newMedName = "";
  let newMedBatch = "";

  /** @type {any[]} */
  let medications = [];

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

  function toggleProfile() {
    showProfile = !showProfile;
  }

  function toggleAddMedicine() {
    showAddMedicine = !showAddMedicine;
    if (!showAddMedicine) {
      newMedName = "";
      newMedBatch = "";
    }
  }

  function addMedicine() {
    if (newMedName.trim()) {
      medicationsStore.update((meds) => [
        ...meds,
        {
          id: Date.now(),
          name: newMedName,
          batch: newMedBatch || "N/A",
        },
      ]);
      toggleAddMedicine();
    }
  }

  // Helper to extract name from email if displayName is missing
  $: userName =
    ($userStore && "displayName" in $userStore
      ? $userStore.displayName
      : null) ||
    ($userStore && "email" in $userStore
      ? $userStore.email?.split("@")[0]
      : null) ||
    "User";
</script>

<div in:fade class="max-w-md mx-auto space-y-6 pb-24">
  <!-- Header -->
  <header class="flex justify-between items-center py-4">
    <div class="flex items-center gap-2">
      <Activity class="text-primary w-6 h-6" />
      <h1 class="text-2xl font-bold tracking-tight">BioSentry</h1>
    </div>

    <div class="relative">
      <button
        on:click={toggleProfile}
        class="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-surface-hover transition-colors"
      >
        <User size={20} class="text-text-muted" />
      </button>

      {#if showProfile}
        <div
          use:clickOutside
          on:click_outside={() => (showProfile = false)}
          transition:scale={{ duration: 150, start: 0.95 }}
          class="absolute right-0 mt-2 w-64 glass p-4 z-50 shadow-xl border border-white/20"
        >
          <div class="flex items-center gap-3 mb-4">
            <div
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <span class="font-bold text-primary"
                >{userName[0].toUpperCase()}</span
              >
            </div>
            <div class="overflow-hidden">
              <div class="font-bold truncate">{userName}</div>
              <div class="text-xs text-text-muted truncate">
                {$userStore?.email}
              </div>
            </div>
          </div>
          <div class="h-[1px] bg-white/10 my-2"></div>
          <button
            class="w-full text-left px-2 py-2 text-sm hover:bg-white/5 rounded transition-colors flex items-center gap-2"
          >
            <User size={16} /> Profile Settings
          </button>
          <button
            class="w-full text-left px-2 py-2 text-sm text-rose-400 hover:bg-rose-400/10 rounded transition-colors flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      {/if}
    </div>
  </header>

  <!-- Current Medication -->
  <section class="space-y-3">
    <div class="flex justify-between items-end">
      <h2
        class="text-sm font-semibold text-text-muted uppercase tracking-wider"
      >
        Current Medication
      </h2>
      <button
        on:click={toggleAddMedicine}
        class="text-xs text-primary font-bold hover:underline flex items-center gap-1"
      >
        <Plus size={14} /> Add New
      </button>
    </div>

    <div class="space-y-2">
      {#each $medicationsStore as med}
        <div
          class="glass p-4 flex justify-between items-center group hover:border-primary/50 transition-all cursor-pointer"
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
          <ChevronRight
            size={18}
            class="text-text-muted group-hover:text-primary transition-colors"
          />
        </div>
      {:else}
        <div
          class="glass p-8 flex flex-col items-center justify-center text-center opacity-60 border-dashed"
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

  <!-- Vitals Chart Placeholder -->
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

  <!-- Primary Action -->
  <div class="fixed bottom-6 left-6 right-6 max-w-md mx-auto">
    <a
      href="/measure/select"
      class="w-full bg-primary hover:bg-primary-hover text-white h-16 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      <Zap class="fill-current" size={20} />
      Start Monitoring
    </a>
  </div>

  <!-- Add Medicine Modal -->
  {#if showAddMedicine}
    <div
      transition:fade={{ duration: 200 }}
      class="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    >
      <div
        use:clickOutside
        on:click_outside={toggleAddMedicine}
        transition:scale={{ duration: 200, start: 0.9 }}
        class="glass w-full max-w-sm p-6 space-y-4 border border-white/20 shadow-2xl"
      >
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold">Add Medicine</h2>
          <button
            on:click={toggleAddMedicine}
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
</div>

<style>
  /* Any custom local styles */
  :global(body) {
    overflow-x: hidden;
  }
</style>
