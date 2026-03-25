<script>
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import { goto } from "$app/navigation";
    import { Html5Qrcode } from "html5-qrcode";
    import ArrowLeft from "lucide-svelte/icons/arrow-left";
    import Camera from "lucide-svelte/icons/camera";

    let html5QrCode;
    let qrError = "";
    let isScanning = false;

    async function startScanning() {
        isScanning = true;
        qrError = "";
        setTimeout(() => {
            html5QrCode = new Html5Qrcode("reader");
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            html5QrCode
                .start(
                    { facingMode: "environment" },
                    config,
                    (decodedText) => {
                        handleQrSuccess(decodedText);
                    },
                    (errorMessage) => {
                        // Ignore periodic scan failures
                    },
                )
                .catch((err) => {
                    qrError = "Camera access failed: " + err;
                });
        }, 100);
    }

    async function stopScanning() {
        if (html5QrCode && html5QrCode.isScanning) {
            await html5QrCode.stop();
            await html5QrCode.clear();
        }
        isScanning = false;
    }

    function handleQrSuccess(decodedText) {
        try {
            const deviceId = decodedText.trim();
            console.log("Scanned QR — Device ID:", deviceId);
            stopScanning();
            goto(`/pair-device?deviceId=${encodeURIComponent(deviceId)}`);
        } catch (e) {
            qrError = "Invalid QR code content";
        }
    }

    onMount(() => {
        startScanning();
    });

    onDestroy(() => {
        stopScanning();
    });
</script>

<div in:fade class="max-w-md mx-auto space-y-6 pb-24 h-screen flex flex-col">
    <div class="flex items-center gap-4 py-4 px-4 shrink-0">
        <button
            on:click={() => goto("/measure")}
            class="p-2 glass hover:bg-surface transition-colors"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 class="text-xl font-bold">Scan Device QR</h1>
    </div>

    <div class="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        <div class="text-center space-y-2">
            <h2 class="text-3xl font-extrabold tracking-tight">
                Pair New Device
            </h2>
            <p class="text-text-muted">
                Point your camera at the QR code on the BioSentry IoT device to
                connect.
            </p>
        </div>

        <div
            class="w-full max-w-sm mx-auto aspect-square glass rounded-3xl overflow-hidden relative border-2 border-primary/30"
        >
            <div id="reader" class="w-full h-full bg-black/50"></div>
            {#if qrError}
                <div
                    class="absolute inset-0 bg-red-500/20 flex items-center justify-center p-4 text-center"
                >
                    <p
                        class="text-red-500 font-bold bg-black/80 px-4 py-2 rounded-xl backdrop-blur-md"
                    >
                        {qrError}
                    </p>
                </div>
            {/if}
            <button
                on:click={() => goto("/measure")}
                class="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-full text-sm font-bold shadow-lg"
            >
                Cancel Scanning
            </button>
        </div>

        <div
            class="flex items-center gap-2 text-text-muted text-sm bg-surface px-4 py-2 border border-border rounded-xl"
        >
            <Camera size={16} /> Ensure good lighting for best results
        </div>
    </div>
</div>
