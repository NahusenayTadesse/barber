<script lang="ts">
	import { Plus, Save, SquarePen } from '@lucide/svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import type { AddDiscount, EditDiscount } from './schema';

	type Discount = {
		id: number;
		name: string;
		percentage: number;
		gender: '' | 'male' | 'female';
		courseIds: string[];
		startDate: string;
		expiryDate: string;
		isActive: boolean;
	};

	let {
		data,
		action,
		courseItems,
		discount,
		icon = false
	}: {
		data: SuperValidated<Infer<AddDiscount | EditDiscount>>;
		action: string;
		courseItems: { value: string; name: string }[];
		/** Present when editing an existing discount */
		discount?: Discount;
		icon?: boolean;
	} = $props();

	// Each row's form is created once per render of the table, which is keyed on
	// the discounts list, so capturing the initial props here is intended.
	const initial = untrack(() => ({ data, discount }));
	const formId = initial.discount ? `edit-discount-${initial.discount.id}` : 'add-discount';

	const { form, errors, enhance, delayed, message, allErrors } = superForm(initial.data, {
		id: formId,
		// Needed to post the array of checked courses
		dataType: 'json',
		resetForm: !initial.discount
	});

	if (initial.discount) {
		const d = initial.discount;
		$form = {
			id: d.id,
			name: d.name,
			percentage: d.percentage,
			gender: d.gender,
			courseIds: d.courseIds,
			startsAt: d.startDate,
			expiresAt: d.expiryDate,
			isActive: d.isActive
		};
	}

	const genderItems = [
		{ value: '', name: 'Everyone' },
		{ value: 'female', name: 'Women only' },
		{ value: 'male', name: 'Men only' }
	];

	$effect(() => {
		if ($message) {
			if ($message.type === 'error') toast.error($message.text);
			else toast.success($message.text);
		}
	});
</script>

<DialogComp
	title={discount ? (icon ? '' : discount.name) : 'Add Discount'}
	IconComp={discount ? (icon ? SquarePen : undefined) : Plus}
	variant={discount ? 'ghost' : 'default'}
>
	<form {action} use:enhance method="post" id={formId} class="flex w-full flex-col gap-4 p-4">
		<Errors allErrors={$allErrors} />
		{#if discount}
			<input type="hidden" name="id" value={discount.id} />
		{/if}
		<InputComp
			{form}
			{errors}
			label="Name of Discount"
			type="text"
			name="name"
			placeholder="e.g. Summer Sale"
			required={true}
		/>
		<InputComp
			{form}
			{errors}
			label="Percentage Off (%)"
			type="number"
			name="percentage"
			min="1"
			max="100"
			required={true}
		/>
		<InputComp
			{form}
			{errors}
			label="Who Gets It"
			type="select"
			name="gender"
			items={genderItems}
		/>
		<p class="-mt-2 text-xs text-muted-foreground">
			For women or men only, students choose their gender when they enrol to get it.
		</p>
		<InputComp
			{form}
			{errors}
			label="Courses"
			type="checkbox"
			name="courseIds"
			items={courseItems}
		/>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<InputComp {form} {errors} label="Starts On" type="date" name="startsAt" />
			<InputComp {form} {errors} label="Expires On" type="date" name="expiresAt" />
		</div>
		<p class="text-xs text-muted-foreground">
			The discount runs from the start of the first day to the end of the expiration day.
		</p>

		<InputComp
			{form}
			{errors}
			label="Enabled"
			type="checkboxSingle"
			name="isActive"
			placeholder="Show this discount on the website"
		/>

		<Button type="submit" class="mt-4" form={formId}>
			{#if $delayed}
				<LoadingBtn name="Saving Discount" />
			{:else if discount}
				<Save class="h-4 w-4" /> Save Changes
			{:else}
				<Plus class="h-4 w-4" /> Add Discount
			{/if}
		</Button>
	</form>
</DialogComp>
