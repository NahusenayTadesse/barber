<script>
	let { data } = $props();

	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	import Errors from '$lib/formComponents/Errors.svelte';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Mail, MapPin, Phone, MessageCircle } from '@lucide/svelte';
	import { schema } from './schema.js';
	import {
		amountSuffix,
		applyDiscount,
		bestDiscount,
		genderAudience,
		genderOffers,
		methodAmountFor
	} from '$lib/discounts';
	import Seo from '$lib/components/Seo.svelte';
	import { courseJsonLd } from '$lib/seo';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	// Back from Stripe without paying
	onMount(() => {
		if (page.url.searchParams.has('cancelled')) {
			toast.info('Payment cancelled — no money was taken. You can try again below.');
		}
	});
	const { form, errors, enhance, delayed, message, allErrors } = superForm(data.form, {
		dataType: 'json',

		validators: zod4Client(schema),
		onChange(event) {
			if (event.paths) {
				$form.paymentAmount = amountFor(
					selectedCourse?.methods.find((m) => m.id === $form.paymentMethodId)
				);
			}
		}
	});
	const selectedCourse = $derived(data.coursesList.find((c) => c.id === $form.courseId));
	// The best discount for the chosen gender (only discounts for everyone until one is picked)
	const discount = $derived(bestDiscount(selectedCourse?.discounts ?? [], $form.gender));
	// Women/men-only discounts bigger than the one applied, so students know to pick their gender
	const offers = $derived(
		genderOffers(selectedCourse?.discounts ?? []).filter(
			(d) => d.percentage > (discount?.percentage ?? 0)
		)
	);
	/** @param {import('$lib/discounts').PaymentMethod | undefined} method */
	const amountFor = (method) => methodAmountFor(selectedCourse, method, discount?.percentage);
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') toast.error($message.text);
			else {
				toast.success($message.text);
			}
		}
	});
	let payment = $state();
</script>

{#if selectedCourse}
	{@const everyone = bestDiscount(selectedCourse.discounts)}
	{@const price = applyDiscount(selectedCourse.basePrice, everyone?.percentage)}
	<Seo
		title="Enrol on the {data.course.name}"
		description={[
			`Enrol on the ${data.course.name} at D&D Barber Academy, London.`,
			[selectedCourse.duration, selectedCourse.level].filter(Boolean).join(', ') + '.',
			everyone
				? `Now £${price} with ${everyone.percentage}% off (was £${Number(selectedCourse.basePrice)}).`
				: `£${Number(selectedCourse.basePrice)}.`,
			selectedCourse.methods.length
				? `Payment options: ${selectedCourse.methods.map((m) => m.name).join(', ')}.`
				: ''
		]
			.filter(Boolean)
			.join(' ')}
		jsonLd={courseJsonLd(page.url.origin, selectedCourse, price)}
	/>
{/if}

<!-- <div class="chain mt-10 lg:block! hidden"><div class="chain-line"></div></div> -->

<!-- PAYMENT -->
<div class="psec lg:mt-32!" id="paySection">
	<div class="pinner">
		<div class="fi">
			<h2 class="ptitle">Register for <span class="g">{data.course.name}</span></h2>
			<p class="psub">
				Your career shouldn't wait because of cash flow. Choose a payment plan that works for you —
				no credit checks, no interest, no hassle.
			</p>
		</div>
		{#if discount}
			<div class="urgency" style="margin-top:20px">
				<strong>{discount.name}: {discount.percentage}% off this course</strong>
				{discount.gender ? `for ${genderAudience[discount.gender]}` : ''} — applied to every payment option
				below.
			</div>
		{/if}
		{#each offers as offer (offer.id)}
			<div class="urgency" style="margin-top:20px">
				<strong
					>{offer.name}: {offer.percentage}% off this course for {offer.gender &&
						genderAudience[offer.gender]}</strong
				>
				— choose your gender in the form below to get it.
			</div>
		{/each}
		<div class="selbanner" id="selbanner">
			Course selected: <strong id="selname"></strong> — Choose your payment method below
		</div>
		<div class="cob fi" style="transition-delay:.2s">
			<div
				style="font-family:var(--fb);font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:22px"
			>
				Complete Your Enrolment
			</div>

			<Errors allErrors={$allErrors} />
			<form use:enhance method="post" id="enroll" action="?/enroll" class="crow">
				<input type="hidden" required name="courseId" bind:value={$form.courseId} />
				<input type="hidden" name="paymentMethodId" bind:value={$form.paymentMethodId} />

				<div class="fg">
					<label for="firstName">First Name</label><input
						name="firstName"
						required
						bind:value={$form.firstName}
						type="text"
						id="firstName"
						placeholder="John"
					/>
				</div>
				<div class="fg">
					<label for="lastName">Last Name</label><input
						name="lastName"
						type="text"
						bind:value={$form.lastName}
						id="lastName"
						placeholder="Smith"
					/>
				</div>
			</form>
			<div class="crow">
				<div class="fg">
					<label for="email">Email</label><input
						type="email"
						id="email"
						bind:value={$form.email}
						placeholder="john@email.com"
					/>
				</div>
				<div class="fg">
					<label for="phone">Phone</label><input
						bind:value={$form.phone}
						type="tel"
						name="phone"
						id="phone"
						placeholder="+44 7700 000000"
					/>
				</div>
			</div>
			<div class="fg">
				<label for="gender">Gender (optional)</label>
				<select id="gender" name="gender" bind:value={$form.gender}>
					<option value="">Prefer not to say</option>
					<option value="male">Male</option>
					<option value="female">Female</option>
				</select>
				{#if selectedCourse?.discounts.some((d) => d.gender)}
					<p class="gender-note">
						Women/men-only discounts are given on the gender you choose. If it's found to be false,
						the discount is removed and the remaining balance becomes due.
					</p>
				{/if}
			</div>
			<div class="fg">
				<label id="ee" for="paymentOptions">Payment Options</label>
			</div>
			<div class="popts fi" style="transition-delay:.1s">
				{#each selectedCourse?.methods ?? [] as method (method.id)}
					<button
						onclick={() => {
							$form.paymentMethodId = method.id;
						}}
						class="popt {$form.paymentMethodId === method.id ? 'sel' : ''}"
					>
						<div class="poname">{method.name}</div>
						<div class="poamt">
							£{amountFor(method)}{amountSuffix(method)}
						</div>
						{#if method.lines.length}
							<div class="ponote">
								{#each method.lines as line, i (i)}
									{#if i > 0}<br />{/if}{line}
								{/each}
							</div>
						{/if}
					</button>
				{:else}
					<p class="ponote">
						Online payment isn't available for this course yet. Please call us on 020 3700 3997.
					</p>
				{/each}
			</div>
			<div class="csum">
				<div>
					<div class="clbl">Selected Course</div>
					<div
						style="font-family:var(--fb);font-size:15px;font-weight:700;letter-spacing:1px"
						id="summC"
					>
						{data.coursesList.find((c) => c.id === $form.courseId)?.name ??
							'— Select a course above —'}
					</div>
				</div>
				<div style="text-align:right">
					<div class="clbl">Amount Due Today</div>
					<div class="cval" id="summA">
						£ {$form.paymentAmount}
						<input hidden name="paymentAmount" bind:value={$form.paymentAmount} />
					</div>
				</div>
			</div>
			<!-- <button class="btn-gold" style="width:100%;padding:18px;font-size:14px;letter-spacing:2.5px"
				>Confirm My Enrolment →</button
			> -->
			<button
				form="enroll"
				class="btn-gold"
				type="submit"
				style="width:100%;padding:18px;font-size:14px"
			>
				{#if $delayed}
					<LoadingBtn name="Confirming Enrolment..." />
				{:else}
					Confirm Enrollment →
				{/if}</button
			>
			<div
				style="font-size:11px;color:var(--grey);text-align:center;margin-top:14px;line-height:1.7"
			>
				Secure checkout · You'll receive a confirmation within 24 hours<br />Questions? Call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>
				or
				<a
					href="https://wa.me/447846119677"
					target="_blank"
					style="color:var(--gold);text-decoration:underline">WhatsApp us</a
				><br />Deposits are non-refundable once your place is confirmed. Full terms available below.
			</div>
		</div>
	</div>
</div>

<style>
	.gender-note {
		margin-top: 4px;
		font-size: 10px;
		line-height: 1.4;
		color: var(--grey);
	}
</style>
