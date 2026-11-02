<script lang="ts">
	import { FileText } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import {
		formatRange,
		periodItems,
		periodRange,
		ukToday,
		weekOf,
		type ReportPeriod
	} from '$lib/markSheets';
	import { submitWithToast } from '../classes/submit';

	let {
		students,
		label = 'Reports',
		onSent
	}: {
		/** Who gets their report; students without one for the dates are skipped */
		students: { id: number; reportCount: number }[];
		label?: string;
		onSent?: () => void;
	} = $props();

	const canEmail = $derived(Boolean(page.data.canEmail));

	let open = $state(false);
	let busy = $state(false);
	let period = $state<ReportPeriod>('thisWeek');
	let from = $state(weekOf(ukToday()).from);
	let to = $state(ukToday());

	const range = $derived(period === 'custom' ? { from, to } : periodRange(period));
	const valid = $derived(Boolean(range.from && range.to && range.from <= range.to));
	const count = $derived(students.length);
	const withReports = $derived(students.filter((s) => s.reportCount > 0).length);
	const noun = (n: number) => `${n} student${n === 1 ? '' : 's'}`;
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<FileText />
		{label}
	</Dialog.Trigger>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Email reports to {noun(count)}</Dialog.Title>
		</Dialog.Header>
		<form
			method="post"
			action="/dashboard/enrollments?/bulkReport"
			class="flex flex-col gap-4"
			use:enhance={submitWithToast(
				(b) => (busy = b),
				() => {
					open = false;
					onSent?.();
				}
			)}
		>
			{#each students as student (student.id)}
				<input type="hidden" name="enrolmentId" value={student.id} />
			{/each}
			<input type="hidden" name="from" value={range.from} />
			<input type="hidden" name="to" value={range.to} />

			{#if !canEmail}
				<p class="text-sm text-red-500">Email is not set up yet, so nothing can be sent.</p>
			{/if}

			<div class="flex flex-col gap-2">
				<Label>Period</Label>
				<SelectComp name="period" bind:value={period} items={periodItems} />
			</div>

			{#if period === 'custom'}
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="flex flex-col gap-2">
						<Label for="bulk-report-from">From</Label>
						<Input id="bulk-report-from" type="date" bind:value={from} max={to} required />
					</div>
					<div class="flex flex-col gap-2">
						<Label for="bulk-report-to">To</Label>
						<Input id="bulk-report-to" type="date" bind:value={to} min={from} required />
					</div>
				</div>
			{/if}

			<p class="text-xs text-muted-foreground">
				{#if valid}
					Each student is emailed their mark sheet for {formatRange(range.from, range.to)} as a PDF.
				{/if}
				Students with no report for these dates are skipped.
				{#if withReports < count}
					{noun(count - withReports)} {count - withReports === 1 ? 'has' : 'have'} no reports yet.
				{/if}
			</p>

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={busy || !canEmail || !valid || !withReports}>
					{#if busy}
						<LoadingBtn name="Sending" />
					{:else}
						<FileText /> Send Reports
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
