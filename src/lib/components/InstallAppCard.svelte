<script lang="ts">
	import { Download, X, Smartphone, Zap, ListChecks } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import { dashboardApp } from '$lib/pwa.svelte';

	async function install() {
		if (await dashboardApp.install())
			toast.success('Dashboard app installed — find it on your home screen');
	}
</script>

{#if dashboardApp.installable && !dashboardApp.dismissed}
	<section
		aria-labelledby="install-app-title"
		class="relative overflow-hidden rounded-2xl border border-primary/30 bg-linear-to-br from-primary/15 via-primary/5 to-transparent p-4 md:p-5"
	>
		<button
			type="button"
			onclick={() => dashboardApp.dismiss()}
			class="absolute top-2 right-2 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
			aria-label="Hide install suggestion"
		>
			<X class="size-4" />
		</button>

		<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
			<div class="flex items-center gap-4 pr-8 sm:flex-1">
				<img
					src="/pwa/icon-192.png"
					alt=""
					class="size-14 shrink-0 rounded-2xl shadow-lg shadow-primary/20"
				/>
				<div class="min-w-0">
					<h3 id="install-app-title" class="text-base font-semibold">Install the dashboard app</h3>
					<p class="text-sm text-muted-foreground">
						Open it from your home screen like any other app — full screen, no browser bars.
					</p>
				</div>
			</div>
			<Button size="lg" class="w-full rounded-full sm:w-auto" onclick={install}>
				<Download /> Install app
			</Button>
		</div>

		<ul class="mt-4 hidden gap-6 text-xs text-muted-foreground md:flex">
			<li class="flex items-center gap-1.5">
				<Smartphone class="size-3.5" /> One tap from your home screen
			</li>
			<li class="flex items-center gap-1.5"><Zap class="size-3.5" /> Opens faster</li>
			<li class="flex items-center gap-1.5">
				<ListChecks class="size-3.5" /> Shortcuts to register students and issue certificates
			</li>
		</ul>
	</section>
{/if}
