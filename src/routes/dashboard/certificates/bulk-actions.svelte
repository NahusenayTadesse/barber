<script lang="ts">
	import { Ban, Mail, RotateCcw, Trash } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button/index.js';
	import { submitWithToast } from '../classes/submit';

	let {
		selected,
		clear
	}: { selected: { id: number; isActive: boolean; email: string | null }[]; clear: () => void } =
		$props();

	let busy = $state(false);

	const valid = $derived(selected.filter((c) => c.isActive));
	const revoked = $derived(selected.filter((c) => !c.isActive));
	const emailable = $derived(valid.filter((c) => c.email).length);
	const plural = (n: number) => `${n} certificate${n === 1 ? '' : 's'}`;

	const submit = submitWithToast(
		(b) => (busy = b),
		() => clear()
	);

	/** Asks first for actions that can't simply be undone */
	const confirmed = (question: string) => (input: Parameters<typeof submit>[0]) => {
		if (!confirm(question)) {
			input.cancel();
			return;
		}
		return submit(input);
	};
</script>

{#snippet ids(certificates: { id: number }[])}
	{#each certificates as certificate (certificate.id)}
		<input type="hidden" name="id" value={certificate.id} />
	{/each}
{/snippet}

<form method="post" action="?/bulkEmail" use:enhance={submit}>
	{@render ids(valid)}
	<Button
		size="sm"
		variant="outline"
		type="submit"
		disabled={busy || !emailable || !page.data.canEmail}
		title={page.data.canEmail ? undefined : 'Email is not set up yet'}
	>
		<Mail /> Email {emailable}
	</Button>
</form>

{#if valid.length}
	<form
		method="post"
		action="?/bulkRevoke"
		use:enhance={confirmed(
			`Revoke ${plural(valid.length)}? They will show as not valid when checked.`
		)}
	>
		{@render ids(valid)}
		<Button size="sm" variant="outline" type="submit" disabled={busy}>
			<Ban class="text-red-500" /> Revoke {valid.length}
		</Button>
	</form>
{/if}

{#if revoked.length}
	<form method="post" action="?/bulkRestore" use:enhance={submit}>
		{@render ids(revoked)}
		<Button size="sm" variant="outline" type="submit" disabled={busy}>
			<RotateCcw /> Restore {revoked.length}
		</Button>
	</form>
	<form
		method="post"
		action="?/bulkDelete"
		use:enhance={confirmed(`Delete ${plural(revoked.length)} for good? This can't be undone.`)}
	>
		{@render ids(revoked)}
		<Button
			size="sm"
			variant="destructive"
			type="submit"
			disabled={busy}
			title="Only revoked certificates can be deleted"
		>
			<Trash /> Delete {revoked.length}
		</Button>
	</form>
{/if}
