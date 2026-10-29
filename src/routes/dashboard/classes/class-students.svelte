<script lang="ts">
	import { UserMinus, UserPlus, Users } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import ComboboxComp from '$lib/formComponents/ComboboxComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';
	import { submitWithToast } from './submit';

	let {
		id,
		name,
		capacity,
		students,
		candidates
	}: {
		id: number;
		name: string;
		capacity: number | null;
		students: { id: number; name: string; email: string; status: string | null }[];
		candidates: { value: string; name: string }[];
	} = $props();

	let open = $state(false);
	let adding = $state(false);
	let removing = $state<number | null>(null);
	let picked = $state<string>();

	const full = $derived(capacity !== null && students.length >= capacity);
</script>

<DialogComp
	title="{students.length}{capacity !== null ? ` / ${capacity}` : ''}"
	IconComp={Users}
	variant="outline"
	bind:open
>
	<div class="flex w-full flex-col gap-4 p-4">
		<h3 class="text-lg font-semibold">Students in {name}</h3>

		{#if students.length === 0}
			<p class="text-sm text-muted-foreground">No students in this class yet.</p>
		{:else}
			<ul class="flex flex-col divide-y rounded-md border">
				{#each students as student (student.id)}
					<li class="flex items-center justify-between gap-2 p-2">
						<div class="min-w-0">
							<p class="truncate font-medium">{student.name}</p>
							<p class="truncate text-xs text-muted-foreground">{student.email}</p>
						</div>
						<div class="flex shrink-0 items-center gap-2">
							<Statuses status={student.status ?? 'unknown'} />
							<form
								method="post"
								action="?/removeStudent"
								use:enhance={submitWithToast((busy) => (removing = busy ? student.id : null))}
							>
								<input type="hidden" name="enrolmentId" value={student.id} />
								<Button
									type="submit"
									variant="ghost"
									size="icon"
									aria-label="Take {student.name} out of the class"
									disabled={removing === student.id}
								>
									<UserMinus class="h-4 w-4" />
								</Button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}

		{#if full}
			<p class="text-sm text-muted-foreground">
				This class is full. Raise its capacity to add more students.
			</p>
		{:else if candidates.length === 0}
			<p class="text-sm text-muted-foreground">
				Every student on this course is already in this class.
			</p>
		{:else}
			<form
				method="post"
				action="?/assignStudent"
				class="flex flex-col gap-2"
				use:enhance={submitWithToast(
					(busy) => (adding = busy),
					() => (picked = undefined)
				)}
			>
				<input type="hidden" name="classId" value={id} />
				<input type="hidden" name="enrolmentId" value={picked ?? ''} />
				<ComboboxComp name="student" bind:value={picked} items={candidates} required={true} />
				<p class="text-xs text-muted-foreground">
					Only students on this class's course are listed. Picking one already in another class
					moves them here.
				</p>
				<Button type="submit" disabled={!picked || adding}>
					{#if adding}
						<LoadingBtn name="Adding" />
					{:else}
						<UserPlus class="h-4 w-4" /> Add to Class
					{/if}
				</Button>
			</form>
		{/if}
	</div>
</DialogComp>
