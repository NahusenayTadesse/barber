<script lang="ts">
	import type { Snapshot } from '@sveltejs/kit';

	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { Plus, X } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { add as schema } from './schema';
	import { superForm } from 'sveltekit-superforms/client';
	import Errors from '$lib/formComponents/Errors.svelte';
	import FormCard from '$lib/formComponents/FormCard.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';

	let { data } = $props();

	const { form, errors, enhance, delayed, allErrors, capture, restore, message } = superForm(
		data.form,
		{
			taintedMessage: () => {
				return new Promise((resolve) => {
					resolve(window.confirm('Do you want to leave?\nChanges you made may not be saved.'));
				});
			},
			validators: zod4Client(schema),
			dataType: 'json'
		}
	);

	export const snapshot: Snapshot = { capture, restore };

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

	let images = $state([]);
	let arrParts = `flex flex-col justify-start gap-2 w-full`;

	function addIng() {
		$form.prices = [...$form.prices, { price: 0, amount: '' }];
	}
</script>

<svelte:head>
	<title>Add New Course</title>
</svelte:head>
<FormCard title="Add A Course">
	<form
		use:enhance
		action="?/add"
		id="main"
		class="flex flex-col gap-4"
		method="POST"
		enctype="multipart/form-data"
	>
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

		<Button type="submit" class="mt-4" form="main">
			{#if $delayed}
				<LoadingBtn name="Adding Courses" />
			{:else}
				<Plus class="h-4 w-4" />

				Add Courses
			{/if}
		</Button>
	</form>
</FormCard>
