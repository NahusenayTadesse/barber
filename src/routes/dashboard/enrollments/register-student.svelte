<script module lang="ts">
	import type { ActiveDiscount, PaymentMethod } from '$lib/discounts';

	export type CourseOption = {
		id: number;
		name: string;
		basePrice: string;
		minPrice: string | null;
		isActive: boolean;
		/** Live discounts, including women/men-only ones */
		discounts: ActiveDiscount[];
		methods: PaymentMethod[];
	};
</script>

<script lang="ts">
	import { CircleCheck, Copy, CopyCheck, Mail, MessageCircle, UserPlus } from '@lucide/svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { enhance as enhanceAction } from '$app/forms';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { amountSuffix, bestDiscount, methodAmountFor } from '$lib/discounts';
	import { registerStudent, type RegisterStudent } from './schema';

	let {
		data,
		coursesList,
		canEmail
	}: {
		data: SuperValidated<Infer<RegisterStudent>>;
		coursesList: CourseOption[];
		canEmail: boolean;
	} = $props();

	type Registered = {
		text: string;
		enrolmentId: number;
		link: string | null;
		firstName: string;
		email: string;
		phone: string;
		course: string;
		amount: number;
	};

	// Opened straight away from the dashboard's quick links (/dashboard/enrollments?register)
	let open = $state(page.url.searchParams.has('register'));
	// Set after a successful registration: the dialog then shows the student's payment link
	let registered = $state<Registered | null>(null);
	let copied = $state(false);
	let sending = $state(false);

	const { form, errors, enhance, delayed, allErrors } = superForm(
		untrack(() => data),
		{
			id: 'register-student',
			validators: zod4Client(registerStudent),
			onUpdated({ form: result }) {
				const msg = result.message;
				if (!msg) return;
				if (msg.type !== 'success') {
					toast.error(msg.text);
					return;
				}
				toast.success(msg.text);
				registered = {
					text: msg.text,
					enrolmentId: msg.enrolmentId,
					link: msg.link,
					firstName: result.data.firstName,
					email: result.data.email,
					phone: result.data.phone,
					course: coursesList.find((c) => String(c.id) === result.data.courseId)?.name ?? '',
					amount: result.data.amount
				};
			},
			onChange(event) {
				// Suggest today's price when the course, option or gender changes; it can still be edited
				if (event.paths.some((p) => ['courseId', 'paymentMethodId', 'gender'].includes(p))) {
					const course = coursesList.find((c) => String(c.id) === $form.courseId);
					const method = course?.methods.find((m) => String(m.id) === $form.paymentMethodId);
					// A method the newly chosen course doesn't offer
					if (!method && $form.paymentMethodId) $form.paymentMethodId = '';
					const percentage = bestDiscount(course?.discounts ?? [], $form.gender)?.percentage;
					const amount = methodAmountFor(course, method, percentage);
					if (amount > 0) $form.amount = amount;
				}
			}
		}
	);

	const courseItems = $derived(
		coursesList.map((c) => ({
			value: String(c.id),
			name: c.isActive ? c.name : `${c.name} (inactive)`
		}))
	);
	// The payment methods the chosen course offers
	const selectedCourse = $derived(coursesList.find((c) => String(c.id) === $form.courseId));
	const discount = $derived(bestDiscount(selectedCourse?.discounts ?? [], $form.gender));
	const optionItems = $derived(
		(selectedCourse?.methods ?? []).map((m) => ({
			value: String(m.id),
			name: `${m.name} — £${methodAmountFor(selectedCourse, m, discount?.percentage)}${amountSuffix(m)}`
		}))
	);
	const genderItems = [
		{ value: '', name: 'Not specified' },
		{ value: 'male', name: 'Male' },
		{ value: 'female', name: 'Female' }
	];
	const statusItems = [
		{ value: 'unpaid', name: 'Unpaid — send a payment link' },
		{ value: 'paid', name: 'Paid' }
	];

	// wa.me needs the number in international format, without + or spaces
	const whatsappHref = $derived.by(() => {
		if (!registered?.link || !registered.phone) return '';
		const digits = registered.phone.replace(/\D/g, '');
		const number = digits.startsWith('0') ? `44${digits.slice(1)}` : digits;
		const text = `Hi ${registered.firstName}, here is your link to pay £${registered.amount} for the ${registered.course} at D&D Barber Academy: ${registered.link}`;
		return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
	});

	function onOpenChange(isOpen: boolean) {
		// Closing after a registration starts the next one from a blank form
		if (!isOpen) registered = null;
	}

	async function copyLink() {
		if (!registered?.link) return;
		try {
			await navigator.clipboard.writeText(registered.link);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			toast.error('Copy failed. Select the link and copy it instead.');
		}
	}
</script>

<DialogComp
	title="Register Student"
	IconComp={UserPlus}
	variant="default"
	bind:open={() => open, (v) => ((open = v), onOpenChange(v))}
>
	{#if registered}
		<div class="flex w-full flex-col gap-4 p-4">
			<p class="flex items-center gap-2 font-medium">
				<CircleCheck class="h-5 w-5 text-green-500" />
				{registered.text}
			</p>

			{#if registered.link}
				<p class="text-sm text-muted-foreground">
					Send {registered.firstName} this link to pay £{registered.amount} by card. It's marked paid
					automatically once they do. You can also close this and send it later.
				</p>
				<div class="flex gap-2">
					<Input
						readonly
						value={registered.link}
						aria-label="Payment link"
						onfocus={(e) => e.currentTarget.select()}
					/>
					<Button onclick={copyLink} variant="outline" class="shrink-0" title="Copy link">
						{#if copied}
							<CopyCheck class="h-4 w-4" /> Copied
						{:else}
							<Copy class="h-4 w-4" /> Copy
						{/if}
					</Button>
				</div>
				<div class="flex flex-wrap gap-2">
					<form
						method="post"
						action="?/sendLink"
						use:enhanceAction={() => {
							sending = true;
							return async ({ result }) => {
								sending = false;
								if (result.type === 'success') toast.success(String(result.data?.message));
								else if (result.type === 'failure') toast.error(String(result.data?.message));
								else if (result.type === 'error') toast.error("The email couldn't be sent.");
							};
						}}
					>
						<input type="hidden" name="enrolmentId" value={registered.enrolmentId} />
						<Button type="submit" disabled={!canEmail || sending}>
							{#if sending}
								<LoadingBtn name="Sending" />
							{:else}
								<Mail class="h-4 w-4" /> Email to {registered.email}
							{/if}
						</Button>
					</form>
					{#if whatsappHref}
						<Button variant="outline" href={whatsappHref} target="_blank" rel="noopener">
							<MessageCircle class="h-4 w-4" /> WhatsApp
						</Button>
					{/if}
				</div>
				{#if !canEmail}
					<p class="text-xs text-muted-foreground">
						Email isn't set up on the server yet (SMTP settings). Copy the link instead.
					</p>
				{/if}
			{/if}

			<Button variant="ghost" onclick={() => (registered = null)}>
				<UserPlus class="h-4 w-4" /> Register Another Student
			</Button>
		</div>
	{:else}
		<form
			action="?/register"
			use:enhance
			method="post"
			id="register-student"
			class="flex w-full flex-col gap-4 p-4"
		>
			<Errors allErrors={$allErrors} />
			<p class="text-sm text-muted-foreground">
				Mark them <strong>Paid</strong> if they've already paid (cash, bank transfer…), or
				<strong>Unpaid</strong> to get a link they can pay by card.
			</p>

			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InputComp
					{form}
					{errors}
					label="First Name"
					type="text"
					name="firstName"
					required={true}
				/>
				<InputComp {form} {errors} label="Last Name" type="text" name="lastName" required={true} />
			</div>
			<InputComp {form} {errors} label="Email" type="email" name="email" required={true} />
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InputComp
					{form}
					{errors}
					label="Phone"
					type="tel"
					name="phone"
					placeholder="+44 7700 000000"
				/>
				<InputComp {form} {errors} label="Gender" type="select" name="gender" items={genderItems} />
			</div>
			<InputComp {form} {errors} label="Course" type="select" name="courseId" items={courseItems} />
			<InputComp
				{form}
				{errors}
				label="Payment Option"
				type="select"
				name="paymentMethodId"
				items={optionItems}
			/>
			{#if selectedCourse && !optionItems.length}
				<p class="text-xs text-muted-foreground">
					This course has no payment methods. Add some on the course's page.
				</p>
			{/if}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InputComp {form} {errors} label="Amount (£)" type="number" name="amount" min="0" />
				<InputComp {form} {errors} label="Status" type="select" name="status" items={statusItems} />
			</div>
			<p class="text-xs text-muted-foreground">
				The amount is filled in with today's price (including any discount, and women/men-only
				discounts for the gender chosen). Change it if you agreed a different amount. For unpaid
				students, it's what the link charges.
			</p>

			<Button type="submit" class="mt-4" form="register-student">
				{#if $delayed}
					<LoadingBtn name="Registering Student" />
				{:else}
					<UserPlus class="h-4 w-4" /> Register Student
				{/if}
			</Button>
		</form>
	{/if}
</DialogComp>
