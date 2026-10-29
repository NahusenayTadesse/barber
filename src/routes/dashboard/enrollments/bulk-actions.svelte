<script lang="ts">
	import { BadgeCheck, Mail, Trash } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import SelectComp from '$lib/formComponents/SelectComp.svelte';
	import type { ManualPaymentWay } from '$lib/paymentWays';
	import { submitWithToast } from '../classes/submit';

	type Student = {
		id: number;
		name: string;
		status: string;
		paidByStripe: boolean;
		classId: number | null;
	};

	let { selected, clear }: { selected: Student[]; clear: () => void } = $props();

	// Bank Transfer, Cash... (everything but Stripe), loaded with the page
	const ways = $derived((page.data.paymentWays ?? []) as ManualPaymentWay[]);
	const canEmail = $derived(Boolean(page.data.canEmail));

	const statusItems = [
		{ value: 'paid', name: 'Paid' },
		{ value: 'unpaid', name: 'Unpaid' },
		{ value: 'cancelled', name: 'Cancelled' }
	];
	const emailItems = [
		{ value: 'payLink', name: 'Payment link (unpaid students)' },
		{ value: 'welcome', name: 'Welcome email (paid students)' },
		{ value: 'classLink', name: 'Class link (paid students)' },
		{ value: 'schedule', name: 'Class schedule (paid students in a class)' },
		{ value: 'custom', name: 'Custom email (everyone selected)' }
	];

	let paymentOpen = $state(false);
	let emailOpen = $state(false);
	let deleteOpen = $state(false);
	let busy = $state(false);

	let status = $state('paid');
	let way = $state('');
	let email = $state('');
	let subject = $state('');
	let message = $state('');

	const count = $derived(selected.length);
	const students = $derived(`${count} student${count === 1 ? '' : 's'}`);
	const paidCount = $derived(selected.filter((s) => s.status === 'paid').length);
	const stripeCount = $derived(selected.filter((s) => s.paidByStripe).length);
	const unpaidCount = $derived(selected.filter((s) => s.status === 'unpaid').length);
	const scheduledCount = $derived(
		selected.filter((s) => s.status === 'paid' && s.classId !== null).length
	);
	const emailable = $derived(
		email === 'custom'
			? count
			: email === 'payLink'
				? unpaidCount
				: email === 'welcome' || email === 'classLink'
					? paidCount
					: email === 'schedule'
						? scheduledCount
						: 0
	);

	const done = (close: () => void) =>
		submitWithToast(
			(b) => (busy = b),
			() => {
				close();
				clear();
			}
		);
</script>

{#snippet ids()}
	{#each selected as student (student.id)}
		<input type="hidden" name="enrolmentId" value={student.id} />
	{/each}
{/snippet}

<!-- Approve: record payment for everyone selected -->
<Dialog.Root bind:open={paymentOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<BadgeCheck /> Payment
	</Dialog.Trigger>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Payment for {students}</Dialog.Title>
		</Dialog.Header>
		<form
			method="post"
			action="?/bulkPayment"
			class="flex flex-col gap-4"
			use:enhance={done(() => (paymentOpen = false))}
		>
			{@render ids()}
			<p class="text-sm text-muted-foreground">
				Record a payment made outside the website, such as cash or a bank transfer, for every
				selected student.
				{#if stripeCount}
					{stripeCount} paid through Stripe and will be skipped.
				{/if}
			</p>

			<div class="flex flex-col gap-2">
				<Label>Status</Label>
				<SelectComp name="status" bind:value={status} items={statusItems} />
			</div>

			{#if status === 'paid'}
				<div class="flex flex-col gap-2">
					<Label>Paid By</Label>
					<SelectComp name="paymentWayId" bind:value={way} items={ways} />
				</div>
				<p class="text-xs text-muted-foreground">
					Newly paid students are sent their welcome email, and their payment links stop working.
				</p>
			{:else}
				<p class="text-xs text-muted-foreground">
					Students whose status changes are emailed about it, as are staff.
				</p>
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (paymentOpen = false)}>
					Cancel
				</Button>
				<Button type="submit" disabled={busy || (status === 'paid' && !way)}>
					{#if busy}
						<LoadingBtn name="Saving" />
					{:else}
						<BadgeCheck /> Save for {students}
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Email: the same email to everyone selected it applies to -->
<Dialog.Root bind:open={emailOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline', size: 'sm' })}>
		<Mail /> Email
	</Dialog.Trigger>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Email {students}</Dialog.Title>
		</Dialog.Header>
		<form
			method="post"
			action="?/bulkEmail"
			class="flex flex-col gap-4"
			use:enhance={done(() => (emailOpen = false))}
		>
			{@render ids()}
			{#if !canEmail}
				<p class="text-sm text-red-500">Email is not set up yet, so nothing can be sent.</p>
			{/if}

			<div class="flex flex-col gap-2">
				<Label>Which email</Label>
				<SelectComp name="email" bind:value={email} items={emailItems} />
			</div>

			{#if email === 'custom'}
				<div class="flex flex-col gap-2">
					<Label for="bulk-subject">Subject</Label>
					<Input id="bulk-subject" name="subject" bind:value={subject} required maxlength={200} />
				</div>
				<div class="flex flex-col gap-2">
					<Label for="bulk-message">Message</Label>
					<Textarea
						id="bulk-message"
						name="message"
						bind:value={message}
						required
						maxlength={10000}
						rows={8}
						placeholder="Leave a blank line between paragraphs."
					/>
					<p class="text-xs text-muted-foreground">
						Each student is greeted by their first name ("Hi Sam,") above your message, and our
						contact details are added below it.
					</p>
				</div>
			{:else if email}
				<p class="text-xs text-muted-foreground">
					{emailable} of the {students} will get it.
					{#if emailable < count}
						The rest are skipped, as it doesn't apply to them.
					{/if}
				</p>
			{/if}

			<div class="flex justify-end gap-2">
				<Button type="button" variant="outline" onclick={() => (emailOpen = false)}>Cancel</Button>
				<Button
					type="submit"
					disabled={busy ||
						!canEmail ||
						!email ||
						!emailable ||
						(email === 'custom' && (!subject.trim() || !message.trim()))}
				>
					{#if busy}
						<LoadingBtn name="Sending" />
					{:else}
						<Mail /> Send
					{/if}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Trigger class={buttonVariants({ variant: 'destructive', size: 'sm' })}>
		<Trash /> Delete
	</Dialog.Trigger>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Delete {students}?</Dialog.Title>
		</Dialog.Header>
		<p class="text-sm">
			Their enrolments are removed for good, along with their class places and payment records. Use
			this for test or duplicate registrations.
		</p>
		{#if paidCount}
			<p class="text-sm font-medium text-red-500">
				{paidCount} of them {paidCount === 1 ? 'has' : 'have'} paid. Deleting doesn't refund anything.
			</p>
		{/if}
		<form
			method="post"
			action="?/bulkDelete"
			class="flex justify-end gap-2 pt-2"
			use:enhance={done(() => (deleteOpen = false))}
		>
			{@render ids()}
			<Button type="button" variant="outline" onclick={() => (deleteOpen = false)}>Cancel</Button>
			<Button type="submit" variant="destructive" disabled={busy}>
				{#if busy}
					<LoadingBtn name="Deleting" />
				{:else}
					<Trash /> Delete {students}
				{/if}
			</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
