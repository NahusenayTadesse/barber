<script>
	let { data } = $props();

	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	import Errors from '$lib/formComponents/Errors.svelte';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { Mail, MapPin, Phone, MessageCircle } from '@lucide/svelte';
	import { schema } from './schema.js';
	import { amountSuffix, applyDiscount, bestDiscount, methodAmountFor } from '$lib/discounts';
	import { audienceLabels } from '$lib/courses';
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
	const discount = $derived(bestDiscount(selectedCourse?.discounts ?? []));
	// The course's description, one point per line
	const points = $derived(
		(selectedCourse?.description ?? '')
			.split(/\n+/)
			.map((p) => p.trim())
			.filter(Boolean)
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

	// Shown until a featured image is uploaded for the course
	const fallbackImage = {
		men: '/images/barber-cutting.webp',
		women: '/images/textured-hair-mannequin.webp'
	};
</script>

{#if selectedCourse}
	{@const price = applyDiscount(selectedCourse.basePrice, discount?.percentage)}
	<Seo
		title="Enrol on the {data.course.name}"
		description={[
			`Enrol on the ${data.course.name}, a ${audienceLabels[selectedCourse.audience].toLowerCase()} hair course at D&D Barber Academy, London.`,
			[selectedCourse.duration, selectedCourse.level].filter(Boolean).join(', ') + '.',
			discount
				? `Now £${price} with ${discount.percentage}% off (was £${Number(selectedCourse.basePrice)}).`
				: `£${Number(selectedCourse.basePrice)}.`,
			selectedCourse.methods.length
				? `Payment options: ${selectedCourse.methods.map((m) => m.name).join(', ')}.`
				: ''
		]
			.filter(Boolean)
			.join(' ')}
		image={selectedCourse.featuredImage
			? `/files/${selectedCourse.featuredImage}?w=1200&q=75`
			: undefined}
		imageAlt={selectedCourse.featuredImage ? selectedCourse.name : undefined}
		jsonLd={courseJsonLd(page.url.origin, selectedCourse, price)}
	/>
{/if}

<!-- <div class="chain mt-10 lg:block! hidden"><div class="chain-line"></div></div> -->

<!-- DETAILS -->
{#if selectedCourse}
	<section class="cdetail lg:mt-32!">
		<div class="cgrid">
			<figure class="cmedia">
				<img
					src={selectedCourse.featuredImage
						? `/files/${selectedCourse.featuredImage}?w=1280&q=72`
						: fallbackImage[selectedCourse.audience]}
					alt={selectedCourse.name}
					fetchpriority="high"
				/>
				<figcaption>
					<span>{audienceLabels[selectedCourse.audience]} hair</span>
					{#if selectedCourse.duration}<span>{selectedCourse.duration}</span>{/if}
				</figcaption>
			</figure>

			<div class="cinfo">
				<a class="cback" href="/courses#{selectedCourse.audience}"
					>← All {audienceLabels[selectedCourse.audience].toLowerCase()} hair courses</a
				>
				<div class="ey"><span>{audienceLabels[selectedCourse.audience]} hair course</span></div>
				<h1 class="ptitle">{selectedCourse.name}</h1>

				<dl class="cfacts">
					{#each [['Level', selectedCourse.level], ['Duration', selectedCourse.duration], ['Who it’s for', selectedCourse.target], ['Experience needed', selectedCourse.experience]].filter(([, v]) => v) as [label, value] (label)}
						<div>
							<dt>{label}</dt>
							<dd>{value}</dd>
						</div>
					{/each}
				</dl>

				<div class="crs-prow">
					{#if discount}
						<div class="crsprice">
							£{applyDiscount(selectedCourse.basePrice, discount.percentage)}
						</div>
						<div class="crspnote"><s>£{selectedCourse.basePrice}</s> full course</div>
					{:else}
						<div class="crsprice">£{selectedCourse.basePrice}</div>
						<div class="crspnote">full course</div>
					{/if}
				</div>
				{#if selectedCourse.minPrice && Number(selectedCourse.minPrice) > 0}
					<div class="urgency" style="margin-top:20px">
						<strong
							>Enrol from £{Math.floor(
								applyDiscount(selectedCourse.minPrice, discount?.percentage)
							)} deposit</strong
						>
						{#if selectedCourse.minPriceMessage}— {selectedCourse.minPriceMessage}{/if}
					</div>
				{/if}

				{#if points.length}
					<div class="incl" style="margin-top:32px">What You'll Learn & Get</div>
					<ul class="buls">
						{#each points as point, i (i)}
							<li class="capitalize">{point}</li>
						{/each}
					</ul>
				{/if}
				<a class="btn-gold" href="#paySection">Reserve My Place</a>
			</div>
		</div>
	</section>
{/if}

<!-- PAYMENT -->
<div class="psec" id="paySection">
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
				<strong>{discount.name}: {discount.percentage}% off this course</strong> — applied to every payment
				option below.
			</div>
		{/if}
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
	.cdetail {
		padding: 40px 48px 56px;
	}
	/* Details on the left, featured image on the right (stacked on top on mobile) */
	.cgrid {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: clamp(28px, 4vw, 56px);
		align-items: start;
		max-width: 1200px;
		margin: 0 auto;
	}
	.cinfo {
		grid-column: 1;
		grid-row: 1;
		min-width: 0;
	}
	.cmedia {
		grid-column: 2;
		grid-row: 1;
		position: sticky;
		top: 120px;
		margin: 0;
		aspect-ratio: 4 / 5;
		overflow: hidden;
		background: var(--dark2);
		border: 1px solid rgba(212, 175, 55, 0.22);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
	}
	.cmedia::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(5, 5, 5, 0.75) 0%, transparent 40%);
		pointer-events: none;
	}
	.cmedia img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 20%;
	}
	.cmedia figcaption {
		position: absolute;
		left: 18px;
		right: 18px;
		bottom: 16px;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.cmedia figcaption span {
		padding: 6px 12px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: var(--gold);
		background: rgba(5, 5, 5, 0.7);
		border: 1px solid rgba(212, 175, 55, 0.35);
	}
	@media (max-width: 900px) {
		.cgrid {
			grid-template-columns: 1fr;
		}
		.cmedia {
			grid-column: 1;
			position: relative;
			top: 0;
			aspect-ratio: 16 / 11;
		}
		.cinfo {
			grid-row: 2;
		}
	}
	.cback {
		display: inline-block;
		margin-bottom: 24px;
		font-size: 13px;
		color: var(--grey);
	}
	.cback:hover {
		color: var(--gold);
	}
	.cfacts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 1px;
		margin-top: 24px;
		background: rgba(212, 175, 55, 0.12);
		border: 1px solid rgba(212, 175, 55, 0.12);
	}
	.cfacts div {
		background: var(--dark2);
		padding: 16px 18px;
	}
	.cfacts dt {
		font-size: 10px;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 600;
		margin-bottom: 6px;
	}
	.cfacts dd {
		font-size: 14px;
		line-height: 1.5;
	}
	@media (max-width: 640px) {
		.cdetail {
			padding: 32px 20px 44px;
		}
	}
</style>
