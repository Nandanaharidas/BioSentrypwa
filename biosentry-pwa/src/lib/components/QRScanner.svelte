<script>
  import { onMount } from 'svelte';
  import { Html5QrcodeScanner } from 'html5-qrcode';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let active = false;

  let scannerDiv;
  let scanner = null;
  let error = '';

  onMount(() => {
    return () => {
      if (scanner) scanner.clear().catch(() => {});
    };
  });

  $: if (active && scannerDiv) {
    startScanner();
  } else if (!active && scanner) {
    scanner.clear().catch(() => {});
    scanner = null;
  }

  function startScanner() {
    if (scanner) return;
    error = '';
    scanner = new Html5QrcodeScanner(
      'qr-reader',
      { fps: 10, qrbox: { width: 220, height: 220 } },
      false
    );
    scanner.render(
      (decodedText) => {
        dispatch('scan', decodedText);
        scanner.clear().catch(() => {});
        scanner = null;
      },
      (err) => {
        // suppress frequent "not found" errors
        if (err && !err.includes('No QR code found')) {
          error = err;
        }
      }
    );
  }
</script>

<div class:hidden={!active}>
  <div id="qr-reader" bind:this={scannerDiv}></div>
  {#if error}
    <p class="text-red-400 text-sm mt-2">{error}</p>
  {/if}
</div>

<style>
  :global(#qr-reader) {
    border: none !important;
    padding: 0 !important;
    width: 100% !important;
  }
  :global(#qr-reader__scan_region) {
    border-radius: 12px;
    overflow: hidden;
  }
  :global(#qr-reader__dashboard_section_swaplink),
  :global(#qr-reader__status_span),
  :global(#qr-reader__header_message) {
    color: #94a3b8 !important;
    font-size: 0.8rem !important;
  }
  :global(#qr-reader__filescan_input) {
    color: #94a3b8 !important;
  }
  :global(#qr-reader button) {
    background: transparent !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    color: #c7d2fe !important;
    border-radius: 8px !important;
    padding: 4px 12px !important;
    cursor: pointer !important;
  }
  :global(#qr-reader button:hover) {
    background: rgba(99,102,241,0.15) !important;
  }
  :global(#qr-reader video) {
    border-radius: 12px !important;
  }
</style>
