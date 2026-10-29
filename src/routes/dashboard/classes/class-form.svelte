<script lang="ts">
	import { CalendarPlus, Plus, Save, SquarePen, Trash2 } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { shortTime, weekDays, type ClassSession } from '$lib/classes';
	import { submitWithToast } from './submit';

	type ClassItem = {
		id: number;
		courseId: number;
		name: string;
		startDate: string;
		endDate: string | null;
		location: string | null;
		instructor: string | null;
		capacity: number | null;
		notes: string | null;
		isActive: boolean;
		sessions: ClassSession[];
	};

	let {
		courseItems,
		today,
		cls,
		icon = false
	}: {
		courseItems: { value: string; name: string }[];
		today: string;
		/** Present when editing an existing class */
		cls?: ClassItem;
		icon?: boolean;
	} = $props();

	const dayItems = weekDays.map((d) => ({ value: String(d.value), name: d.name }));
	const newSession = () => ({ dayOfWeek: '1', startTime: '10:00', endTime: '16:00' });

	// Rows are rebuilt when the table re-renders, so the starting values are read once
	const blank = () => {
		const c = untrack(() => cls);
		return {
			courseId: c ? String(c.courseId) : '',
			name: c?.name ?? '',
			startDate: c?.startDate ?? untrack(() => today),
			endDate: c?.endDate ?? '',
			location: c?.location ?? '',
			instructor: c?.instructor ?? '',
			capacity: c?.capacity != null ? String(c.capacity) : '',
			notes: c?.notes ?? '',
			isActive: c?.isActive ?? true,
			sessions: c?.sessions.length
				? c.sessions.map((s) => ({
						dayOfWeek: String(s.dayOfWeek),
						startTime: shortTime(s.startTime),
						endTime: shortTime(s.endTime)
					}))
				: [newSession()]
		};
	};

	let values = $state(blank());
	let open = $state(false);
	let saving = $state(false);

	const prefix = untrack(() => (cls ? `class-${cls.id}` : 'class-new'));
	const sessionsJson = $derived(
		JSON.stringify(values.sessions.map((s) => ({ ...s, dayOfWeek: Number(s.dayOfWeek) })))
	);
</script>

<DialogComp
	title={cls ? (icon ? '' : cls.name) : 'Add Class'}
	IconComp={cls ? (icon ? SquarePen : undefined) : CalendarPlus}
	variant={cls ? 'ghost' : 'default'}
	bind:open
>
	<form
		method="post"
		action={cls ? '?/edit' : '?/add'}
		class="flex w-full flex-col gap-4 p-4"
		use:enhance={submitWithToast(
			(busy) => (saving = busy),
			() => {
				open = false;
				if (!cls) values = blank();
			}
		)}
	>
		{#if cls}
			<input type="hidden" name="id" value={cls.id} />
		{/if}
		<input type="hidden" name="sessions" value={sessionsJson} />
		<input type="hidden" name="isActive" value={values.isActive ? 'on' : ''} />

		<div class="flex flex-col gap-2">
			<Label>Course</Label>
			<SelectComp name="courseId" bind:value={values.courseId} items={courseItems} />
			{#if cls && values.courseId !== String(cls.courseId)}
				<p class="text-xs text-destructive">
					Changing the course takes all current students out of this class.
				</p>
			{/if}
		</div>

		<div class="flex flex-col gap-2">
			<Label for="{prefix}-name">Name of Class</Label>
			<Input
				id="{prefix}-name"
				name="name"
				bind:value={values.name}
				placeholder="e.g. January Weekday Group"
				required
				minlength={2}
				maxlength={255}
			/>
		</div>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="flex flex-col gap-2">
				<Label for="{prefix}-start">Starts On</Label>
				<Input
					id="{prefix}-start"
					type="date"
					name="startDate"
					bind:value={values.startDate}
					required
				/>
			</div>
			<div class="flex flex-col gap-2">
				<Label for="{prefix}-end">Ends On (optional)</Label>
				<Input
					id="{prefix}-end"
					type="date"
					name="endDate"
					bind:value={values.endDate}
					min={values.startDate}
				/>
			</div>
		</div>

		<fieldset class="flex flex-col gap-2 rounded-md border p-3">
			<legend class="px-1 text-sm font-medium">Weekly Sessions</legend>
			{#each values.sessions as session, i (i)}
				<div class="grid grid-cols-[1fr_auto] items-end gap-2 sm:grid-cols-[1.3fr_1fr_1fr_auto]">
					<div class="col-span-2 flex flex-col gap-1 sm:col-span-1">
						<span class="text-xs text-muted-foreground">Day</span>
						<SelectComp name="day-{i}" bind:value={session.dayOfWeek} items={dayItems} />
					</div>
					<label class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">From</span>
						<Input type="time" bind:value={session.startTime} required />
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs text-muted-foreground">To</span>
						<Input type="time" bind:value={session.endTime} required />
					</label>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Remove session"
						disabled={values.sessions.length === 1}
						onclick={() => values.sessions.splice(i, 1)}
					>
						<Trash2 class="h-4 w-4" />
					</Button>
				</div>
			{/each}
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="self-start"
				onclick={() => values.sessions.push(newSession())}
			>
				<Plus class="h-4 w-4" /> Add Session
			</Button>
		</fieldset>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<div class="flex flex-col gap-2">
				<Label for="{prefix}-instructor">Instructor (optional)</Label>
				<Input
					id="{prefix}-instructor"
					name="instructor"
					bind:value={values.instructor}
					maxlength={255}
				/>
			</div>
			<div class="flex flex-col gap-2">
				<Label for="{prefix}-capacity">Capacity (optional)</Label>
				<Input
					id="{prefix}-capacity"
					type="number"
					name="capacity"
					bind:value={values.capacity}
					min="1"
					placeholder="No limit"
				/>
			</div>
		</div>

		<div class="flex flex-col gap-2">
			<Label for="{prefix}-location">Location (optional)</Label>
			<Input
				id="{prefix}-location"
				name="location"
				bind:value={values.location}
				placeholder="e.g. Main Studio"
				maxlength={255}
			/>
		</div>

		<div class="flex flex-col gap-2">
			<Label for="{prefix}-notes">Notes (optional)</Label>
			<Textarea
				id="{prefix}-notes"
				name="notes"
				bind:value={values.notes}
				rows={3}
				maxlength={2000}
			/>
		</div>

		<div class="flex items-center gap-2">
			<Checkbox id="{prefix}-active" bind:checked={values.isActive} />
			<Label for="{prefix}-active">Show this class on the timetable</Label>
		</div>

		<Button type="submit" class="mt-2" disabled={saving}>
			{#if saving}
				<LoadingBtn name="Saving Class" />
			{:else if cls}
				<Save class="h-4 w-4" /> Save Changes
			{:else}
				<Plus class="h-4 w-4" /> Add Class
			{/if}
		</Button>
	</form>
</DialogComp>
