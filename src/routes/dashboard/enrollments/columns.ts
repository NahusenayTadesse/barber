import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import Copy from '$lib/Copy.svelte';
import DataTableActions from './data-table-actions.svelte';
import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
import { formatDate } from '$lib/global.svelte';
import Statuses from '$lib/components/Table/statuses.svelte';

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
		sortable: true
		// cell: ({ row }) => {
		// 	// You can pass whatever you need from `row.original` to the component
		// 	return renderComponent(DataTableLinks, {
		// 		id: row.original.id,
		// 		name: row.original.customerName,
		// 		link: '/dashboard/customers'
		// 	});
		// }
	},
	{
		accessorKey: 'phone',
		header: 'Phone',
		sortable: true,
		cell: ({ row }) => renderComponent(Copy, { data: row.original.phone })
	},
	{
		accessorKey: 'email',
		header: 'Email',
		sortable: true,
		cell: ({ row }) => renderComponent(Copy, { data: row.original.email })
	},
	{
		accessorKey: 'course',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Course',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true
	},

	{
		accessorKey: 'paymentOption',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Payment Option',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return '£ ' + row.original.paymentOption;
		}

		// cell: ({ row }) => {
		// 	let n = row.original.paymentOption;
		// 	if (n === 'minPrice') {
		// 		n = Math.floor(Number(row.original.minPrice));
		// 	} else if (n === 'threeEqual') {
		// 		n = Math.floor(Number(row.original.basePrice / 3));
		// 	} else if (n === 'basePrice') {
		// 		n = Math.floor(Number(row.original.basePrice));
		// 	}
		// 	return '£ ' + n;
		// }
	},

	{
		accessorKey: 'status',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Status',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return renderComponent(Statuses, {
				status: row.original.status
			});
		}
	},

	{
		accessorKey: 'enrolledAt',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Enrolled At',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => {
			return formatDate(row.original.enrolledAt);
		}
	}

	// {
	// 	accessorKey: 'actions',
	// 	header: 'Actions',
	// 	cell: ({ row }) => {
	// 		// You can pass whatever you need from `row.original` to the component
	// 		return renderComponent(DataTableActions, {
	// 			id: row.original.extraSettings,
	// 			phone: row.original.phone,
	// 			createdBy: row.original.createdBy,
	// 			createdById: row.original.bookedById,
	// 			customerName: row.original.customerName,
	// 			date: row.original.date
	// 		});
	// 	}
	// }
];
