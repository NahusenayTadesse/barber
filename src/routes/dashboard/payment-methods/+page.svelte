<script lang="ts">
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import MethodForm from './method-form.svelte';
	import Delete from '../services/delete.svelte';
	import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/table-core';

	let { data } = $props();

	type Method = (typeof data.methods)[number];

	const sortable =
		(name: string) =>
		({ column }: HeaderContext<Method, unknown>) =>
			renderComponent(DataTableSort, { name, onclick: column.getToggleSortingHandler() });

	const editCell =
		(icon: boolean) =>
		({ row }: CellContext<Method, unknown>) =>
			renderComponent(MethodForm, {
				data: data.editForm,
				action: '?/edit',
				courseItems: data.courseItems,
				method: row.original,
				icon
			});

	const columns: ColumnDef<Method>[] = [
		{
			id: 'index',
			header: '#',
			cell: (info: CellContext<Method, unknown>) => {
				const rowIndex = info.table.getRowModel().rows.findIndex((row) => row.id === info.row.id);
				return rowIndex + 1;
			},
			enableSorting: false
		},
		{ accessorKey: 'name', header: sortable('Name'), cell: editCell(false) },
		{ accessorKey: 'type', header: sortable('Type') },
		{
			accessorKey: 'percentOff',
			header: sortable('Extra Off'),
			cell: ({ row }: CellContext<Method, unknown>) =>
				row.original.percentOff ? row.original.percentOff + '%' : '—'
		},
		{ accessorKey: 'course', header: sortable('Courses') },
		{ accessorKey: 'sortOrder', header: sortable('Order') },
		{
			accessorKey: 'status',
			header: sortable('Status'),
			cell: ({ row }: CellContext<Method, unknown>) =>
				renderComponent(Statuses, { status: row.original.status })
		},
		{ accessorKey: 'edit', header: 'Edit', cell: editCell(true) },
		{
			accessorKey: 'delete',
			header: 'Delete',
			cell: ({ row }: CellContext<Method, unknown>) =>
				renderComponent(Delete, { id: row.original.id, action: '?/delete', data: data.deleteForm })
		}
	];

	let filteredList = $derived(data.methods);
</script>

<svelte:head>
	<title>Payment Methods</title>
</svelte:head>

<div class="mb-6 border-b pb-4">
	<h1 class="text-3xl font-bold tracking-tight">Payment Methods</h1>
	<p class="text-muted-foreground">
		The ways students can pay for a course. Choose which courses offer each one here, or on the
		course's own page.
	</p>
</div>

{#key data.methods}
	<MethodForm data={data.form} action="?/add" courseItems={data.courseItems} />
	<br />
	<br />
	<FilterMenu data={data.methods} bind:filteredList filterKeys={['type', 'status']} />
	<DataTable {columns} data={filteredList} search={true} fileName="Payment Methods" />
{/key}
