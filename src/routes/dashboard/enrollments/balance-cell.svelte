<script lang="ts">
	import {
		Check,
		Copy,
		CopyCheck,
		Link,
		Lock,
		Pencil,
		Plus,
		Trash2,
		Wallet,
		X
	} from '@lucide/svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import { formatDate } from '$lib/global.svelte';
	import type { ManualPaymentWay } from '$lib/paymentWays';
	import type { PlanProgress } from '$lib/paymentPlan';
	import type { StudentPayment } from './+page.server';

	type Balance = {
		total: number;
		paid: number;
		left: number;
		payments: StudentPayment[];
		/** Instalments in their plan, or null when not paying by instalments */
		instalments: number | null;
		/** How far their payments so far take them through the instalments */
		progress: PlanProgress | null;
		/** Suggested next payment */
		next: number;
		/** Amount of the Stripe link for their next payment, if one is active */
		linkAmount: number | null;
	};

	let {
		id,
		name,
		email,
		status,
		balance,
		payLink
	}: {
		id: number;
		name: string;
		email: string;
		status: 'paid' | 'unpaid' | 'cancelled';
		balance: Balance;
		payLink: string | null;
	} = $props();

	// Bank Transfer, Cash... (everything but Stripe), loaded with the page
	const ways = $derived((page.data.paymentWays ?? []) as ManualPaymentWay[]);
	// Today as a UK calendar date
	const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

	let open = $state(false);
	// Which form is being submitted, so only its button shows it's busy
	let busy = $state<string | null>(null);
	let editingTotal = $state(false);
	let confirmDelete = $state<number | null>(null);
	let way = $state('');
	let copied = $state(false);

	// e.g. "Instalment 2 of 2: £150 of £500 paid", or "1 of 2 instalments paid"
	const instalmentText = $derived.by(() => {
		const p = balance.progress;
		if (!p) return null;
		if (p.covered === p.count) return `All ${p.count} instalments paid`;
		if (p.paidTowardsCurrent > 0) {
			return `Instalment ${p.current} of ${p.count}: £${p.paidTowardsCurrent} of £${p.size} paid`;
		}
		return `${p.covered} of ${p.count} instalments paid (£${p.size} each)`;
	});

	/** Submit a form in the dialog, showing how it went */
	const submit =
		(key: string, failure: string): SubmitFunction =>
		() => {
			busy = key;
			return async ({ result, formElement }) => {
				busy = null;
				if (result.type === 'success') {
					toast.success(String(result.data?.message));
					editingTotal = false;
					confirmDelete = null;
					if (key === 'record') {
						formElement.reset();
						way = '';
					}
					await invalidateAll();
				} else if (result.type === 'failure') {
					toast.error(String(result.data?.message));
					await invalidateAll();
				} else if (result.type === 'error') {
					toast.error(failure);
				}
			};
		};

	async function copyLink() {
		if (!payLink) return;
		try {
			await navigator.clipboard.writeText(payLink);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			toast.error('Copy failed.');
		}
	}
</script>

<div class="flex items-center gap-2">
	<div class="flex flex-col items-start gap-0.5 text-sm">
		{#if status === 'cancelled'}
			<span class="text-muted-foreground">—</span>
		{:else if balance.left === 0 && balance.paid > 0}
			<span class="font-medium text-green-600 dark:text-green-400">Paid in full</span>
		{:else}
			<span class="font-medium">£{balance.left} left</span>
			<span class="text-xs text-muted-foreground">£{balance.paid} of £{balance.total} paid</span>
		{/if}
		{#if instalmentText && status !== 'cancelled'}
			<span class="text-xs text-muted-foreground">{instalmentText}</span>
		{/if}
		{#if balance.linkAmount}
			<span class="flex items-center gap-1 text-xs text-muted-foreground">
				<Link class="size-3" /> £{balance.linkAmount} link sent
			</span>
		{/if}
	</div>

	<DialogComp title="" IconComp={Wallet} variant="ghost" bind:open>
		<div class="flex w-full flex-col gap-5 p-4">
			<div>
				<h3 class="text-lg font-semibold">Payments for {name}</h3>
				{#if instalmentText}
					<p class="text-sm text-muted-foreground">{instalmentText}.</p>
				{/if}
			</div>

			<!-- What they owe, have paid and have left -->
			<div class="grid grid-cols-3 gap-2 text-center">
				<div class="rounded-md border p-2">
					<div class="text-xs text-muted-foreground">Course total</div>
					<div class="font-semibold">£{balance.total}</div>
					{#if balance.instalments && balance.instalments > 1}
						<div class="text-xs text-muted-foreground">in {balance.instalments} instalments</div>
					{/if}
					{#if !editingTotal}
						<button
							type="button"
							class="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline"
							onclick={() => (editingTotal = true)}
						>
							<Pencil class="size-3" /> Change plan
						</button>
					{/if}
				</div>
				<div class="rounded-md border p-2">
					<div class="text-xs text-muted-foreground">Paid</div>
					<div class="font-semibold">£{balance.paid}</div>
				</div>
				<div class="rounded-md border p-2">
					<div class="text-xs text-muted-foreground">Left to pay</div>
					<div class="font-semibold">£{balance.left}</div>
				</div>
			</div>

			{#if editingTotal}
				<form
					method="post"
					action="?/setPlan"
					class="flex flex-col gap-3 rounded-md border p-3"
					use:enhance={submit('total', "The plan couldn't be saved.")}
				>
					<input type="hidden" name="enrolmentId" value={id} />
					<h4 class="font-medium">Payment plan</h4>
					<div class="grid grid-cols-2 gap-3">
						<div class="flex flex-col gap-2">
							<Label for="total-{id}">Course total (£)</Label>
							<Input
								id="total-{id}"
								name="totalPrice"
								type="number"
								min="0"
								step="0.01"
								value={balance.total}
								required
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label for="instalments-{id}">Instalments</Label>
							<Input
								id="instalments-{id}"
								name="planInstalments"
								type="number"
								min="1"
								max="24"
								step="1"
								value={balance.instalments ?? 1}
							/>
						</div>
					</div>
					<p class="text-xs text-muted-foreground">
						The whole price they've agreed to pay, split into equal instalments (1 for a single
						payment). Payments of any amount count towards it.
					</p>
					<div class="flex gap-2">
						<Button type="submit" size="sm" disabled={busy === 'total'}>
							{#if busy === 'total'}<LoadingBtn name="Saving" />{:else}<Check class="h-4 w-4" /> Save
								Plan{/if}
						</Button>
						<Button type="button" size="sm" variant="ghost" onclick={() => (editingTotal = false)}>
							<X class="h-4 w-4" /> Cancel
						</Button>
					</div>
				</form>
			{/if}

			<!-- Payment history -->
			<div class="flex flex-col gap-2">
				<h4 class="font-medium">Payment history</h4>
				{#if balance.payments.length}
					<ul class="divide-y rounded-md border text-sm">
						{#each balance.payments as p (p.id)}
							<li class="flex items-center justify-between gap-2 p-2">
								<div class="flex flex-col">
									<span class="font-medium">£{p.amount} · {p.way}</span>
									<span class="text-xs text-muted-foreground">
										{formatDate(p.paidOn)}{p.by ? ` · recorded by ${p.by}` : ''}{p.note
											? ` · ${p.note}`
											: ''}
									</span>
								</div>
								{#if p.byStripe}
									<span title="Paid through Stripe: recorded automatically and can't be deleted">
										<Lock class="size-4 text-muted-foreground" />
									</span>
								{:else if confirmDelete === p.id}
									<form
										method="post"
										action="?/deletePayment"
										class="flex items-center gap-1"
										use:enhance={submit(`delete-${p.id}`, "The payment couldn't be deleted.")}
									>
										<input type="hidden" name="paymentId" value={p.id} />
										<Button
											type="submit"
											size="sm"
											variant="destructive"
											disabled={busy === `delete-${p.id}`}
										>
											Delete
										</Button>
										<Button
											type="button"
											size="sm"
											variant="ghost"
											onclick={() => (confirmDelete = null)}
										>
											<X class="h-4 w-4" />
										</Button>
									</form>
								{:else}
									<Button
										type="button"
										size="icon"
										variant="ghost"
										title="Delete this payment (recorded by mistake)"
										onclick={() => (confirmDelete = p.id)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<p class="text-sm text-muted-foreground">No payments recorded yet.</p>
				{/if}
			</div>

			{#if status !== 'cancelled'}
				<!-- Bank transfer, cash... -->
				<form
					method="post"
					action="?/recordPayment"
					class="flex flex-col gap-3 rounded-md border p-3"
					use:enhance={submit('record', "The payment couldn't be saved.")}
				>
					<input type="hidden" name="enrolmentId" value={id} />
					<h4 class="font-medium">Record a bank or cash payment</h4>
					<div class="grid grid-cols-2 gap-3">
						<div class="flex flex-col gap-2">
							<Label for="amount-{id}">Amount (£)</Label>
							<Input
								id="amount-{id}"
								name="amount"
								type="number"
								min="0.01"
								step="0.01"
								value={balance.next || ''}
								required
							/>
						</div>
						<div class="flex flex-col gap-2">
							<Label for="paidOn-{id}">Date paid</Label>
							<Input id="paidOn-{id}" name="paidOn" type="date" value={today} required />
						</div>
					</div>
					<div class="flex flex-col gap-2">
						<Label>Paid By</Label>
						<SelectComp name="paymentWayId" bind:value={way} items={ways} />
					</div>
					<div class="flex flex-col gap-2">
						<Label for="note-{id}">Note (optional)</Label>
						<Input
							id="note-{id}"
							name="note"
							maxlength={500}
							placeholder="e.g. Part of 2nd instalment"
						/>
					</div>
					{#if status === 'unpaid'}
						<p class="text-xs text-muted-foreground">
							This is their first payment: they'll be marked as paid and sent their welcome email.
						</p>
					{/if}
					<Button type="submit" disabled={busy === 'record' || !way}>
						{#if busy === 'record'}
							<LoadingBtn name="Saving" />
						{:else}
							<Plus class="h-4 w-4" /> Record Payment
						{/if}
					</Button>
				</form>
			{/if}

			{#if status === 'paid' && (balance.left > 0 || balance.linkAmount)}
				<!-- Stripe link for their next payment -->
				<div class="flex flex-col gap-3 rounded-md border p-3">
					<h4 class="font-medium">Card payment link (Stripe)</h4>
					{#if balance.linkAmount && payLink}
						<p class="text-sm">
							A link for <strong>£{balance.linkAmount}</strong> is active. Once they pay, it's recorded
							here automatically.
						</p>
						<div class="flex flex-wrap items-center gap-2">
							<Button size="sm" variant="outline" onclick={copyLink}>
								{#if copied}<CopyCheck class="h-4 w-4" /> Copied{:else}<Copy class="h-4 w-4" /> Copy Link{/if}
							</Button>
							<form
								method="post"
								action="?/sendLink"
								use:enhance={submit('email', "The email couldn't be sent.")}
							>
								<input type="hidden" name="enrolmentId" value={id} />
								<Button size="sm" variant="outline" type="submit" disabled={busy === 'email'}>
									{#if busy === 'email'}<LoadingBtn name="Sending" />{:else}Email to {email}{/if}
								</Button>
							</form>
							<form
								method="post"
								action="?/setBalanceLink"
								use:enhance={submit('stop', "The link couldn't be stopped.")}
							>
								<input type="hidden" name="enrolmentId" value={id} />
								<input type="hidden" name="amount" value="0" />
								<Button size="sm" variant="ghost" type="submit" disabled={busy === 'stop'}>
									<X class="h-4 w-4" /> Stop Link
								</Button>
							</form>
						</div>
					{/if}

					{#if balance.left > 0}
						<form
							method="post"
							action="?/setBalanceLink"
							class="flex flex-col gap-3"
							use:enhance={submit('link', "The link couldn't be made.")}
						>
							<input type="hidden" name="enrolmentId" value={id} />
							<div class="flex flex-col gap-2">
								<Label for="linkAmount-{id}">
									{balance.linkAmount ? 'New link amount (£)' : 'Amount to pay (£)'}
								</Label>
								<Input
									id="linkAmount-{id}"
									name="amount"
									type="number"
									min="0.01"
									max={balance.left}
									step="0.01"
									value={balance.next}
									required
								/>
							</div>
							<label class="flex items-center gap-2 text-sm">
								<input type="checkbox" name="email" checked class="size-4" />
								Email the link to {email}
							</label>
							{#if balance.linkAmount}
								<p class="text-xs text-muted-foreground">The current link's amount is replaced.</p>
							{/if}
							<Button type="submit" disabled={busy === 'link'}>
								{#if busy === 'link'}
									<LoadingBtn name="Making Link" />
								{:else}
									<Link class="h-4 w-4" />
									{balance.linkAmount ? 'Replace Payment Link' : 'Send New Payment Link'}
								{/if}
							</Button>
						</form>
					{/if}
				</div>
			{:else if status === 'unpaid' && payLink}
				<p class="text-xs text-muted-foreground">
					To pay their first payment by card, send them the link in the Payment Link column.
				</p>
			{/if}
		</div>
	</DialogComp>
</div>
