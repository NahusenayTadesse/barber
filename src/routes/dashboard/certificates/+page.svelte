<script lang="ts">
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import { formatDate } from '$lib/global.svelte.js';
	import IssueCertificate from './issue-certificate.svelte';
	import CertificateActions from './certificate-actions.svelte';
	import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/table-core';

	let { data } = $props();

	type Certificate = (typeof data.certificateList)[number];

	const sortable =
		(name: string) =>
		({ column }: HeaderContext<Certificate, unknown>) =>
			renderComponent(DataTableSort, { name, onclick: column.getToggleSortingHandler() });

	const columns: ColumnDef<Certificate>[] = [
		{
			id: 'index',
			header: '#',
			cell: (info: CellContext<Certificate, unknown>) => {
				const rowIndex = info.table.getRowModel().rows.findIndex((row) => row.id === info.row.id);
				return rowIndex + 1;
			},
			enableSorting: false
		},
		{ accessorKey: 'studentName', header: sortable('Student') },
		{ accessorKey: 'code', header: sortable('Certificate No.') },
		{ accessorKey: 'courseName', header: sortable('Course') },
		{ accessorKey: 'title', header: sortable('Title') },
		{
			accessorKey: 'completedOn',
			header: sortable('Completed'),
			cell: ({ row }: CellContext<Certificate, unknown>) => formatDate(row.original.completedOn)
		},
		{
			accessorKey: 'status',
			header: sortable('Status'),
			cell: ({ row }: CellContext<Certificate, unknown>) =>
				renderComponent(Statuses, { status: row.original.status })
		},
		{
			accessorKey: 'actions',
			header: 'Actions',
			cell: ({ row }: CellContext<Certificate, unknown>) =>
				renderComponent(CertificateActions, {
					id: row.original.id,
					code: row.original.code,
					studentName: row.original.studentName,
					verifyUrl: row.original.verifyUrl,
					email: row.original.email,
					isActive: row.original.isActive
				})
		}
	];

	let filteredList = $derived(data.certificateList);
</script>

<svelte:head>
	<title>Certificates</title>
</svelte:head>

<div class="mb-6 border-b pb-4">
	<h1 class="text-3xl font-bold tracking-tight">Certificates</h1>
	<p class="text-muted-foreground">
		Issue certificates to students who complete a course. Each one has its own number and a QR code
		that anyone can scan to check it is genuine.
	</p>
</div>

<IssueCertificate
	data={data.form}
	enrolmentOptions={data.enrolmentOptions}
	canEmail={data.canEmail}
/>
<br />
<br />

{#key data.certificateList}
	<FilterMenu
		data={data.certificateList}
		bind:filteredList
		filterKeys={['courseName', 'title', 'status']}
	/>
	<DataTable {columns} data={filteredList} search={true} fileName="Certificates" />
{/key}
