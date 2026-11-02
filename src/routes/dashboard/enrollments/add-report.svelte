<script lang="ts">
	import { ClipboardPen } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import type { Audience } from '$lib/courses';
	import { MAX_MARK, currentSheetWeek, markSheetFor, ukToday } from '$lib/markSheets';
	import { submitWithToast } from '../classes/submit';

	let {
		id,
		name,
		sheet,
		instructor,
		classStart,
		title = 'Add Report'
	}: {
		id: number;
		name: string;
		/** Which mark sheet the student's course follows */
		sheet: Audience;
		/** The class's teacher, filled in as the report's teacher */
		instructor: string | null;
		/** YYYY-MM-DD, used to pick the week the student is on */
		classStart: string | null;
		title?: string;
	} = $props();

	const weeks = $derived(markSheetFor(sheet));
	const weekItems = $derived(
		weeks.map((w) => ({ value: String(w.week), name: `Week ${w.week}: ${w.title}` }))
	);

	let open = $state(false);
	let saving = $state(false);
	let date = $state('');
	let week = $state('1');
	let teacher = $state('');
	let comment = $state('');
	// Bound to number inputs, so a blank mark is null
	let marks = $state<(number | null)[]>([]);

	const skills = $derived(weeks.find((w) => String(w.week) === week)?.skills ?? []);

	// A fresh report each time the dialog opens, on the week the student should be on
	$effect(() => {
		if (!open) return;
		date = ukToday();
		week = String(currentSheetWeek(classStart, date, weeks.length));
		teacher = instructor ?? '';
		comment = '';
	});
	// Marks are per skill, so a different week starts them blank
	$effect(() => {
		marks = skills.map(() => null);
	});

	const given = $derived(marks.filter((m) => typeof m === 'number').length);
</script>

<DialogComp {title} IconComp={ClipboardPen} variant="ghost" bind:open>
	<form
		method="post"
		action="/dashboard/enrollments?/addReport"
		class="flex w-full flex-col gap-4 p-4"
		use:enhance={submitWithToast(
			(b) => (saving = b),
			() => (open = false)
		)}
	>
		<input type="hidden" name="enrolmentId" value={id} />
		<h3 class="text-lg font-semibold">Practice report for {name}</h3>

		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex flex-col gap-2">
				<Label for="report-date-{id}">Date</Label>
				<Input
					id="report-date-{id}"
					name="reportDate"
					type="date"
					bind:value={date}
					max={ukToday()}
					required
				/>
			</div>
			<div class="flex flex-col gap-2">
				<Label for="report-teacher-{id}">Teacher</Label>
				<Input
					id="report-teacher-{id}"
					name="teacherName"
					bind:value={teacher}
					maxlength={255}
					placeholder="Teacher's name"
				/>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<Label>Week of the mark sheet</Label>
			<SelectComp name="week" bind:value={week} items={weekItems} />
		</div>

		<fieldset class="flex flex-col gap-2 rounded-md border p-3">
			<legend class="px-1 text-sm font-medium">Marks out of {MAX_MARK}</legend>
			{#each skills as skill, i (skill)}
				<div class="flex items-center justify-between gap-3">
					<label for="mark-{id}-{i}" class="text-sm">{skill}</label>
					<input type="hidden" name="skill" value={skill} />
					<Input
						id="mark-{id}-{i}"
						name="mark"
						type="number"
						inputmode="numeric"
						min={0}
						max={MAX_MARK}
						step={1}
						class="w-20 shrink-0"
						placeholder="—"
						bind:value={marks[i]}
					/>
				</div>
			{/each}
			<p class="text-xs text-muted-foreground">Leave a skill blank if it wasn't practised.</p>
		</fieldset>

		<div class="flex flex-col gap-2">
			<Label for="report-comment-{id}">Comment</Label>
			<Textarea
				id="report-comment-{id}"
				name="comment"
				bind:value={comment}
				maxlength={5000}
				rows={4}
				placeholder="How the session went and what to work on next"
			/>
		</div>

		<Button type="submit" disabled={saving || (!given && !comment.trim())}>
			{#if saving}
				<LoadingBtn name="Saving" />
			{:else}
				<ClipboardPen class="h-4 w-4" /> Save Report
			{/if}
		</Button>
	</form>
</DialogComp>
