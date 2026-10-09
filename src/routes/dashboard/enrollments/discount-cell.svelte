<script lang="ts">
	import { BadgeX } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { formatDate } from '$lib/global.svelte';

	type Nullified = {
		amountPaid: number;
		amountDue: number;
		reason: string;
		nullifiedOn: string;
		by: string;
	};

	let {
		id,
		name,
		discount,
		status,
		amount,
		owedWithoutDiscount,
		nullified
	}: {
		id: number;
		name: string;
		discount: string;
		status: string;
		amount: number;
		/** Suggested amount due once the discount is removed; null when there's none to remove */
		owedWithoutDiscount: number | null;
		nullified: Nullified | null;
	} = $props();

	let open = $state(false);
	let saving = $state(false);
	// Today as a UK calendar date
	const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
</script>

<div class="flex flex-col items-start gap-1">
	<span class={nullified ? 'text-muted-foreground line-through' : ''}>{discount}</span>

	{#if nullified}
		<span class="max-w-64 text-xs text-muted-foreground">
			Removed {formatDate(nullified.nullifiedOn)} by {nullified.by}: {nullified.reason}
			{#if nullified.amountDue > 0}
				(£{nullified.amountDue} due{nullified.amountPaid > 0
					? `, after £${nullified.amountPaid} paid`
					: ''})
			{/if}
		</span>
	{:else if owedWithoutDiscount !== null}
		<DialogComp title="Nullify" IconComp={BadgeX} variant="ghost" bind:open>
			<form
				method="post"
				action="?/nullifyDiscount"
				class="flex w-full flex-col gap-4 p-4"
				use:enhance={() => {
					saving = true;
					return async ({ result }) => {
						saving = false;
						if (result.type === 'success') {
							toast.success(String(result.data?.message));
							open = false;
							await invalidateAll();
						} else if (result.type === 'failure') toast.error(String(result.data?.message));
						else if (result.type === 'error') toast.error("The discount couldn't be removed.");
					};
				}}
			>
				<input type="hidden" name="enrolmentId" value={id} />
				<h3 class="text-lg font-semibold">Nullify discount for this student</h3>
				<p class="text-sm text-muted-foreground">
					Removes <strong>{discount}</strong> from {name}, for example if they gave the wrong gender
					for a women/men-only discount. They become <strong>Unpaid</strong> and their payment link charges
					the amount below.
				</p>
				<p class="text-sm">
					{status === 'paid' ? `Already paid: £${amount}` : `Currently due: £${amount}`}
				</p>

				<div class="flex flex-col gap-2">
					<Label for="amountDue-{id}">Amount still to pay (£)</Label>
					<Input
						id="amountDue-{id}"
						name="amountDue"
						type="number"
						min="0"
						step="0.01"
						value={owedWithoutDiscount}
						required
					/>
					<p class="text-xs text-muted-foreground">
						Filled in with {status === 'paid'
							? 'the discount they got on what they paid'
							: 'the price without the discount'}. Change it if needed; 0 removes the discount
						without asking for money.
					</p>
				</div>

				<div class="flex flex-col gap-2">
					<Label for="reason-{id}">Reason</Label>
					<Textarea
						id="reason-{id}"
						name="reason"
						required
						minlength={5}
						maxlength={1000}
						placeholder="e.g. Claimed the women-only discount but is male (confirmed on ID at induction)"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<Label for="nullifiedOn-{id}">Date</Label>
					<Input id="nullifiedOn-{id}" name="nullifiedOn" type="date" value={today} required />
				</div>

				<p class="text-xs text-muted-foreground">
					Saved with your name for the audit record. This can't be undone.
				</p>

				<Button type="submit" variant="destructive" disabled={saving}>
					{#if saving}
						<LoadingBtn name="Removing Discount" />
					{:else}
						<BadgeX class="h-4 w-4" /> Nullify Discount for This Student
					{/if}
				</Button>
			</form>
		</DialogComp>
	{/if}
</div>
