<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Share, SquarePlus } from '@lucide/svelte';
	import { dashboardApp } from '$lib/pwa.svelte';
</script>

<!-- iPhone and iPad have no install button; Safari's Share sheet does it -->
<Dialog.Root bind:open={dashboardApp.showIosSteps}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title class="text-base">Install on iPhone or iPad</Dialog.Title>
			<Dialog.Description
				>Two taps in Safari puts the dashboard on your home screen.</Dialog.Description
			>
		</Dialog.Header>
		<ol class="space-y-3 text-sm">
			<li class="flex items-center gap-3 rounded-xl border p-3">
				<span
					class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
					>1</span
				>
				<span class="flex-1">
					Tap the <strong>Share</strong> button in Safari's toolbar
				</span>
				<Share class="size-5 shrink-0 text-sky-400" />
			</li>
			<li class="flex items-center gap-3 rounded-xl border p-3">
				<span
					class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
					>2</span
				>
				<span class="flex-1">Scroll down and tap <strong>Add to Home Screen</strong></span>
				<SquarePlus class="size-5 shrink-0" />
			</li>
			<li class="flex items-center gap-3 rounded-xl border p-3">
				<span
					class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary"
					>3</span
				>
				<span class="flex-1"
					>Tap <strong>Add</strong> — the D&amp;D icon appears on your home screen</span
				>
			</li>
		</ol>
		<p class="text-xs text-muted-foreground">
			Using Chrome on iPhone? Tap the Share button next to the address bar instead.
		</p>
		<Button class="w-full rounded-full" onclick={() => (dashboardApp.showIosSteps = false)}
			>Got it</Button
		>
	</Dialog.Content>
</Dialog.Root>
