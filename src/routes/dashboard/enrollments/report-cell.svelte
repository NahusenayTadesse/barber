<script lang="ts">
	import { FileText } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import type { Audience } from '$lib/courses';
	import { shortDate } from '$lib/markSheets';
	import AddReport from './add-report.svelte';

	let {
		id,
		name,
		status,
		sheet,
		instructor,
		classStart,
		reportCount,
		lastReport
	}: {
		id: number;
		name: string;
		status: 'paid' | 'unpaid' | 'cancelled';
		sheet: Audience;
		instructor: string | null;
		classStart: string | null;
		reportCount: number;
		/** YYYY-MM-DD of the latest report, if any */
		lastReport: string | null;
	} = $props();
</script>

<div class="flex items-center gap-1">
	{#if status !== 'cancelled'}
		<AddReport {id} {name} {sheet} {instructor} {classStart} title="Add" />
	{/if}
	{#if reportCount}
		<a
			href={resolve('/dashboard/enrollments/[id]/report', { id: String(id) })}
			class={buttonVariants({ variant: 'ghost', size: 'sm' })}
			title={lastReport ? `Last report ${shortDate(lastReport)}` : undefined}
		>
			<FileText /> View ({reportCount})
		</a>
	{:else if status === 'cancelled'}
		<span class="text-muted-foreground">—</span>
	{/if}
</div>
