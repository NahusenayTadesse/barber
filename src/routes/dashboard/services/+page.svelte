<script>
	import { renderComponent } from '$lib/components/ui/data-table/index.js';
	import DataTable from '$lib/components/Table/data-table.svelte';
	import DataTableSort from '$lib/components/Table/data-table-sort.svelte';
	import ImageViewer from '$lib/components/Table/image-viewer.svelte';
	import DataTableLinks from '$lib/components/Table/data-table-links.svelte';

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
			accessorKey: 'image',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Image',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) =>
				renderComponent(ImageViewer, {
					src: row.original.imageUrl,
					alt: row.original.name + ' Image'
				})
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
				return renderComponent(Edit, {
					id: row.original.id,
					action: '?/edit',
					data: data.editForm,
					name: row.original.name,
					price: row.original.price,
					description: row.original.description,
					bookingLink: row.original.bookingLink,
					imageUrl: row.original.imageUrl,
					icon: false
				});
			}
		},

		{
			accessorKey: 'price',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Price',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => {
				return '£ ' + row.original.price;
			}
		},

		{
			accessorKey: 'bookingLink',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Booking Link',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) =>
				renderComponent(DataTableLinks, {
					id: '',
					name: 'Booking Link',
					link: row.original.bookingLink,
					target: '_blank',
					IconComp: SquareArrowOutUpRight,
					tooltip: `Goto ${row.original.name}'s booking link`
				})
		},
		{
			accessorKey: 'description',
			header: ({ column }) =>
				renderComponent(DataTableSort, {
					name: 'Description',
					onclick: column.getToggleSortingHandler()
				}),
			sortable: true,
			cell: ({ row }) => renderComponent(BigText, { text: row.original.description })
		},

		{
			accessorKey: 'edit',
			header: 'Edit',
			sortable: true,
			cell: ({ row }) => {
				// You can pass whatever you need from `row.original` to the component
				return renderComponent(Edit, {
					id: row.original.id,
					action: '?/edit',
					data: data.editForm,
					name: row.original.name,
					price: row.original.price,
					description: row.original.description,
					bookingLink: row.original.bookingLink,
					imageUrl: row.original.imageUrl,
					icon: true
				});
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

	import { formatDate } from '$lib/global.svelte.js';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';

	import { superForm } from 'sveltekit-superforms';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import { Plus, SquareArrowOutUpRight } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	const { form, errors, enhance, delayed, message, allErrors } = superForm(data.form, {
		resetForm: false
	});

	import { toast } from 'svelte-sonner';

	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);
				open = false;
			}
		}
	});

	let filteredList = $derived(data?.allPaymentMethods);
</script>

<svelte:head>
	<title>Barber Services</title>
</svelte:head>
{#key data?.allPaymentMethods}
	<DialogComp title="Add Service" IconComp={Plus} variant="default">
		<form
			action="?/add"
			use:enhance
			method="post"
			id="edit"
			class="flex w-full flex-col gap-4 p-4"
			enctype="multipart/form-data"
		>
			<Errors allErrors={$allErrors} />
			<InputComp {form} {errors} label="Name of Service" type="text" name="name" required={true} />
			<InputComp {form} {errors} label="Price" type="number" name="price" />
			<InputComp {form} {errors} label="Description" type="textarea" name="description" />
			<InputComp {form} {errors} label="Booking Link" type="url" name="bookingLink" />
			<InputComp
				{form}
				{errors}
				label="Image for Service"
				type="file"
				name="imageUrl"
				placeholder="Upload an image for the user"
			/>

			<Button type="submit" class="mt-4" form="edit">
				{#if $delayed}
					<LoadingBtn name="Adding Service" />
				{:else}
					<Plus class="h-4 w-4" />

					Add Service
				{/if}
			</Button>
		</form>
	</DialogComp>
	<br />
	<br />
	<FilterMenu data={data?.allPaymentMethods} bind:filteredList filterKeys={['price']} />
	<DataTable {columns} data={filteredList} search={true} fileName="Barber Services" />
{/key}
