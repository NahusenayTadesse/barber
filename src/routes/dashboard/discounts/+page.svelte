<script lang="ts">
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import { formatDate } from '$lib/global.svelte.js';
	import DiscountForm from './discount-form.svelte';
	import Delete from '../services/delete.svelte';
	import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/table-core';

	let { data } = $props();

	type Discount = (typeof data.discounts)[number];

	const sortable =
		(name: string) =>
		({ column }: HeaderContext<Discount, unknown>) =>
			renderComponent(DataTableSort, { name, onclick: column.getToggleSortingHandler() });

	const editCell =
		(icon: boolean) =>
		({ row }: CellContext<Discount, unknown>) =>
			renderComponent(DiscountForm, {
				data: data.editForm,
				action: '?/edit',
				courseItems: data.courseItems,
				discount: row.original,
				icon
			});

	const columns: ColumnDef<Discount>[] = [
		{
			id: 'index',
			header: '#',
			cell: (info: CellContext<Discount, unknown>) => {
				const rowIndex = info.table.getRowModel().rows.findIndex((row) => row.id === info.row.id);
				return rowIndex + 1;
			},
			enableSorting: false
		},
		{ accessorKey: 'name', header: sortable('Name'), cell: editCell(false) },
		{ accessorKey: 'course', header: sortable('Course') },
		{
			accessorKey: 'percentage',
			header: sortable('Discount'),
			cell: ({ row }: CellContext<Discount, unknown>) => row.original.percentage + '% off'
		},
		{
			accessorKey: 'startsAt',
			header: sortable('Starts'),
			cell: ({ row }: CellContext<Discount, unknown>) => formatDate(row.original.startsAt)
		},
		{
			accessorKey: 'expiresAt',
			header: sortable('Expires'),
			cell: ({ row }: CellContext<Discount, unknown>) => formatDate(row.original.expiresAt)
		},
		{
			accessorKey: 'status',
			header: sortable('Status'),
			cell: ({ row }: CellContext<Discount, unknown>) =>
				renderComponent(Statuses, { status: row.original.status })
		},
		{ accessorKey: 'edit', header: 'Edit', cell: editCell(true) },
		{
			accessorKey: 'delete',
			header: 'Delete',
			cell: ({ row }: CellContext<Discount, unknown>) =>
				renderComponent(Delete, { id: row.original.id, action: '?/delete', data: data.deleteForm })
		}
	];

	let filteredList = $derived(data.discounts);
</script>

<svelte:head>
	<title>Course Discounts</title>
</svelte:head>

<div class="mb-6 border-b pb-4">
	<h1 class="text-3xl font-bold tracking-tight">Course Discounts</h1>
	<p class="text-muted-foreground">
		Active discounts are applied automatically to course prices on the website and at checkout. If
		more than one applies to a course, the biggest one is used.
	</p>
</div>

{#key data.discounts}
	<DiscountForm data={data.form} action="?/add" courseItems={data.courseItems} />
	<br />
	<br />
	<FilterMenu data={data.discounts} bind:filteredList filterKeys={['course', 'status']} />
	<DataTable {columns} data={filteredList} search={true} fileName="Course Discounts" />
{/key}
