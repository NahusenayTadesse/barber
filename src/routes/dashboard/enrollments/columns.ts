import { renderComponent } from '$lib/components/ui/data-table/index.js';
import DataTableLinks from '$lib/components/Table/data-table-links.svelte';
import Copy from '$lib/Copy.svelte';
import DataTableActions from './data-table-actions.svelte';
import PayLinkCell from './pay-link-cell.svelte';
import WelcomeEmailCell from './welcome-email-cell.svelte';
import EditStudentCell from './edit-student-cell.svelte';
import DiscountCell from './discount-cell.svelte';
import PaymentCell from './payment-cell.svelte';
import ClassCell from './class-cell.svelte';
import DeleteStudentCell from './delete-student-cell.svelte';
import NotesCell from './notes-cell.svelte';
import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
import { formatDate } from '$lib/global.svelte';

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
		cell: ({ row }) =>
			renderComponent(EditStudentCell, {
				id: row.original.id,
				name: row.original.name,
				firstName: row.original.firstName,
				lastName: row.original.lastName,
				email: row.original.email,
				phone: row.original.phone
			})
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
		accessorKey: 'className',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Class',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true,
		cell: ({ row }) =>
			renderComponent(ClassCell, {
				id: row.original.id,
				name: row.original.name,
				courseId: row.original.courseId,
				classId: row.original.classId,
				className: row.original.className,
				status: row.original.status,
				classLink: row.original.classLink
			})
	},
	{
		accessorKey: 'audience',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'For',
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
		cell: ({ row }) =>
			renderComponent(PaymentCell, {
				id: row.original.id,
				name: row.original.name,
				status: row.original.status,
				paidBy: row.original.paidBy,
				paidByStripe: row.original.paidByStripe,
				paymentWayId: row.original.paymentWayId
			})
	},

	{
		accessorKey: 'paidBy',
		header: ({ column }) =>
			renderComponent(DataTableSort, {
				name: 'Paid By',
				onclick: column.getToggleSortingHandler()
			}),
		sortable: true
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
		accessorKey: 'welcomeEmail',
		header: 'Welcome Email',
		cell: ({ row }) =>
			renderComponent(WelcomeEmailCell, {
				id: row.original.id,
				email: row.original.email,
				status: row.original.status
			})
	},

	{
		accessorKey: 'notes',
		header: 'Notes',
		cell: ({ row }) =>
			renderComponent(NotesCell, {
				id: row.original.id,
				name: row.original.name,
				notes: row.original.notes
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
	},

	{
		accessorKey: 'delete',
		header: 'Delete',
		cell: ({ row }) =>
			renderComponent(DeleteStudentCell, {
				id: row.original.id,
				name: row.original.name,
				status: row.original.status,
				paidByStripe: row.original.paidByStripe
			})
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
