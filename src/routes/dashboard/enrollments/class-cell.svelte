<script lang="ts">
	import { CalendarDays, Mail, Save } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import Copy from '$lib/Copy.svelte';

	let {
		id,
		name,
		courseId,
		classId,
		className,
		status,
		classLink
	}: {
		id: number;
		name: string;
		courseId: number | null;
		classId: number | null;
		/** e.g. "January Weekday Group" or "No class" */
		className: string;
		status: 'paid' | 'unpaid' | 'cancelled';
		/** For paid students: the link to choose their own class */
		classLink: string | null;
	} = $props();

	type ClassOption = { id: number; name: string; courseId: number };

	// Classes for this student's course, loaded with the page
	const items = $derived([
		{ value: 'none', name: 'No class' },
		...((page.data.classOptions ?? []) as ClassOption[])
			.filter((c) => c.courseId === courseId)
			.map((c) => ({ value: String(c.id), name: c.name }))
	]);

	let open = $state(false);
	let saving = $state(false);
	let emailing = $state(false);
	// 'none' takes the student out of their class
	let picked = $state('none');

	$effect(() => {
		if (open) picked = classId ? String(classId) : 'none';
	});
</script>

<div class="flex items-center gap-1">
	<span class={classId ? '' : 'text-muted-foreground'}>{className}</span>
	{#if status !== 'cancelled' && courseId}
		<DialogComp title="" IconComp={CalendarDays} variant="ghost" bind:open>
			<form
				method="post"
				action="?/setClass"
				class="flex w-full flex-col gap-4 p-4"
				use:enhance={() => {
					saving = true;
					return async ({ result, update }) => {
						saving = false;
						if (result.type === 'success') {
							toast.success(String(result.data?.message));
							open = false;
							await invalidateAll();
						} else if (result.type === 'failure') {
							toast.error(String(result.data?.message));
						} else if (result.type === 'error') {
							toast.error("The student's class couldn't be saved.");
						} else {
							await update();
						}
					};
				}}
			>
				<input type="hidden" name="enrolmentId" value={id} />
				<input type="hidden" name="classId" value={picked === 'none' ? '' : picked} />
				<h3 class="text-lg font-semibold">{name}'s class</h3>

				{#if items.length === 1}
					<p class="text-sm text-muted-foreground">
						There are no classes for this course yet. Add one on the
						<a href={resolve('/dashboard/classes')} class="underline">Class Schedule</a> page.
					</p>
				{:else}
					<div class="flex flex-col gap-2">
						<Label>Class</Label>
						<SelectComp name="class" bind:value={picked} {items} />
					</div>
					<Button type="submit" disabled={saving}>
						{#if saving}
							<LoadingBtn name="Saving" />
						{:else}
							<Save class="h-4 w-4" /> Save
						{/if}
					</Button>
				{/if}
			</form>

			{#if classLink && items.length > 1}
				<div class="flex flex-col gap-2 border-t p-4">
					<h4 class="font-semibold">Or let {name} choose</h4>
					<p class="text-sm text-muted-foreground">
						Paid students are emailed this link automatically when the course has classes with
						places left. Send it again if classes were added after they paid.
					</p>
					<div class="text-sm break-all"><Copy data={classLink} /></div>
					<form
						method="post"
						action="?/sendClassLink"
						use:enhance={() => {
							emailing = true;
							return async ({ result, update }) => {
								emailing = false;
								if (result.type === 'success') {
									toast.success(String(result.data?.message));
								} else if (result.type === 'failure') {
									toast.error(String(result.data?.message));
								} else if (result.type === 'error') {
									toast.error("The class link couldn't be sent.");
								} else {
									await update();
								}
							};
						}}
					>
						<input type="hidden" name="enrolmentId" value={id} />
						<Button type="submit" variant="outline" class="w-full" disabled={emailing}>
							{#if emailing}
								<LoadingBtn name="Sending" />
							{:else}
								<Mail class="h-4 w-4" /> Email Class Link
							{/if}
						</Button>
					</form>
				</div>
			{/if}
		</DialogComp>
	{/if}
</div>
