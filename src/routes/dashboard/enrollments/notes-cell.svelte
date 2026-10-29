<script lang="ts">
	import { NotebookPen } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { submitWithToast } from '../classes/submit';

	let { id, name, notes }: { id: number; name: string; notes: string | null } = $props();

	let open = $state(false);
	let saving = $state(false);
</script>

<div class="flex max-w-64 items-center gap-1">
	{#if notes}
		<span class="line-clamp-2 text-sm whitespace-pre-line" title={notes}>{notes}</span>
	{:else}
		<span class="text-muted-foreground">—</span>
	{/if}
	<DialogComp title={notes ? 'Edit' : 'Add'} IconComp={NotebookPen} variant="ghost" bind:open>
		<form
			method="post"
			action="?/setNotes"
			class="flex w-full flex-col gap-4 p-4"
			use:enhance={submitWithToast(
				(b) => (saving = b),
				() => (open = false)
			)}
		>
			<input type="hidden" name="enrolmentId" value={id} />
			<h3 class="text-lg font-semibold">Notes on {name}</h3>
			<div class="flex flex-col gap-2">
				<Label for="notes-{id}">Notes</Label>
				<Textarea
					id="notes-{id}"
					name="notes"
					value={notes ?? ''}
					maxlength={2000}
					rows={6}
					placeholder="Anything worth remembering about this student"
				/>
				<p class="text-xs text-muted-foreground">
					Includes anything the student wrote when registering. Leave empty to clear.
				</p>
			</div>
			<Button type="submit" disabled={saving}>
				{#if saving}
					<LoadingBtn name="Saving" />
				{:else}
					<NotebookPen class="h-4 w-4" /> Save Notes
				{/if}
			</Button>
		</form>
	</DialogComp>
</div>
