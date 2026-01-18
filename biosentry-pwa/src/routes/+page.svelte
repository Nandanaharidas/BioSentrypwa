<script>
  import { auth, googleProvider } from "$lib/firebase";
  import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
  import { userStore } from "$lib/authStore";
  import { goto } from "$app/navigation";
  import { LogIn, Github, Mail } from "lucide-svelte";

  let email = "";
  let password = "";
  let isLogin = true;
  let error = "";

  $: if ($userStore) {
    goto("/dashboard");
  }

  async function handleGoogleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      error = e.message;
    }
  }

  async function handleSubmit() {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      error = e.message;
    }
  }
</script>

<div class="flex flex-col items-center justify-center py-12 px-4">
  <div class="glass max-w-md w-full p-8 fade-in">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold mb-2">Welcome</h1>
      <p class="text-text-muted">Sign in to BioSentry to start monitoring your health</p>
    </div>

    {#if error}
      <div class="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
        {error}
      </div>
    {/if}

    <button on:click={handleGoogleLogin} class="btn btn-outline w-full mb-4 flex items-center gap-2">
      <Github size={20} />
      Continue with Google
    </button>

    <div class="relative py-4">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-border"></div></div>
      <div class="relative flex justify-center text-xs uppercase"><span class="bg-surface px-2 text-text-muted">Or continue with email</span></div>
    </div>

    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium mb-1">Email address</label>
        <input type="email" bind:value={email} placeholder="you@example.com" class="input" required />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium mb-1">Password</label>
        <input type="password" bind:value={password} placeholder="••••••••" class="input" required />
      </div>

      <button type="submit" class="btn btn-primary w-full">
        {isLogin ? "Sign In" : "Create Account"}
      </button>
    </form>

    <div class="mt-6 text-center text-sm text-text-muted">
      {#if isLogin}
        Don't have an account? <button on:click={() => isLogin = false} class="text-primary font-bold hover:underline">Sign up</button>
      {:else}
        Already have an account? <button on:click={() => isLogin = true} class="text-primary font-bold hover:underline">Log in</button>
      {/if}
    </div>
  </div>
</div>
