<script>
  import "../app.css";
  import { userStore, authLoading } from "$lib/authStore";
  import { onMount } from "svelte";
  import { LogOut, Activity, User, Info, LayoutDashboard } from "lucide-svelte";
  import { auth } from "$lib/firebase";
  import { signOut } from "firebase/auth";
  import { page } from "$app/stores";

  function handleSignOut() {
    signOut(auth);
  }
</script>

<div class="min-h-screen flex flex-col">
  {#if $authLoading}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-2xl font-bold animate-pulse">BioSentry...</div>
    </div>
  {:else}
    <nav class="glass m-4 p-4 flex justify-between items-center sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <Activity class="text-primary w-8 h-8" />
        <span class="text-xl font-bold track-tight">BioSentry</span>
      </div>

      {#if $userStore}
        <div class="flex items-center gap-6">
          <a href="/dashboard" class="flex items-center gap-1 hover:text-primary transition-colors {$page.url.pathname === '/dashboard' ? 'text-primary font-bold' : ''}">
            <LayoutDashboard size={20} />
            <span class="hidden md:inline">Dashboard</span>
          </a>
          <a href="/profile" class="flex items-center gap-1 hover:text-primary transition-colors {$page.url.pathname === '/profile' ? 'text-primary font-bold' : ''}">
            <User size={20} />
            <span class="hidden md:inline">Profile</span>
          </a>
          <a href="/about" class="flex items-center gap-1 hover:text-primary transition-colors {$page.url.pathname === '/about' ? 'text-primary font-bold' : ''}">
            <Info size={20} />
            <span class="hidden md:inline">About</span>
          </a>
          <button on:click={handleSignOut} class="text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <LogOut size={20} />
            <span class="hidden md:inline">Logout</span>
          </button>
        </div>
      {/if}
    </nav>

    <main class="flex-1 p-4 max-w-5xl mx-auto w-full">
      <slot />
    </main>
  {/if}
</div>

<style>
  :global(.lucide) {
    stroke-width: 2.5px;
  }
</style>
