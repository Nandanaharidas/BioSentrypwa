<script>
    import { userStore } from "$lib/authStore";
    import { db } from "$lib/firebase";
    import { doc, setDoc } from "firebase/firestore";
    import { goto } from "$app/navigation";
    import { fade, slide } from "svelte/transition";
    import {
        ChevronRight,
        ChevronLeft,
        CheckCircle2,
        Search,
        X,
        Plus,
        AlertCircle,
    } from "lucide-svelte";
    import { isValidContact } from "$lib/validation";

    let step = 1;
    const totalSteps = 4;

    /** @type {any} */
    let profile = {
        // Page 1: Demographics
        gender: "",
        dob: "",
        contactInfo: "",
        location: "",

        // Page 2: Physical
        weight: "",
        height: "",
        bloodGroup: "",

        // Page 3: Medical
        chronicConditions: [],
        vaccinations: [],
        pastMedications: [],

        // Page 4: Lifestyle
        smoking: false,
        alcohol: false,
        drugUse: false,
    };

    let newCondition = "";
    let newVaccination = "";
    let newMedication = "";
    let conditionSearch = "";

    const conditionSuggestions = [
        "Diabetes Type 1",
        "Diabetes Type 2",
        "Hypertension",
        "Asthma",
        "Arthritis",
        "Chronic Kidney Disease",
        "Heart Disease",
        "COPD",
        "Thyroid Disorder",
        "Epilepsy",
        "Migraine",
        "Anxiety",
        "Depression",
    ];

    $: filteredSuggestions = conditionSearch
        ? conditionSuggestions.filter(
              (s) =>
                  s.toLowerCase().includes(conditionSearch.toLowerCase()) &&
                  !profile.chronicConditions.includes(s),
          )
        : [];

    /** @param {string} condition */
    function addCondition(condition) {
        if (condition && !profile.chronicConditions.includes(condition)) {
            profile.chronicConditions = [
                ...profile.chronicConditions,
                condition,
            ];
            conditionSearch = "";
        }
    }

    function addVaccination() {
        if (newVaccination && !profile.vaccinations.includes(newVaccination)) {
            profile.vaccinations = [...profile.vaccinations, newVaccination];
            newVaccination = "";
        }
    }

    function addMedication() {
        if (newMedication && !profile.pastMedications.includes(newMedication)) {
            profile.pastMedications = [
                ...profile.pastMedications,
                newMedication,
            ];
            newMedication = "";
        }
    }

    async function finishOnboarding() {
        if (!$userStore) return;
        try {
            await setDoc(
                doc(db, "user_profiles", /** @type {any} */ ($userStore).uid),
                {
                    ...profile,
                    lastUpdated: new Date().toISOString(),
                    onboardingComplete: true,
                },
            );
            goto("/dashboard");
        } catch (e) {
            console.error("Error saving profile", e);
        }
    }

    let errors = {
        gender: "",
        dob: "",
        contactInfo: "",
        location: "",
        weight: "",
        height: "",
        bloodGroup: "",
    };

    function validateStep() {
        errors = {
            gender: "",
            dob: "",
            contactInfo: "",
            location: "",
            weight: "",
            height: "",
            bloodGroup: "",
        };
        let isValid = true;

        if (step === 1) {
            if (!profile.gender) {
                errors.gender = "Gender is required";
                isValid = false;
            }
            if (!profile.dob) {
                errors.dob = "Date of birth is required";
                isValid = false;
            }
            if (!profile.contactInfo) {
                errors.contactInfo = "Contact information is required";
                isValid = false;
            } else if (!isValidContact(profile.contactInfo)) {
                errors.contactInfo =
                    "Please enter a valid phone number or email address";
                isValid = false;
            }
            if (!profile.location) {
                errors.location = "Location is required";
                isValid = false;
            }
        } else if (step === 2) {
            if (!profile.weight) {
                errors.weight = "Weight is required";
                isValid = false;
            } else if (profile.weight <= 0) {
                errors.weight = "Please enter a valid weight";
                isValid = false;
            }
            if (!profile.height) {
                errors.height = "Height is required";
                isValid = false;
            } else if (profile.height <= 0) {
                errors.height = "Please enter a valid height";
                isValid = false;
            }
            if (!profile.bloodGroup) {
                errors.bloodGroup = "Blood group is required";
                isValid = false;
            }
        }
        return isValid;
    }

    function next() {
        if (validateStep()) {
            if (step < totalSteps) step++;
        }
    }
    function prev() {
        if (step > 1) {
            errors = { contactInfo: "" };
            step--;
        }
    }
</script>

<div in:fade class="max-w-xl mx-auto py-8 px-4">
    <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-bold">Health Questionnaire</h1>
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

    <div class="glass p-6 md:p-8 min-h-[500px] flex flex-col">
        {#if step === 1}
            <!-- Demographics -->
            <div transition:slide class="space-y-6">
                <div>
                    <h2 class="text-xl font-bold">Demographics</h2>
                    <p class="text-sm text-text-muted">
                        Tell us a bit about yourself
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            for="gender"
                            class="block text-sm font-medium mb-1">Gender</label
                        >
                        <select
                            id="gender"
                            bind:value={profile.gender}
                            class="input {errors.gender
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:change={() => (errors.gender = "")}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer_not_to_say"
                                >Prefer not to say</option
                            >
                        </select>
                        {#if errors.gender}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.gender}
                            </div>
                        {/if}
                    </div>
                    <div>
                        <label for="dob" class="block text-sm font-medium mb-1"
                            >Date of Birth</label
                        >
                        <input
                            id="dob"
                            type="date"
                            bind:value={profile.dob}
                            class="input {errors.dob
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:input={() => (errors.dob = "")}
                        />
                        {#if errors.dob}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.dob}
                            </div>
                        {/if}
                    </div>
                    <div class="md:col-span-2">
                        <label
                            for="contactInfo"
                            class="block text-sm font-medium mb-1"
                            >Contact Info (Phone/Alternative Email)</label
                        >
                        <input
                            id="contactInfo"
                            type="text"
                            bind:value={profile.contactInfo}
                            placeholder="e.g. +1 234 567 890 or user@example.com"
                            class="input {errors.contactInfo
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:input={() => (errors.contactInfo = "")}
                        />
                        {#if errors.contactInfo}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.contactInfo}
                            </div>
                        {/if}
                    </div>
                    <div class="md:col-span-2">
                        <label
                            for="location"
                            class="block text-sm font-medium mb-1"
                            >Location</label
                        >
                        <input
                            id="location"
                            type="text"
                            bind:value={profile.location}
                            placeholder="City, Country"
                            class="input {errors.location
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:input={() => (errors.location = "")}
                        />
                        {#if errors.location}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.location}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {:else if step === 2}
            <!-- Physical Measurements -->
            <div transition:slide class="space-y-6">
                <div>
                    <h2 class="text-xl font-bold">Physical Measurements</h2>
                    <p class="text-sm text-text-muted">
                        Your physical statistics help us calibrate sensors
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label
                            for="weight"
                            class="block text-sm font-medium mb-1"
                            >Weight (kg)</label
                        >
                        <input
                            id="weight"
                            type="number"
                            bind:value={profile.weight}
                            placeholder="70"
                            class="input {errors.weight
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:input={() => (errors.weight = "")}
                        />
                        {#if errors.weight}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.weight}
                            </div>
                        {/if}
                    </div>
                    <div>
                        <label
                            for="height"
                            class="block text-sm font-medium mb-1"
                            >Height (cm)</label
                        >
                        <input
                            id="height"
                            type="number"
                            bind:value={profile.height}
                            placeholder="175"
                            class="input {errors.height
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:input={() => (errors.height = "")}
                        />
                        {#if errors.height}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.height}
                            </div>
                        {/if}
                    </div>
                    <div class="md:col-span-2">
                        <label
                            for="bloodGroup"
                            class="block text-sm font-medium mb-1"
                            >Blood Group</label
                        >
                        <select
                            id="bloodGroup"
                            bind:value={profile.bloodGroup}
                            class="input {errors.bloodGroup
                                ? 'border-red-500 ring-1 ring-red-500/50'
                                : ''}"
                            on:change={() => (errors.bloodGroup = "")}
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                        {#if errors.bloodGroup}
                            <div
                                transition:slide
                                class="flex items-center gap-2 mt-2 text-red-400 text-xs font-medium"
                            >
                                <AlertCircle size={14} />
                                {errors.bloodGroup}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {:else if step === 3}
            <!-- Medical History -->
            <div transition:slide class="space-y-6">
                <div>
                    <h2 class="text-xl font-bold">Medical History</h2>
                    <p class="text-sm text-text-muted">
                        Essential for detecting adverse reactions
                    </p>
                </div>

                <!-- Chronic Conditions -->
                <div class="space-y-2">
                    <label
                        for="conditionSearch"
                        class="block text-sm font-medium"
                        >Chronic Conditions</label
                    >
                    <div class="relative">
                        <div class="flex gap-2">
                            <div class="relative flex-1">
                                <Search
                                    class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                                    size={16}
                                />
                                <input
                                    id="conditionSearch"
                                    type="text"
                                    bind:value={conditionSearch}
                                    placeholder="Search or add condition..."
                                    class="input pl-10 mb-0"
                                    on:keydown={(e) =>
                                        e.key === "Enter" &&
                                        addCondition(conditionSearch)}
                                />
                            </div>
                            <button
                                class="btn btn-secondary px-4"
                                on:click={() => addCondition(conditionSearch)}
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {#if filteredSuggestions.length > 0}
                            <div
                                class="absolute z-10 w-full mt-1 glass border border-border rounded-lg overflow-hidden shadow-xl"
                            >
                                {#each filteredSuggestions as suggestion}
                                    <button
                                        class="w-full text-left px-4 py-2 hover:bg-primary/20 transition-colors text-sm"
                                        on:click={() =>
                                            addCondition(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>

                    <div class="flex flex-wrap gap-2 mt-2">
                        {#each profile.chronicConditions as condition}
                            <span
                                class="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs flex items-center gap-2"
                            >
                                {condition}
                                <button
                                    class="hover:text-red-400"
                                    on:click={() =>
                                        (profile.chronicConditions =
                                            profile.chronicConditions.filter(
                                                (c) => c !== condition,
                                            ))}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        {/each}
                    </div>
                </div>

                <!-- Vaccinations -->
                <div class="space-y-2">
                    <label
                        for="newVaccination"
                        class="block text-sm font-medium">Vaccinations</label
                    >
                    <div class="flex gap-2">
                        <input
                            id="newVaccination"
                            type="text"
                            bind:value={newVaccination}
                            placeholder="e.g. COVID-19, Flu"
                            class="input mb-0"
                            on:keydown={(e) =>
                                e.key === "Enter" && addVaccination()}
                        />
                        <button
                            class="btn btn-secondary px-4"
                            on:click={addVaccination}><Plus size={20} /></button
                        >
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                        {#each profile.vaccinations as vacc}
                            <span
                                class="px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-xs flex items-center gap-2"
                            >
                                {vacc}
                                <button
                                    class="hover:text-red-400"
                                    on:click={() =>
                                        (profile.vaccinations =
                                            profile.vaccinations.filter(
                                                (v) => v !== vacc,
                                            ))}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        {/each}
                    </div>
                </div>

                <!-- Past Medications -->
                <div class="space-y-2">
                    <label for="newMedication" class="block text-sm font-medium"
                        >Past Medications</label
                    >
                    <div class="flex gap-2">
                        <input
                            id="newMedication"
                            type="text"
                            bind:value={newMedication}
                            placeholder="e.g. Penicillin, Statins"
                            class="input mb-0"
                            on:keydown={(e) =>
                                e.key === "Enter" && addMedication()}
                        />
                        <button
                            class="btn btn-secondary px-4"
                            on:click={addMedication}><Plus size={20} /></button
                        >
                    </div>
                    <div class="flex flex-wrap gap-2 mt-2">
                        {#each profile.pastMedications as med}
                            <span
                                class="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-xs flex items-center gap-2"
                            >
                                {med}
                                <button
                                    class="hover:text-red-400"
                                    on:click={() =>
                                        (profile.pastMedications =
                                            profile.pastMedications.filter(
                                                (m) => m !== med,
                                            ))}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        {:else if step === 4}
            <!-- Lifestyle -->
            <div transition:slide class="space-y-6">
                <div>
                    <h2 class="text-xl font-bold">Lifestyle</h2>
                    <p class="text-sm text-text-muted">
                        Habits that may influence physiological readings
                    </p>
                </div>

                <div class="space-y-4">
                    <label
                        for="smoking"
                        class="glass p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors rounded-xl"
                    >
                        <div>
                            <div class="font-bold">Smoking</div>
                            <div class="text-xs text-text-muted">
                                Do you smoke tobacco or related products?
                            </div>
                        </div>
                        <input
                            id="smoking"
                            type="checkbox"
                            bind:checked={profile.smoking}
                            class="w-6 h-6 border-primary accent-primary"
                        />
                    </label>

                    <label
                        for="alcohol"
                        class="glass p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors rounded-xl"
                    >
                        <div>
                            <div class="font-bold">Alcohol Use</div>
                            <div class="text-xs text-text-muted">
                                Do you consume alcohol regularly?
                            </div>
                        </div>
                        <input
                            id="alcohol"
                            type="checkbox"
                            bind:checked={profile.alcohol}
                            class="w-6 h-6 border-primary accent-primary"
                        />
                    </label>

                    <label
                        for="drugUse"
                        class="glass p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors rounded-xl"
                    >
                        <div>
                            <div class="font-bold">Other Drug Use</div>
                            <div class="text-xs text-text-muted">
                                Any other substances or medications?
                            </div>
                        </div>
                        <input
                            id="drugUse"
                            type="checkbox"
                            bind:checked={profile.drugUse}
                            class="w-6 h-6 border-primary accent-primary"
                        />
                    </label>
                </div>

                <div
                    class="flex-1 flex flex-col items-center justify-center text-center pt-8 border-t border-border mt-8"
                >
                    <CheckCircle2 size={48} class="text-secondary mb-2" />
                    <h3 class="font-bold">Ready to finish?</h3>
                    <p class="text-xs text-text-muted">
                        You can update these details later in your profile.
                    </p>
                </div>
            </div>
        {/if}

        <div class="mt-auto pt-8 flex justify-between gap-4">
            {#if step > 1}
                <button
                    on:click={prev}
                    class="btn btn-outline flex items-center gap-2 flex-1 md:flex-none"
                >
                    <ChevronLeft size={20} /> Back
                </button>
            {:else}
                <div></div>
            {/if}

            {#if step < totalSteps}
                <button
                    on:click={next}
                    class="btn btn-primary flex items-center justify-center gap-2 flex-1 md:w-32"
                >
                    Next <ChevronRight size={20} />
                </button>
            {:else}
                <button
                    on:click={finishOnboarding}
                    class="btn btn-primary px-8 flex-1 md:flex-none"
                >
                    Complete Profile
                </button>
            {/if}
        </div>
    </div>
</div>

<style>
    @reference "../../app.css";
    .input {
        @apply w-full bg-surface border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all;
    }
</style>
