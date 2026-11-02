<script lang="ts">
	import { ArrowLeft, Download, Mail, Printer } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { MAX_MARK, formatRange, periodRange, shortDate } from '$lib/markSheets';
	import { printPdf } from '$lib/printPdf';
	import { submitWithToast } from '../../../classes/submit';
	import AddReport from '../../add-report.svelte';

	let { data } = $props();

	const report = $derived(data.report);
	const student = $derived(report.student);

	const here = $derived(resolve('/dashboard/enrollments/[id]/report', { id: String(student.id) }));
	const query = (r: { from: string; to: string }) =>
		`?${new URLSearchParams({ from: r.from, to: r.to })}`;
	const pdfUrl = $derived(`${here}/pdf${query(report)}`);

	const presets = $derived(
		(['thisWeek', 'lastWeek'] as const).map((p) => {
			const r = periodRange(p);
			return {
				label: p === 'thisWeek' ? 'This week' : 'Last week',
				href: here + query(r),
				active: r.from === report.from && r.to === report.to
			};
		})
	);

	let emailing = $state(false);
	let printing = $state(false);
	let deleting = $state(false);
	let deleteOpen = $state<Record<number, boolean>>({});

	async function print() {
		printing = true;
		await printPdf(pdfUrl);
		printing = false;
	}
</script>

<svelte:head>
	<title>Report: {student.name}</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-6">
	<div class="flex flex-col gap-3">
		<a
			href={resolve('/dashboard/enrollments')}
			class="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" /> Enrollments
		</a>
		<div class="flex flex-wrap items-end justify-between gap-3">
			<div>
				<h2 class="text-2xl font-semibold">{student.name}</h2>
				<p class="text-sm text-muted-foreground">
					{[student.course, student.className].filter(Boolean).join(' · ')}
				</p>
			</div>
			<AddReport
				id={student.id}
				name={student.name}
				sheet={student.audience ?? 'men'}
				instructor={student.instructor}
				classStart={student.classStart}
			/>
		</div>
	</div>

	<!-- Which dates the report covers -->
	<div class="flex flex-col gap-3 rounded-lg border p-4">
		<div class="flex flex-wrap gap-2">
			{#each presets as preset (preset.label)}
				<a
					href={preset.href}
					class={buttonVariants({ variant: preset.active ? 'default' : 'outline', size: 'sm' })}
				>
					{preset.label}
				</a>
			{/each}
		</div>
		<form method="get" class="flex flex-wrap items-end gap-3">
			<div class="flex flex-col gap-1">
				<Label for="report-from">From</Label>
				<Input id="report-from" name="from" type="date" value={report.from} required />
			</div>
			<div class="flex flex-col gap-1">
				<Label for="report-to">To</Label>
				<Input id="report-to" name="to" type="date" value={report.to} required />
			</div>
			<Button type="submit" variant="outline">Show</Button>
		</form>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<Button variant="outline" size="sm" onclick={print} disabled={printing}>
			{#if printing}
				<LoadingBtn name="Opening" />
			{:else}
				<Printer /> Print
			{/if}
		</Button>
		<a href="{pdfUrl}&download" class={buttonVariants({ variant: 'outline', size: 'sm' })}>
			<Download /> Download PDF
		</a>
		<form method="post" action="?/email" use:enhance={submitWithToast((b) => (emailing = b))}>
			<input type="hidden" name="from" value={report.from} />
			<input type="hidden" name="to" value={report.to} />
			<Button
				type="submit"
				size="sm"
				disabled={emailing || !data.canEmail || !report.entries.length}
				title={!data.canEmail
					? 'Email is not set up yet'
					: !report.entries.length
						? 'Nothing was reported in this period'
						: `Email to ${student.email}`}
			>
				{#if emailing}
					<LoadingBtn name="Sending" />
				{:else}
					<Mail /> Email to Student
				{/if}
			</Button>
		</form>
	</div>

	<!-- The mark sheet for the period, as on the printed sheet -->
	<section class="flex flex-col gap-4 rounded-lg border bg-card p-4 md:p-6">
		<div class="text-center">
			<p class="text-sm font-semibold tracking-widest">D&amp;D ACADEMY</p>
			<h3 class="text-xl font-bold md:text-2xl">STUDENT PRACTICE &amp; MARK SHEET</h3>
			<p class="text-sm text-muted-foreground">{formatRange(report.from, report.to)}</p>
		</div>

		<dl class="grid grid-cols-1 border sm:grid-cols-2">
			{#each [['Student Name', student.name], ['Days of Class', student.days ?? '—'], ['Teacher Name', student.teacher ?? '—'], ['Course Start Date', student.classStart ? shortDate(student.classStart) : '—']] as [term, value] (term)}
				<div class="border p-3">
					<dt class="text-xs font-semibold uppercase">{term}</dt>
					<dd class="mt-1">{value}</dd>
				</div>
			{/each}
		</dl>

		<div
			class="flex flex-wrap justify-between gap-2 bg-black px-3 py-2 text-xs font-semibold text-white uppercase dark:bg-neutral-800"
		>
			<span>Summary</span>
			<span>
				{report.entries.length} session{report.entries.length === 1 ? '' : 's'}
				{#if report.average !== null}
					· average {report.average}/{MAX_MARK}
				{/if}
			</span>
		</div>

		{#if !report.entries.length}
			<p class="py-8 text-center text-muted-foreground">
				No practice was reported for {student.name} in this period.
			</p>
		{/if}

		{#each report.weeks as week (week.week)}
			<div class="flex flex-col gap-2">
				<div
					class="bg-black px-3 py-2 text-xs font-semibold text-white uppercase dark:bg-neutral-800"
				>
					Week {week.week} &nbsp; {week.title}
				</div>
				<div class="overflow-x-auto">
					<table class="w-full border-collapse text-sm">
						<thead>
							<tr class="bg-muted text-left text-xs">
								<th class="border p-2">Skill</th>
								<th class="border p-2">Marks</th>
								<th class="w-20 border p-2 text-center">/{MAX_MARK}</th>
							</tr>
						</thead>
						<tbody>
							{#each week.skills as skill (skill.skill)}
								<tr>
									<td class="border p-2">{skill.skill}</td>
									<td class="border p-2">
										{#if skill.marks.length}
											<div class="flex flex-wrap gap-1">
												{#each skill.marks as m, i (i)}
													<span class="rounded bg-muted px-2 py-0.5 text-xs whitespace-nowrap">
														{shortDate(m.date)}: <strong>{m.mark}</strong>
													</span>
												{/each}
											</div>
										{:else}
											<span class="text-muted-foreground">Not practised</span>
										{/if}
									</td>
									<td class="border p-2 text-center font-semibold">{skill.average ?? '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/each}
	</section>

	<!-- Each session's report, newest first -->
	{#if report.entries.length}
		<section class="flex flex-col gap-3">
			<h3 class="text-lg font-semibold">Sessions</h3>
			{#each [...report.entries].reverse() as entry (entry.id)}
				<article class="flex flex-col gap-2 rounded-lg border p-4">
					<div class="flex flex-wrap items-start justify-between gap-2">
						<div>
							<p class="font-medium">{shortDate(entry.date)}</p>
							<p class="text-sm text-muted-foreground">
								Week {entry.week}: {entry.weekTitle}
								{#if entry.teacherName}· {entry.teacherName}{/if}
							</p>
						</div>
						<DialogComp
							title="Delete"
							variant="destructive"
							bind:open={() => deleteOpen[entry.id] ?? false, (v) => (deleteOpen[entry.id] = v)}
						>
							<form
								method="post"
								action="?/deleteReport"
								class="flex flex-col gap-4 p-4"
								use:enhance={submitWithToast(
									(b) => (deleting = b),
									() => (deleteOpen[entry.id] = false)
								)}
							>
								<input type="hidden" name="reportId" value={entry.id} />
								<p class="text-sm">
									Delete the report for {shortDate(entry.date)}? Its marks and comment are removed
									for good.
								</p>
								<Button type="submit" variant="destructive" disabled={deleting}>
									{#if deleting}
										<LoadingBtn name="Deleting" />
									{:else}
										Delete Report
									{/if}
								</Button>
							</form>
						</DialogComp>
					</div>
					{#if entry.marks.length}
						<ul class="flex flex-wrap gap-1">
							{#each entry.marks as m (m.skill)}
								<li class="rounded bg-muted px-2 py-0.5 text-xs">
									{m.skill}: <strong>{m.mark}/{MAX_MARK}</strong>
								</li>
							{/each}
						</ul>
					{/if}
					{#if entry.comment}
						<p class="text-sm whitespace-pre-line">{entry.comment}</p>
					{/if}
				</article>
			{/each}
		</section>
	{/if}
</div>
