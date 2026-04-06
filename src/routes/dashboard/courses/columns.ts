import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
import BigText from '$lib/components/Table/bigText.svelte';
import ImageViewer from '$lib/components/Table/image-viewer.svelte';
import PriceList from './priceList.svelte';

export const columns = [
	{
		accessorKey: 'index',
		header: '#',
		cell: (info) => info.row.index + 1,
		sortable: false
	},

	{
		accessorKey: 'name',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Name',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableLinks, {
				id: row.original.id,
				name: row.original.name,
				link: '/dashboard/courses/single'
			});
		}
	},

	{
		accessorKey: 'level',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Level',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true
	},
	{
		accessorKey: 'duration',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Duration',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true
	},
	{
		accessorKey: 'target',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Duration',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true
	},
	{
		accessorKey: 'basePrice',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Base Price',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return '£ ' + row.original.basePrice;
		}
	},

	{
		accessorKey: 'description',
		header: 'Description',
		cell: ({ row }) => renderComponent(BigText, { text: row.original.description })
	},

	{
		accessorKey: 'minPrice',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Min Price',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return '£ ' + row.original.minPrice;
		}
	},

	{
		accessorKey: 'minPriceMessage',
		header: 'Min Price Message',
		cell: ({ row }) => renderComponent(BigText, { text: row.original.minPriceMessage })
	},

	{
		accessorKey: 'actions',
		header: 'Actions',
		cell: ({ row }) => {
			// You can pass whatever you need from `row.original` to the component
			return renderComponent(DataTableActions, { id: row.original.id, name: row.original.name });
		}
	}
];
