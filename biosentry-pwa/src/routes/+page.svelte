<script>
  import { auth, googleProvider } from "$lib/firebase";
  import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    getAdditionalUserInfo,
  } from "firebase/auth";
  import { userStore } from "$lib/authStore";
  import { goto } from "$app/navigation";
  import { LogIn, Github, Mail, AlertCircle, QrCode, X } from "lucide-svelte";
  import { isValidEmail } from "$lib/validation";
  import QRScanner from "$lib/components/QRScanner.svelte";

  let email = "";
  let password = "";
  let isLogin = true;
  let error = "";
  let manualRedirect = false;
  let showScanner = false;

  $: if ($userStore && !manualRedirect) {
    goto("/dashboard");
  }

  async function handleGoogleLogin() {
    try {
      manualRedirect = true;
      const result = await signInWithPopup(auth, googleProvider);
      const details = getAdditionalUserInfo(result);
      if (details?.isNewUser) {
        goto("/about");
      } else {
        goto("/dashboard");
      }
    } catch (e) {
      error = e.message;
      manualRedirect = false;
    }
  }

  async function handleSubmit() {
    error = "";
    if (!isValidEmail(email)) {
      error = "Please enter a valid email address.";
      return;
    }

    try {
      manualRedirect = true;
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        goto("/dashboard");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        goto("/about");
      }
    } catch (e) {
      error = e.message;
      manualRedirect = false;
    }
  }

  function handleScan(event) {
    showScanner = false;
    const scannedUrl = event.detail;
    // Basic check to see if it's a BioSentry pairing URL or just a device ID
    if (scannedUrl.includes("pair-device?deviceId=")) {
      // It's a full URL from our IoT simulator, navigate to that path
      const urlObj = new URL(scannedUrl);
      goto(urlObj.pathname + urlObj.search);
    } else {
      // Fallback, assume they just scanned the device ID directly
      goto(`/pair-device?deviceId=${encodeURIComponent(scannedUrl)}`);
    }
  }
</script>

<div class="flex flex-col items-center justify-center py-12 px-4">
  <div class="glass max-w-md w-full p-8 fade-in">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">Welcome</h1>
      <p class="text-text-muted">
        Sign in to BioSentry to start monitoring your health
      </p>
    </div>

    {#if error}
      <div
        class="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm"
      >
        {error}
      </div>
    {/if}

    <button
      on:click={handleGoogleLogin}
      class="btn btn-outline w-full mb-4 flex items-center gap-2"
    >
      <Github size={20} />
      Continue with Google
    </button>

    <div class="relative py-4">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"></div>
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-surface px-2 text-text-muted"
          >Or continue with email</span
        >
      </div>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1"
          >Email address</label
        >
        <input
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          class="input"
          required
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium mb-1"
          >Password</label
        >
        <input
          type="password"
          bind:value={password}
          placeholder="••••••••"
          class="input"
          required
        />
      </div>

      <button type="submit" class="btn btn-primary w-full">
        {isLogin ? "Sign In" : "Create Account"}
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-text-muted">
      {#if isLogin}
        Don't have an account? <button
          on:click={() => (isLogin = false)}
          class="text-primary font-bold hover:underline">Sign up</button
        >
      {:else}
        Already have an account? <button
          on:click={() => (isLogin = true)}
          class="text-primary font-bold hover:underline">Log in</button
        >
      {/if}
    </div>

    <!-- Scan Device QR Button -->
    <div class="mt-8 pt-6 border-t border-border text-center">
      <p class="text-xs text-text-muted mb-3 uppercase tracking-wider font-semibold">
        Have a new tracker?
      </p>
      <button
        on:click={() => (showScanner = true)}
        class="btn btn-outline w-full flex items-center justify-center gap-2"
      >
        <QrCode size={18} />
        Scan Device QR
      </button>
    </div>
  </div>

  <!-- QR Scanner Modal -->
  {#if showScanner}
    <div class="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex flex-col pt-16 px-4">
      <div class="max-w-md w-full mx-auto relative flex flex-col h-full space-y-4">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Scan Device QR</h2>
          <button
            on:click={() => (showScanner = false)}
            class="p-2 bg-surface rounded-full border border-border hover:bg-surface-hover transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <p class="text-text-muted text-center text-sm mb-4">
          Point your camera at the QR code shown on your BioSentry IoT device's screen.
        </p>

        <div class="glass p-4 rounded-3xl overflow-hidden border-2 border-primary/30 flex-1 max-h-[400px]">
          <QRScanner active={showScanner} on:scan={handleScan} />
        </div>
      </div>
    </div>
  {/if}
</div>
