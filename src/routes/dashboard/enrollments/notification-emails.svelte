<script lang="ts">
	import { BellRing, Lock, Plus, X } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';

	let {
		always,
		saved
	}: {
		/** The SMTP account, always notified */
		always: string | null;
		saved: { id: number; email: string }[];
	} = $props();

	let busy = $state(false);

	// Shows the result and refreshes the list
	const handle: SubmitFunction = ({ formElement }) => {
		busy = true;
		return async ({ result, update }) => {
			busy = false;
			if (result.type === 'success') {
				toast.success(String(result.data?.message));
				formElement.reset();
				await update();
			} else if (result.type === 'failure') toast.error(String(result.data?.message));
			else if (result.type === 'error') toast.error('Something went wrong. Please try again.');
		};
	};
</script>

<DialogComp title="Notification Emails" IconComp={BellRing} variant="outline">
	<div class="flex w-full flex-col gap-4 p-4">
		<p class="text-sm text-muted-foreground">
			These addresses get an email every time a student enrolls and pays. They don't need a
			dashboard account.
		</p>

		<ul class="flex flex-col divide-y rounded-md border">
			{#if always}
				<li class="flex items-center justify-between gap-2 px-3 py-2 text-sm">
					<span class="truncate">{always}</span>
					<span class="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
						<Lock class="h-3 w-3" /> Always notified
					</span>
				</li>
			{/if}
			{#each saved as item (item.id)}
				<li class="flex items-center justify-between gap-2 px-3 py-2 text-sm">
					<span class="truncate">{item.email}</span>
					<form method="post" action="?/removeNotificationEmail" use:enhance={handle}>
						<input type="hidden" name="id" value={item.id} />
						<Button
							size="icon"
							variant="ghost"
							type="submit"
							disabled={busy}
							title="Stop notifying {item.email}"
						>
							<X class="h-4 w-4" />
						</Button>
					</form>
				</li>
			{/each}
			{#if !always && saved.length === 0}
				<li class="px-3 py-2 text-sm text-muted-foreground">No one is notified yet.</li>
			{/if}
		</ul>

		<form
			method="post"
			action="?/addNotificationEmail"
			class="flex flex-col gap-2"
			use:enhance={handle}
		>
			<Label for="notification-email">Add an email</Label>
			<div class="flex gap-2">
				<Input
					id="notification-email"
					name="email"
					type="email"
					placeholder="name@example.com"
					required
					maxlength={255}
				/>
				<Button type="submit" disabled={busy}>
					<Plus class="h-4 w-4" /> Add
				</Button>
			</div>
		</form>
	</div>
</DialogComp>
