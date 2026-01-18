<script>
    import { Info, Shield, Heart, Zap, ArrowRight } from "lucide-svelte";
    import { fade } from "svelte/transition";
</script>

<div in:fade class="space-y-8 py-4">
    <div class="text-center space-y-2">
        <h1 class="text-4xl font-bold">About BioSentry</h1>
        <p class="text-text-muted">
            Empowering patients through intelligent ADR monitoring
        </p>
    </div>

    <div class="glass p-8 space-y-6">
        <section class="space-y-4">
            <h2 class="text-xl font-bold flex items-center gap-2">
                <Shield class="text-primary" />
                Our Mission
            </h2>
            <p class="text-text-muted leading-relaxed">
                BioSentry was founded to bridge the gap between patients and
                medical researchers. Our platform provides real-time monitoring
                for Adverse Drug Reactions (ADRs), ensuring that patients
                receive immediate alerts and researchers get high-quality data
                to make medications safer for everyone.
            </p>
        </section>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
                <h3 class="font-bold flex items-center gap-2">
                    <Heart class="text-secondary" size={20} />
                    Patient Centric
                </h3>
                <p class="text-sm text-text-muted">
                    Simple, easy-to-use interface designed for everyone,
                    regardless of technical skill.
                </p>
            </div>
            <div class="space-y-2">
                <h3 class="font-bold flex items-center gap-2">
                    <Zap class="text-accent" size={20} />
                    Real-time Data
                </h3>
                <p class="text-sm text-text-muted">
                    Direct integration with IoT devices for laboratory-grade
                    precision in your pocket.
                </p>
            </div>
        </div>
    </div>

    <div class="glass p-8">
        <h2 class="text-xl font-bold mb-4">How it Works</h2>
        <div class="space-y-6 relative ml-4 border-l border-border pl-8">
            <div class="relative">
                <div
                    class="absolute -left-10 w-4 h-4 rounded-full bg-primary border-4 border-background mt-1"
                ></div>
                <h4 class="font-bold">1. Connect Device</h4>
                <p class="text-sm text-text-muted">
                    Connect your BioSentry ESP32 device to the app via local
                    Wi-Fi.
                </p>
            </div>
            <div class="relative">
                <div
                    class="absolute -left-10 w-4 h-4 rounded-full bg-secondary border-4 border-background mt-1"
                ></div>
                <h4 class="font-bold">2. Start Monitoring</h4>
                <p class="text-sm text-text-muted">
                    Take your medication and start a measurement session. We'll
                    track your heart rate, temperature, and more.
                </p>
            </div>
            <div class="relative">
                <div
                    class="absolute -left-10 w-4 h-4 rounded-full bg-accent border-4 border-background mt-1"
                ></div>
                <h4 class="font-bold">3. Stay Safe</h4>
                <p class="text-sm text-text-muted">
                    If any unusual reactions are detected, you'll be alerted
                    immediately with emergency instructions.
                </p>
            </div>
        </div>
    </div>

    <div class="flex justify-center pb-12">
        <a
            href="/onboarding"
            class="btn btn-primary flex items-center gap-2 px-8 py-3"
        >
            Proceed to Medical Questionnaire
            <ArrowRight size={20} />
        </a>
    </div>

    <footer class="text-center text-xs text-text-muted pb-8">
        &copy; 2026 BioSentry Technologies. All rights reserved.
    </footer>
</div>
