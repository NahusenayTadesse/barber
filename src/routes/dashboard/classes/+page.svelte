<script lang="ts">
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import { formatDate } from '$lib/global.svelte.js';
	import { shortTime, sortSessions, weekDays } from '$lib/classes';
	import ClassForm from './class-form.svelte';
	import ClassStudents from './class-students.svelte';
	import DeleteClass from './delete-class.svelte';
	import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/table-core';

	let { data } = $props();

	type ClassRow = (typeof data.classesList)[number];

	const sortable =
		(name: string) =>
		({ column }: HeaderContext<ClassRow, unknown>) =>
			renderComponent(DataTableSort, { name, onclick: column.getToggleSortingHandler() });

	const editCell =
		(icon: boolean) =>
		({ row }: CellContext<ClassRow, unknown>) =>
			renderComponent(ClassForm, {
				courseItems: data.courseItems,
				today: data.today,
				cls: row.original,
				icon
			});

	const columns: ColumnDef<ClassRow>[] = [
		{
			id: 'index',
			header: '#',
			cell: (info: CellContext<ClassRow, unknown>) =>
				info.table.getRowModel().rows.findIndex((row) => row.id === info.row.id) + 1,
			enableSorting: false
		},
		{ accessorKey: 'name', header: sortable('Class'), cell: editCell(false) },
		{ accessorKey: 'course', header: sortable('Course') },
		{ accessorKey: 'schedule', header: 'Schedule' },
		{
			accessorKey: 'startDate',
			header: sortable('Starts'),
			cell: ({ row }: CellContext<ClassRow, unknown>) => formatDate(row.original.startDate)
		},
		{
			accessorKey: 'endDate',
			header: sortable('Ends'),
			cell: ({ row }: CellContext<ClassRow, unknown>) =>
				row.original.endDate ? formatDate(row.original.endDate) : 'Ongoing'
		},
		{
			accessorKey: 'instructor',
			header: sortable('Instructor'),
			cell: ({ row }: CellContext<ClassRow, unknown>) => row.original.instructor ?? '—'
		},
		{
			accessorKey: 'location',
			header: sortable('Location'),
			cell: ({ row }: CellContext<ClassRow, unknown>) => row.original.location ?? '—'
		},
		{
			accessorKey: 'studentCount',
			header: sortable('Students'),
			cell: ({ row }: CellContext<ClassRow, unknown>) =>
				renderComponent(ClassStudents, {
					id: row.original.id,
					name: row.original.name,
					capacity: row.original.capacity,
					students: row.original.students,
					candidates: row.original.candidates
				})
		},
		{
			accessorKey: 'status',
			header: sortable('Status'),
			cell: ({ row }: CellContext<ClassRow, unknown>) =>
				renderComponent(Statuses, { status: row.original.status })
		},
		{ accessorKey: 'edit', header: 'Edit', cell: editCell(true) },
		{
			accessorKey: 'delete',
			header: 'Delete',
			cell: ({ row }: CellContext<ClassRow, unknown>) =>
				renderComponent(DeleteClass, {
					id: row.original.id,
					name: row.original.name,
					studentCount: row.original.studentCount
				})
		}
	];

	let filteredList = $derived(data.classesList);

	// This week's timetable: every session of the classes running or about to start
	const timetable = $derived(
		weekDays.map((day) => ({
			...day,
			slots: sortSessions(
				data.classesList
					.filter((c) => c.status === 'running' || c.status === 'upcoming')
					.flatMap((c) =>
						c.sessions.filter((s) => s.dayOfWeek === day.value).map((s) => ({ ...s, cls: c }))
					)
			)
		}))
	);
</script>

<svelte:head>
	<title>Class Schedule</title>
</svelte:head>

<div class="mb-6 border-b pb-4">
	<h1 class="text-3xl font-bold tracking-tight">Class Schedule</h1>
	<p class="text-muted-foreground">
		Set up a class for each group of students taking a course together, with the days and times it
		meets. Then add students to it here, or from the Class column on the Enrollments page.
	</p>
</div>

{#key data.classesList}
	<ClassForm courseItems={data.courseItems} today={data.today} />

	<section class="my-8">
		<h2 class="mb-3 text-lg font-semibold md:text-2xl">Weekly Timetable</h2>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
			{#each timetable as day (day.value)}
				<div class="flex flex-col gap-2 rounded-lg border p-3">
					<h3 class="font-semibold">{day.name}</h3>
					{#each day.slots as slot, i (i)}
						<div class="rounded-md border-l-4 border-primary bg-muted/50 p-2 text-sm">
							<p class="font-medium">{shortTime(slot.startTime)}–{shortTime(slot.endTime)}</p>
							<p>{slot.cls.name}</p>
							<p class="text-xs text-muted-foreground">{slot.cls.course}</p>
							<p class="text-xs text-muted-foreground">
								{slot.cls.studentCount}{slot.cls.capacity !== null ? ` / ${slot.cls.capacity}` : ''}
								students{slot.cls.status === 'upcoming'
									? ` · starts ${formatDate(slot.cls.startDate)}`
									: ''}
							</p>
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No classes</p>
					{/each}
				</div>
			{/each}
		</div>
	</section>

	<FilterMenu data={data.classesList} bind:filteredList filterKeys={['course', 'status']} />
	<DataTable {columns} data={filteredList} search={true} fileName="Class Schedule" />
{/key}
