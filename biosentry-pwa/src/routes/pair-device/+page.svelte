<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { userStore, authLoading } from "$lib/authStore";
  import { rtdb } from "$lib/firebase";
  import { ref, set } from "firebase/database";
  import { deviceStore } from "$lib/deviceStore";
  import CheckCircle from "lucide-svelte/icons/check-circle";
  import Cpu from "lucide-svelte/icons/cpu";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";
  import Loader from "lucide-svelte/icons/loader";
  import QrCode from "lucide-svelte/icons/qr-code";

  // ── Extract deviceId from URL ─────────────────────────────────────────────
  $: deviceId = $page.url.searchParams.get("deviceId") || "";

  let state = "idle"; // idle | pairing | success | error
  let errorMsg = "";

  async function pairDevice() {
    if (!$userStore) {
      goto(`/?redirect=/pair-device?deviceId=${deviceId}`);
      return;
    }
    if (!deviceId) {
      state = "error";
      errorMsg = "No device ID found in the QR code.";
      return;
    }

    state = "pairing";

    try {
      const user = $userStore;

      // Write device under user's account so dashboard can list it
      await set(ref(rtdb, `users/${user.uid}/devices/${deviceId}`), {
        deviceId,
        name: "BioSentry IoT Device",
        pairedAt: Date.now(),
      });

      // Update the local deviceStore so measure page picks it up
      deviceStore.set({
        deviceId,
        isConnected: true,
        url: null,
        username: null,
        password: null,
      });

      state = "success";
    } catch (err) {
      state = "error";
      errorMsg = err.message;
    }
  }
</script>

<div class="flex flex-col items-center justify-center py-16 px-4">
  <div class="glass max-w-md w-full p-8 fade-in text-center">
    <!-- Header -->
    <div class="flex justify-center mb-4">
      <Cpu size={48} class="text-primary" />
    </div>
    <h1 class="text-3xl font-bold mb-2">Register IoT Device</h1>
    <p class="text-text-muted text-sm mb-8">
      Link this BioSentry IoT device to your account. After registration, the
      device will push sensor data to Firebase every 5 seconds.
    </p>

    <!-- Device ID pill -->
    {#if deviceId}
      <div
        class="inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 mb-8"
      >
        <QrCode size={16} class="text-primary" />
        <span class="font-mono text-sm">{deviceId}</span>
      </div>
    {/if}

    <!-- Auth gate -->
    {#if $authLoading}
      <div class="flex justify-center">
        <Loader size={32} class="animate-spin text-primary" />
      </div>
    {:else if !$userStore}
      <div
        class="bg-yellow-500/10 border border-yellow-500/40 text-yellow-400 rounded-xl p-4 mb-6 text-sm"
      >
        <AlertTriangle size={18} class="inline mr-1" />
        You must be logged in to register a device.
      </div>
      <a href="/" class="btn btn-primary w-full">Go to Login</a>
    {:else if state === "success"}
      <!-- Success -->
      <div class="flex flex-col items-center gap-4 py-4">
        <CheckCircle size={56} class="text-green-400" />
        <p class="text-green-400 font-semibold text-lg">Device Registered!</p>
        <p class="text-text-muted text-sm">
          The IoT device will start pushing sensor data to your account shortly.
        </p>
        <a href="/measure" class="btn btn-primary w-full mt-2">Go to Measure</a>
      </div>
    {:else if state === "error"}
      <div
        class="bg-red-500/10 border border-red-500/40 text-red-400 rounded-xl p-4 mb-6 text-sm"
      >
        <AlertTriangle size={18} class="inline mr-1" />
        {errorMsg}
      </div>
      <button class="btn btn-outline w-full" on:click={() => (state = "idle")}
        >Try Again</button
      >
    {:else}
      <!-- Ready to pair -->
      <div
        class="bg-surface border border-border rounded-xl p-4 mb-6 text-left text-sm space-y-2"
      >
        <div class="flex items-center gap-2">
          <span class="text-text-muted w-24 shrink-0">Device ID</span>
          <span class="font-mono text-primary truncate">{deviceId || "—"}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-text-muted w-24 shrink-0">Account</span>
          <span class="truncate">{$userStore.email}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-text-muted w-24 shrink-0">Push interval</span>
          <span>Every 5 seconds</span>
        </div>
      </div>

      <button
        class="btn btn-primary w-full flex items-center justify-center gap-2"
        on:click={pairDevice}
        disabled={state === "pairing"}
      >
        {#if state === "pairing"}
          <Loader size={18} class="animate-spin" />
          Registering…
        {:else}
          <CheckCircle size={18} />
          Register Device
        {/if}
      </button>
    {/if}
  </div>
</div>
