<script lang="ts">
	import { Trash } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { submitWithToast } from './submit';

	let { id, name, studentCount }: { id: number; name: string; studentCount: number } = $props();

	let open = $state(false);
	let deleting = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'destructive', size: 'sm' })}>
		<Trash />
	</Dialog.Trigger>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Delete {name}?</Dialog.Title>
		</Dialog.Header>
		<p class="text-sm">
			The class and its timetable are removed for good.
			{#if studentCount}
				Its {studentCount} student{studentCount === 1 ? '' : 's'} stay enrolled on the course, just without
				a class.
			{/if}
		</p>
		<form
			method="post"
			action="?/delete"
			class="flex justify-end gap-2 pt-2"
			use:enhance={submitWithToast(
				(busy) => (deleting = busy),
				() => (open = false)
			)}
		>
			<input type="hidden" name="id" value={id} />
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
