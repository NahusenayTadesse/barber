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
	import { paymentMethodKindLabels, type PaymentMethodKind } from '$lib/discounts';
	import type { AddMethod, EditMethod } from './schema';

	type Method = {
		id: number;
		name: string;
		kind: PaymentMethodKind;
		instalments: number | null;
		percentOff: number;
		description: string;
		sortOrder: number;
		courseIds: string[];
		isActive: boolean;
	};

	let {
		data,
		action,
		courseItems,
		method,
		icon = false
	}: {
		data: SuperValidated<Infer<AddMethod | EditMethod>>;
		action: string;
		courseItems: { value: string; name: string }[];
		/** Present when editing an existing method */
		method?: Method;
		icon?: boolean;
	} = $props();

	// Each row's form is created once per render of the table, which is keyed on
	// the methods list, so capturing the initial props here is intended.
	const initial = untrack(() => ({ data, method }));
	const formId = initial.method ? `edit-method-${initial.method.id}` : 'add-method';

	const { form, errors, enhance, delayed, message, allErrors } = superForm(initial.data, {
		id: formId,
		// Needed to post the array of checked courses
		dataType: 'json',
		resetForm: !initial.method
	});

	if (initial.method) {
		const { id, name, kind, instalments, percentOff, description, sortOrder, courseIds, isActive } =
			initial.method;
		$form = {
			id,
			name,
			kind,
			instalments,
			percentOff,
			description,
			sortOrder,
			courseIds,
			isActive
		};
	}

	const kindItems = Object.entries(paymentMethodKindLabels).map(([value, name]) => ({
		value,
		name
	}));

	$effect(() => {
		if ($message) {
			if ($message.type === 'error') toast.error($message.text);
			else toast.success($message.text);
		}
	});
</script>

<DialogComp
	title={method ? (icon ? '' : method.name) : 'Add Payment Method'}
	IconComp={method ? (icon ? SquarePen : undefined) : Plus}
	variant={method ? 'ghost' : 'default'}
>
	<form {action} use:enhance method="post" id={formId} class="flex w-full flex-col gap-4 p-4">
		<Errors allErrors={$allErrors} />
		<InputComp
			{form}
			{errors}
			label="Name"
			type="text"
			name="name"
			placeholder="e.g. 2 Equal Instalments"
			required={true}
		/>
		<InputComp {form} {errors} label="How it charges" type="select" name="kind" items={kindItems} />
		{#if $form.kind === 'instalments'}
			<InputComp
				{form}
				{errors}
				label="Number of Instalments"
				type="number"
				name="instalments"
				min="2"
				max="24"
			/>
			<p class="text-xs text-muted-foreground">
				The course price is split equally; the student pays the first instalment at checkout.
			</p>
		{:else if $form.kind === 'deposit'}
			<p class="text-xs text-muted-foreground">
				Charges the course's "Minimum Price to Enroll". Courses without one don't show this method.
			</p>
		{/if}
		<InputComp
			{form}
			{errors}
			label="Extra % Off (optional)"
			type="number"
			name="percentOff"
			min="0"
			max="100"
		/>
		<InputComp
			{form}
			{errors}
			label="Card Text"
			type="textarea"
			name="description"
			rows={3}
			placeholder={'One line each, e.g.\nOne payment, nothing to track\nImmediate confirmation'}
		/>
		<InputComp
			{form}
			{errors}
			label="Courses That Offer It"
			type="checkbox"
			name="courseIds"
			items={courseItems}
		/>
		<InputComp
			{form}
			{errors}
			label="Display Order"
			type="number"
			name="sortOrder"
			placeholder="Lower numbers are shown first"
		/>
		<InputComp
			{form}
			{errors}
			label="Enabled"
			type="checkboxSingle"
			name="isActive"
			placeholder="Offer this payment method"
		/>

		<Button type="submit" class="mt-4" form={formId}>
			{#if $delayed}
				<LoadingBtn name="Saving Payment Method" />
			{:else if method}
				<Save class="h-4 w-4" /> Save Changes
			{:else}
				<Plus class="h-4 w-4" /> Add Payment Method
			{/if}
		</Button>
	</form>
</DialogComp>
