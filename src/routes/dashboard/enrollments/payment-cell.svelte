<script lang="ts">
	import { Lock, Pencil, Save } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import Statuses from '$lib/components/Table/statuses.svelte';
	import type { ManualPaymentWay } from '$lib/paymentWays';

	let {
		id,
		name,
		status,
		paidBy,
		paidByStripe,
		paymentWayId
	}: {
		id: number;
		name: string;
		status: 'paid' | 'unpaid' | 'cancelled';
		/** e.g. "Cash", "Stripe", "Not recorded" or "—" */
		paidBy: string;
		/** Paid through Stripe: set automatically, so it can't be changed */
		paidByStripe: boolean;
		paymentWayId: number | null;
	} = $props();

	// Bank Transfer, Cash... (everything but Stripe), loaded with the page
	const ways = $derived((page.data.paymentWays ?? []) as ManualPaymentWay[]);
	const statusItems = [
		{ value: 'paid', name: 'Paid' },
		{ value: 'unpaid', name: 'Unpaid' },
		{ value: 'cancelled', name: 'Cancelled' }
	];

	let open = $state(false);
	let saving = $state(false);
	let newStatus = $state('');
	let newWay = $state('');

	// Start from the student's current payment each time the dialog opens
	$effect(() => {
		if (open) {
			newStatus = status;
			newWay = paymentWayId ? String(paymentWayId) : '';
		}
	});
</script>

<div class="flex items-center gap-2">
	<div class="flex flex-col items-start gap-1">
		<Statuses {status} />
		{#if status === 'paid'}
			<span
				class="flex items-center gap-1 text-xs text-muted-foreground"
				title={paidByStripe
					? "Paid through Stripe: recorded automatically and can't be changed"
					: undefined}
			>
				{#if paidByStripe}<Lock class="size-3" />{/if}
				{paidBy}
			</span>
		{/if}
	</div>

	{#if !paidByStripe}
		<DialogComp title="" IconComp={Pencil} variant="ghost" bind:open>
			<form
				method="post"
				action="?/setPayment"
				class="flex w-full flex-col gap-4 p-4"
				use:enhance={() => {
					saving = true;
					return async ({ result, update }) => {
						saving = false;
						if (result.type === 'success') {
							toast.success(String(result.data?.message));
							open = false;
							await invalidateAll();
						} else if (result.type === 'failure') {
							toast.error(String(result.data?.message));
							await invalidateAll();
						} else if (result.type === 'error') {
							toast.error("The payment couldn't be saved.");
						} else {
							await update();
						}
					};
				}}
			>
				<input type="hidden" name="enrolmentId" value={id} />
				<h3 class="text-lg font-semibold">Payment for {name}</h3>
				<p class="text-sm text-muted-foreground">
					Record a payment made outside the website, such as cash or a bank transfer. Payments made
					online through Stripe are recorded automatically.
				</p>

				<div class="flex flex-col gap-2">
					<Label>Status</Label>
					<SelectComp name="status" bind:value={newStatus} items={statusItems} />
				</div>

				{#if newStatus === 'paid'}
					<div class="flex flex-col gap-2">
						<Label>Paid By</Label>
						<SelectComp name="paymentWayId" bind:value={newWay} items={ways} />
					</div>
					{#if status !== 'paid'}
						<p class="text-xs text-muted-foreground">
							They'll be sent their welcome email, and their payment link stops working.
						</p>
					{/if}
				{:else if newStatus === 'unpaid'}
					<p class="text-xs text-muted-foreground">
						They can pay with their payment link from the Payment Link column.
					</p>
				{/if}

				<Button type="submit" disabled={saving || (newStatus === 'paid' && !newWay)}>
					{#if saving}
						<LoadingBtn name="Saving" />
					{:else}
						<Save class="h-4 w-4" /> Save Payment
					{/if}
				</Button>
			</form>
		</DialogComp>
	{/if}
</div>
