<script lang="ts">
	import { Trash } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { submitWithToast } from '../classes/submit';

	let {
		id,
		name,
		status,
		paidByStripe
	}: { id: number; name: string; status: string; paidByStripe: boolean } = $props();

	let open = $state(false);
	let deleting = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger
		class={buttonVariants({ variant: 'ghost', size: 'icon' })}
		title="Delete {name}"
		aria-label="Delete {name}"
	>
		<Trash class="h-4 w-4 text-red-500" />
	</Dialog.Trigger>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Delete {name}?</Dialog.Title>
		</Dialog.Header>
		<p class="text-sm">
			The student's enrolment is removed for good, along with their class place and payment record.
			Use this for test or duplicate registrations.
		</p>
		{#if status === 'paid'}
			<p class="text-sm font-medium text-red-500">
				This student has paid{paidByStripe ? ' through Stripe' : ''}. Deleting them doesn't refund
				anything{paidByStripe ? '' : '. To keep the record, mark them as cancelled instead'}.
			</p>
		{/if}
		<form
			method="post"
			action="?/deleteStudent"
			class="flex justify-end gap-2 pt-2"
			use:enhance={submitWithToast(
				(busy) => (deleting = busy),
				() => (open = false)
			)}
		>
			<input type="hidden" name="enrolmentId" value={id} />
			<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
			<Button type="submit" variant="destructive" disabled={deleting}>
				{#if deleting}
					<LoadingBtn name="Deleting" />
				{:else}
					<Trash /> Delete
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
