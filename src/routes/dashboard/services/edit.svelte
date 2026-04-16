<script lang="ts">
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { SquarePen, Save } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { EditService as schema } from './schema';

	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import Errors from '$lib/formComponents/Errors.svelte';

	let {
		data,
		action = '/dashboard/customers?/addCustomer',
		id,
		name,
		price,
		description,
		bookingLink,
		imageUrl,
		icon = false
	}: {
		data: SuperValidated<Infer<schema>>;
		action: string;
		id: number;
		name: string;
		price: number;
		description?: string;
		bookingLink: string;
		imageUrl: string;
		icon: boolean;
	} = $props();

	const { form, errors, enhance, delayed, message, allErrors } = superForm(data, {
		resetForm: false
	});

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

	let open = $state(false);

	$form.id = id;
	$form.name = name;
	$form.price = price;
	$form.description = description ?? '';
	$form.bookingLink = bookingLink;
	$form.imageUrl = imageUrl;

	import { toast } from 'svelte-sonner';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
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
</script>

<DialogComp title={icon ? '' : name} IconComp={icon ? SquarePen : undefined} variant="ghost">
	<form
		{action}
		use:enhance
		method="post"
		id="edit"
		class="flex w-full flex-col gap-4 p-4"
		enctype="multipart/form-data"
	>
		<Errors allErrors={$allErrors} />
		<input type="hidden" name="id" value={$form.id} />
		<InputComp {form} {errors} label="Name of Service" type="text" name="name" required={true} />
		<InputComp {form} {errors} label="Price" type="number" name="price" />
		<InputComp {form} {errors} label="Description" type="textarea" name="description" />
		<InputComp {form} {errors} label="Booking Link" type="url" name="bookingLink" />
		<InputComp
			{form}
			{errors}
			label="Image for Service"
			image={imageUrl ? imageUrl : ''}
			type="file"
			name="imageUrl"
		/>

		<Button type="submit" class="mt-4" form="edit">
			{#if $delayed}
				<LoadingBtn name="Saving Avatar" />
			{:else}
				<Save class="h-4 w-4" />

				Save Changes
			{/if}
		</Button>
	</form>
</DialogComp>
