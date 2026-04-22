<script lang="ts">
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { edit as schema } from './schema';

	let { data } = $props();

	import SingleTable from '$lib/components/SingleTable.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { superForm } from 'sveltekit-superforms/client';

	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { ArrowLeft, Pencil, Save } from '@lucide/svelte';
	import type { Snapshot } from '@sveltejs/kit';

	import Delete from '$lib/forms/Delete.svelte';
	import SingleView from '$lib/components/SingleView.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';

	import { formatDate } from '$lib/global.svelte';

	let singleTable = $derived([
		{ name: 'Name', value: data.course?.name },
		{ name: 'Level', value: data.course?.level },
		{ name: 'Duration', value: data.course?.duration },
		{ name: 'Experience', value: data.course?.experience },
		{ name: 'Target', value: data.course?.target },
		{ name: 'Base Price', value: data.course?.basePrice },
		{ name: 'Description', value: data.course?.description },
		{ name: 'Min Price', value: data.course?.minPrice },
		{ name: 'Min Price Message', value: data.course?.minPriceMessage },
		{ name: 'Created At', value: formatDate(data.course?.createdAt) },
		{ name: 'Status', value: data?.course?.status ? 'Active' : 'Inactive' }
	]);

	const { form, errors, enhance, delayed, capture, restore, allErrors, message } = superForm(
		data.form,
		{
			validators: zod4Client(schema),
			resetForm: false,
			dataType: 'json'
		}
	);

	import { toast } from 'svelte-sonner';
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);
			}
		}
	});

	export const snapshot: Snapshot = { capture, restore };

	//   let date = $derived(dateProxy(editForm, 'appointmentDate', { format: 'date'}));

	let edit = $state(false);
</script>

<svelte:head>
	<title>Course Details</title>
</svelte:head>
<SingleView title="Course Details" class="w-full!">
	<div class="mt-4 flex w-full flex-row items-start justify-start gap-2 pl-4">
		<Button onclick={() => (edit = !edit)}>
			{#if !edit}
				<Pencil class="h-4 w-4" />
				Edit
			{:else}
				<ArrowLeft class="h-4 w-4" />

				Back
			{/if}
		</Button>

		<Delete redirect="/dashboard/courses" />
	</div>
	{#if edit === false}
		<div class="w-full p-4">
			<SingleTable {singleTable} />
		</div>
	{/if}
	{#if edit}
		<div class="w-full p-4">
			<form action="?/edit" use:enhance class="flex flex-col gap-4" id="edit" method="post">
				<Errors allErrors={$allErrors} />
				<InputComp
					{form}
					{errors}
					type="text"
					name="name"
					label="Course Name"
					placeholder="Enter Course Name"
					required
				/>
				<InputComp
					{form}
					{errors}
					type="text"
					name="level"
					label="Course Level"
					placeholder="Enter Level"
				/>
				<InputComp
					{form}
					{errors}
					type="text"
					name="duration"
					label="Course Duration"
					placeholder="Enter Duration"
				/>
				<InputComp
					{form}
					{errors}
					type="number"
					name="basePrice"
					label="Base Price"
					placeholder="Enter Price"
				/>

				<InputComp
					{form}
					{errors}
					type="text"
					name="target"
					label="Target Audience"
					placeholder="Enter Target Audience"
				/>

				<InputComp
					{form}
					{errors}
					type="text"
					name="experience"
					label="Experience Level to Enroll"
					placeholder="Enter Experience Level"
				/>

				<InputComp
					{form}
					{errors}
					type="textarea"
					name="description"
					label="Course Description"
					placeholder="Enter Course Description"
				/>

				<InputComp
					{form}
					{errors}
					type="number"
					name="minPrice"
					label="Minimum Price to Enroll"
					placeholder="Enter Minimum Price for deposit to enroll"
				/>

				<InputComp
					{form}
					{errors}
					type="textarea"
					name="minPriceMessage"
					label="Minimum Price Message"
					placeholder="Enter Minimum Price Message"
				/>

				<InputComp
					{form}
					{errors}
					type="select"
					name="status"
					label="Status"
					placeholder="Status"
					items={[
						{ value: true, name: 'Active' },
						{ value: false, name: 'Inactive' }
					]}
				/>

				<Button form="edit" type="submit" class="mt-4">
					{#if $delayed}
						<LoadingBtn name="Saving Changes" />
					{:else}
						<Save class="h-4 w-4" />
						Save Changes
					{/if}
				</Button>
			</form>
		</div>
	{/if}
</SingleView>
