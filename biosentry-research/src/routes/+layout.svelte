<script>
	import "../app.css";
	import { userStore, authLoading } from "$lib/authStore";
	import {
		Search,
		Database,
		BarChart3,
		Users,
		Settings,
	} from "lucide-svelte";
	import { page } from "$app/stores";
</script>

<div class="min-h-screen flex">
	{#if $authLoading}
		<div class="flex-1 flex items-center justify-center bg-background">
			<div class="text-2xl font-bold animate-pulse">
				BioSentry Research...
			</div>
		</div>
	{:else}
		<!-- Sidebar -->
		<aside
			class="w-64 glass m-4 mr-0 p-6 flex flex-col gap-8 hidden md:flex"
		>
			<div class="flex items-center gap-2">
				<Database class="text-primary w-8 h-8" />
				<span class="text-xl font-bold">Research Portal</span>
			</div>

			<nav class="flex-1 flex flex-col gap-2">
				<a
					href="/"
					class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors {$page
						.url.pathname === '/'
						? 'bg-primary/20 text-primary font-bold'
						: ''}"
				>
					<BarChart3 size={20} />
					<span>Analytics</span>
				</a>
				<a
					href="/drugs"
					class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
				>
					<Database size={20} />
					<span>Drug Database</span>
				</a>
				<a
					href="/reports"
					class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
				>
					<Search size={20} />
					<span>ADR Reports</span>
				</a>
				<a
					href="/users"
					class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors"
				>
					<Users size={20} />
					<span>Patient Data</span>
				</a>
			</nav>

			<button
				class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface transition-colors mt-auto text-text-muted"
			>
				<Settings size={20} />
				<span>Settings</span>
			</button>
		</aside>

		<main class="flex-1 p-8 overflow-y-auto">
			<header class="flex justify-between items-center mb-8">
				<div>
					<h1 class="text-3xl font-bold">
						Pharmacovigilance Overview
					</h1>
					<p class="text-text-muted text-sm">
						Real-time monitoring of adverse drug reactions
					</p>
				</div>
				<div class="flex gap-4">
					<div class="relative">
						<Search
							size={18}
							class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
						/>
						<input
							type="text"
							placeholder="Search drug or symptom..."
							class="input pl-10 mb-0"
						/>
					</div>
					<button class="btn btn-primary">Export Data</button>
				</div>
			</header>

			<slot />
		</main>
	{/if}
</div>
