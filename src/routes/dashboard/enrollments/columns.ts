import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import Copy from '$lib/Copy.svelte';
import DataTableActions from './data-table-actions.svelte';
import PayLinkCell from './pay-link-cell.svelte';
import DiscountCell from './discount-cell.svelte';
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
		accessorKey: 'gender',
		header: 'Gender',
		sortable: true,
		cell: ({ row }) =>
			row.original.gender === 'male' ? 'Male' : row.original.gender === 'female' ? 'Female' : '—'
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
		sortable: true
	},

	{
		accessorKey: 'amount',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Amount',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) => '£ ' + row.original.amount
	},

	{
		accessorKey: 'discount',
		header: 'Discount',
		cell: ({ row }) =>
			renderComponent(DiscountCell, {
				id: row.original.id,
				name: row.original.name,
				discount: row.original.discount,
				status: row.original.status,
				amount: row.original.amount,
				owedWithoutDiscount: row.original.owedWithoutDiscount,
				nullified: row.original.nullified
			})
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
		accessorKey: 'payLink',
		header: 'Payment Link',
		cell: ({ row }) =>
			renderComponent(PayLinkCell, {
				id: row.original.id,
				link: row.original.payLink,
				email: row.original.email
			})
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
