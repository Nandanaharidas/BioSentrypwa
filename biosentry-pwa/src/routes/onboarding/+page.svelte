<script>
    import { userStore } from "$lib/authStore";
    import { db } from "$lib/firebase";
    import { doc, setDoc } from "firebase/firestore";
    import { goto } from "$app/navigation";
    import { fade, slide } from "svelte/transition";
    import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-svelte";

    let step = 1;
    const totalSteps = 4;

    let profile = {
        gender: "",
        age: "",
        weight: "",
        height: "",
        bloodGroup: "",
        chronicConditions: [],
        vaccinations: [],
        pastMedications: [],
        smoking: false,
        alcohol: false,
    };

    let newCondition = "";

    function addCondition() {
        if (newCondition && !profile.chronicConditions.includes(newCondition)) {
            profile.chronicConditions = [
                ...profile.chronicConditions,
                newCondition,
            ];
            newCondition = "";
        }
    }

    async function finishOnboarding() {
        if (!$userStore) return;
        try {
            await setDoc(doc(db, "user_profiles", $userStore.uid), {
                ...profile,
                lastUpdated: new Date().toISOString(),
                onboardingComplete: true,
            });
            goto("/dashboard");
        } catch (e) {
            console.error("Error saving profile", e);
        }
    }

    function next() {
        if (step < totalSteps) step++;
    }
    function prev() {
        if (step > 1) step--;
    }
</script>

<div in:fade class="max-w-xl mx-auto py-8">
    <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Medical Profile</h1>
            <span class="text-sm text-text-muted"
                >Step {step} of {totalSteps}</span
            >
        </div>
        <div class="w-full bg-surface h-2 rounded-full overflow-hidden">
            <div
                class="bg-primary h-full transition-all duration-500"
                style="width: {(step / totalSteps) * 100}%"
            ></div>
        </div>
    </div>

    <div class="glass p-8 min-h-[400px] flex flex-col">
        {#if step === 1}
            <div transition:slide class="space-y-6">
                <h2 class="text-xl font-bold">Basic Information</h2>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Gender</label
                        >
                        <select bind:value={profile.gender} class="input">
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Age</label
                        >
                        <input
                            type="number"
                            bind:value={profile.age}
                            placeholder="Age"
                            class="input"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Weight (kg)</label
                        >
                        <input
                            type="number"
                            bind:value={profile.weight}
                            placeholder="Weight"
                            class="input"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1"
                            >Height (cm)</label
                        >
                        <input
                            type="number"
                            bind:value={profile.height}
                            placeholder="Height"
                            class="input"
                        />
                    </div>
                </div>
            </div>
        {:else if step === 2}
            <div transition:slide class="space-y-6">
                <h2 class="text-xl font-bold">Health History</h2>
                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Blood Group</label
                    >
                    <select bind:value={profile.bloodGroup} class="input">
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="B+">B+</option>
                        <option value="O+">O+</option>
                        <option value="AB+">AB+</option>
                        <option value="A-">A-</option>
                        <option value="B-">B-</option>
                        <option value="O-">O-</option>
                        <option value="AB-">AB-</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1"
                        >Chronic Conditions</label
                    >
                    <div class="flex gap-2 mb-2">
                        <input
                            type="text"
                            bind:value={newCondition}
                            placeholder="e.g. Diabetes"
                            class="input mb-0"
                        />
                        <button
                            on:click={addCondition}
                            class="btn btn-primary px-4">Add</button
                        >
                    </div>
                    <div class="flex flex-wrap gap-2">
                        {#each profile.chronicConditions as condition}
                            <span
                                class="px-3 py-1 glass text-xs flex items-center gap-2"
                            >
                                {condition}
                                <button
                                    class="text-red-400"
                                    on:click={() =>
                                        (profile.chronicConditions =
                                            profile.chronicConditions.filter(
                                                (c) => c !== condition,
                                            ))}>×</button
                                >
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        {:else if step === 3}
            <div transition:slide class="space-y-6">
                <h2 class="text-xl font-bold">Medications & Life Style</h2>
                <div class="space-y-4">
                    <div class="p-4 glass flex justify-between items-center">
                        <div>
                            <div class="font-bold">Smoking</div>
                            <div class="text-xs text-text-muted">
                                Do you smoke regularly?
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            bind:checked={profile.smoking}
                            class="w-6 h-6 border-primary accent-primary"
                        />
                    </div>
                    <div class="p-4 glass flex justify-between items-center">
                        <div>
                            <div class="font-bold">Alcohol</div>
                            <div class="text-xs text-text-muted">
                                Do you consume alcohol regularly?
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            bind:checked={profile.alcohol}
                            class="w-6 h-6 border-primary accent-primary"
                        />
                    </div>
                </div>
            </div>
        {:else if step === 4}
            <div
                transition:slide
                class="flex-1 flex flex-col items-center justify-center text-center space-y-4"
            >
                <CheckCircle2 size={64} class="text-secondary" />
                <h2 class="text-2xl font-bold">Profile Complete!</h2>
                <p class="text-text-muted">
                    Thank you for sharing your history. This helps BioSentry
                    monitor your health with high precision.
                </p>
            </div>
        {/if}

        <div class="mt-auto pt-8 flex justify-between">
            {#if step > 1}
                <button
                    on:click={prev}
                    class="btn btn-outline flex items-center gap-2"
                >
                    <ChevronLeft size={20} /> Back
                </button>
            {:else}
                <div></div>
            {/if}

            {#if step < totalSteps}
                <button
                    on:click={next}
                    class="btn btn-primary flex items-center gap-2"
                >
                    Next <ChevronRight size={20} />
                </button>
            {:else}
                <button on:click={finishOnboarding} class="btn btn-primary px-8"
                    >Finish</button
                >
            {/if}
        </div>
    </div>
</div>
