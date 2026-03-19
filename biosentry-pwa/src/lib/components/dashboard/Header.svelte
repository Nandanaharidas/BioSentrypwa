<script>
    import { userStore } from "$lib/authStore";
    import Activity from "lucide-svelte/icons/activity";
    import User from "lucide-svelte/icons/user";
    import LogOut from "lucide-svelte/icons/log-out";
    import { scale } from "svelte/transition";
    import { clickOutside } from "$lib/clickOutside";

    let showProfile = $state(false);

    function toggleProfile() {
        showProfile = !showProfile;
    }

    // Helper to extract name from email if displayName is missing
    let userName = $derived(
        ($userStore && "displayName" in $userStore
            ? $userStore.displayName
            : null) ||
            ($userStore && "email" in $userStore
                ? $userStore.email?.split("@")[0]
                : null) ||
            "User",
    );
</script>

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
