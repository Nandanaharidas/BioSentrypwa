<script>
    import { onDestroy } from "svelte";
    import { userStore } from "$lib/authStore";
    import { getDatabase, ref, onValue } from "firebase/database";
    import { getApp } from "firebase/app";
    import Activity from "lucide-svelte/icons/activity";

    let myDevices = $state([]);
    let rtdbUnsubscribe = null;

    $effect(() => {
        if ($userStore && !rtdbUnsubscribe) {
            const rtdb = getDatabase(getApp());
            const devicesRef = ref(rtdb, `users/${$userStore.uid}/devices`);
            rtdbUnsubscribe = onValue(devicesRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    myDevices = Object.values(data);
                } else {
                    myDevices = [];
                }
            });
        }
    });

    onDestroy(() => {
        if (rtdbUnsubscribe) rtdbUnsubscribe();
    });
</script>

{#if myDevices.length > 0}
    <section class="space-y-3">
        <h2
            class="text-sm font-semibold text-text-muted uppercase tracking-wider"
        >
            My IoT Devices
        </h2>
        <div class="space-y-3">
            {#each myDevices as device}
                <div
                    class="glass p-5 rounded-2xl border border-white/10 flex flex-col gap-4 relative overflow-hidden"
                >
                    <!-- Background glow -->
                    <div
                        class="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none"
                    ></div>

                    <div class="flex justify-between items-start z-10">
                        <div>
                            <div class="font-bold flex items-center gap-2">
                                <Activity size={16} class="text-primary" />
                                {device.name}
                            </div>
                            <div class="text-xs text-text-muted font-mono mt-1">
                                ID: {device.deviceId}
                            </div>
                        </div>
                        <div
                            class="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1"
                        >
                            <div
                                class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"
                            ></div>
                            Active
                        </div>
                    </div>

                    <!-- Latest Reading -->
                    {#if device.readings && Object.keys(device.readings).length > 0}
                        {@const latestReadingKey = Object.keys(device.readings)
                            .sort()
                            .pop()}
                        {@const latestReading =
                            device.readings[latestReadingKey]}
                        <div
                            class="grid grid-cols-4 gap-2 pt-2 border-t border-white/10 z-10"
                        >
                            <div class="flex flex-col">
                                <span
                                    class="text-[10px] text-blue-400 uppercase font-semibold"
                                    >O2</span
                                >
                                <span class="font-bold"
                                    >{latestReading.o2 || "--"}%</span
                                >
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="text-[10px] text-orange-400 uppercase font-semibold"
                                    >Temp</span
                                >
                                <span class="font-bold"
                                    >{latestReading.temp || "--"}</span
                                >
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="text-[10px] text-rose-400 uppercase font-semibold"
                                    >HR</span
                                >
                                <span class="font-bold"
                                    >{latestReading.pressure || "--"}</span
                                >
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="text-[10px] text-amber-400 uppercase font-semibold"
                                    >Skin</span
                                >
                                <span class="font-bold"
                                    >{latestReading.skin_conductance ||
                                        "--"}</span
                                >
                            </div>
                        </div>
                    {:else}
                        <div
                            class="text-xs text-text-muted mt-2 italic border-t border-white/10 pt-3 z-10"
                        >
                            Waiting for sensor data...
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    </section>
{/if}
