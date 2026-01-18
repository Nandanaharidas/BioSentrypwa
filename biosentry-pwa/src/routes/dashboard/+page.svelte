<script>
  import { userStore } from "$lib/authStore";
  import { Activity, Plus, History, PhoneCall, ChevronRight } from "lucide-svelte";
  import { fade } from "svelte/transition";

  const pastAdrTests = [
    { id: 1, drug: "Paracetamol", date: "2026-01-15", severity: "Low", status: "Completed" },
    { id: 2, drug: "Amoxicillin", date: "2026-01-10", severity: "None", status: "Completed" }
  ];
</script>

<div in:fade class="space-y-8">
  <section class="text-left">
    <h1 class="text-3xl font-bold mb-2">Hello, {$userStore?.displayName || 'User'}</h1>
    <p class="text-text-muted">Welcome back to BioSentry. How are you feeling today?</p>
  </section>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <a href="/measure" class="glass p-8 flex flex-col items-center justify-center text-center group hover:border-primary transition-all">
      <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Plus class="text-primary w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold mb-1">New Measurement</h2>
      <p class="text-sm text-text-muted">Start a new ADR drug test and measure metrics</p>
    </a>

    <div class="glass p-8 flex flex-col items-center justify-center text-center group hover:border-accent transition-all">
      <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <PhoneCall class="text-accent w-8 h-8" />
      </div>
      <h2 class="text-xl font-bold mb-1">Emergency</h2>
      <p class="text-sm text-text-muted">Quickly contact emergency services</p>
    </div>
  </div>

  <section class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="flex items-center gap-2 text-xl font-bold">
        <History class="text-primary" />
        Past Measurements
      </h2>
      <button class="text-sm text-primary font-bold hover:underline">View All</button>
    </div>

    <div class="space-y-3">
      {#each pastAdrTests as test}
        <div class="glass p-4 flex justify-between items-center hover:bg-surface transition-colors cursor-pointer">
          <div>
            <div class="font-bold">{test.drug}</div>
            <div class="text-xs text-text-muted">{test.date} • {test.status}</div>
          </div>
          <div class="flex items-center gap-4">
            <span class="px-3 py-1 rounded-full text-xs font-bold {test.severity === 'Low' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}">
              {test.severity}
            </span>
            <ChevronRight class="text-text-muted" size={20} />
          </div>
        </div>
      {/each}
    </div>
  </section>
</div>
