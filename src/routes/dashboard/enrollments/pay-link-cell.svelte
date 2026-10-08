<script lang="ts">
	import { Copy, CopyCheck, Mail } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';

	let { id, link, email }: { id: number; link: string | null; email: string } = $props();

	let copied = $state(false);
	let sending = $state(false);

	async function copyLink() {
		if (!link) return;
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			toast.error('Copy failed.');
		}
	}
</script>

{#if link}
	<div class="flex items-center gap-1">
		<Button size="sm" variant="outline" onclick={copyLink} title="Copy payment link">
			{#if copied}
				<CopyCheck class="h-4 w-4" /> Copied
			{:else}
				<Copy class="h-4 w-4" /> Copy Link
			{/if}
		</Button>
		<form
			method="post"
			action="?/sendLink"
			use:enhance={() => {
				sending = true;
				return async ({ result }) => {
					sending = false;
					if (result.type === 'success') toast.success(String(result.data?.message));
					else if (result.type === 'failure') toast.error(String(result.data?.message));
					else if (result.type === 'error') toast.error("The email couldn't be sent.");
				};
			}}
		>
			<input type="hidden" name="enrolmentId" value={id} />
			<Button
				size="icon"
				variant="ghost"
				type="submit"
				disabled={sending}
				title="Email the payment link to {email}"
			>
				<Mail class="h-4 w-4 {sending ? 'animate-pulse' : ''}" />
			</Button>
		</form>
	</div>
{:else}
	<span class="text-muted-foreground">—</span>
{/if}
