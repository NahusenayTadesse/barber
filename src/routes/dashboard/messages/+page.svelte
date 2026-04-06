<script>
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import DataTableSort from '$lib/components/Table/data-table-sort.svelte';

	import Edit from './edit.svelte';
	import Delete from './delete.svelte';
	import BigText from './bigText.svelte';

	const columns = [
		{
			id: 'index',
			header: '#',
			cell: (info) => {
				const rowIndex = info.table.getRowModel().rows.findIndex((row) => row.id === info.row.id);
				return rowIndex + 1;
			},
			enableSorting: false
		},

		{
			accessorKey: 'name',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Name',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true
		},

		{
			accessorKey: 'phone',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Phone',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => renderComponent(Copy, { data: row.original.phone })
		},
		{
			accessorKey: 'email',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Email',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => renderComponent(Copy, { data: row.original.email })
		},
		{
			accessorKey: 'subject',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Subject',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true
		},
		{
			accessorKey: 'message',
			header: 'Message',
			sortable: true,
			cell: ({ row }) => renderComponent(BigText, { text: row.original.message })
		},

		{
			accessorKey: 'createdAt',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Submitted At',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return formatDate(row.original.submittedAt);
			}
		},
		{
			accessorKey: '',
			header: 'Delete',
			sortable: true,
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return renderComponent(Delete, {
					id: row.original.id,
					action: '?/delete',
					data: data.deleteForm
				});
			}
		}
	];
	let { data } = $props();

	import Copy from '$lib/Copy.svelte';
	import { formatDate } from '$lib/global.svelte.js';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';

	let filteredList = $derived(data?.allPaymentMethods);
</script>

<svelte:head>
	<title>Messages</title>
</svelte:head>
{#key data?.allPaymentMethods}
	<FilterMenu data={data?.allPaymentMethods} bind:filteredList filterKeys={['subject']} />
	<DataTable {columns} data={filteredList} search={true} fileName="Messages" />
{/key}
