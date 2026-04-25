<script lang="ts">
	let { data } = $props();

	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	import Errors from '$lib/formComponents/Errors.svelte';
	import * as Carousel from '$lib/components/ui/carousel/index.js';

	import Gallery2 from './gallery.svelte';
	import Gallery from '$lib/components/gallery.svelte';
	import { Mail, MapPin, Phone } from '@lucide/svelte';
	// import Gallery from '$lib/components/gallery.svelte';
	const { form, errors, enhance, delayed, message, allErrors } = superForm(data.form, {
		dataType: 'json'
	});
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') toast.error($message.text);
			else {
				toast.success($message.text);
			}
		}
	});

	/**
	 * Finds the ID of a course that represents the most popular price point.
	 * @param {Array} courses - The array of course objects.
	 * @returns {number|string|null} - The ID of a course with the most popular price.
	 */

	function getMostPopularCourseId(courses) {
		if (!courses || courses.length === 0) return null;

		const priceCounts = {};
		const priceToFirstIdMap = {};

		courses.forEach((course) => {
			const price = course.basePrice.toString();

			// 1. Count frequency
			priceCounts[price] = (priceCounts[price] || 0) + 1;

			// 2. Map the price to the first ID we see for it
			// (if it doesn't already have one)
			if (!priceToFirstIdMap[price]) {
				priceToFirstIdMap[price] = course.id;
			}
		});

		// 3. Find the price with the highest frequency
		let maxCount = 0;
		let winningPrice = null;

		for (const price in priceCounts) {
			if (priceCounts[price] > maxCount) {
				maxCount = priceCounts[price];
				winningPrice = price;
			}
		}

		// 4. Return the ID associated with that winning price
		return priceToFirstIdMap[winningPrice];
	}

	const mostPopularCourseId = $derived(getMostPopularCourseId(data.coursesList));
</script>

<svelte:head>
	<title>Courses & Enrollment</title>
</svelte:head>

<!-- <div
	class="bg-start relative z-0 bg-cover py-0 lg:py-12"
	style="background-image: url('/images (18).webp');"
>
	<div class="absolute inset-0 -z-1 bg-black/20"></div>
	<div class="phero-inner fi">
		<div class="ey"><span>Courses & Enrolment</span></div>
		<h1 class="sec-title" style="font-size:clamp(58px,9vw,116px)">
			CHOOSE<br />YOUR <span class="g">START.</span>
		</h1>
		<p class="sec-sub">Pick your course. Secure your place. Start cutting.</p>
	</div>
</div> -->

<div
	class="bg-start relative z-0 flex w-full flex-col items-center justify-center justify-self-center bg-cover py-0 lg:py-24"
	style="background-image: url('/images (18).webp');"
>
	<div class="absolute inset-0 -z-1 bg-black/30"></div>
	<div
		class="grid w-full grid-cols-1 items-center justify-between gap-4 p-3 lg:w-9/10 lg:grid-cols-3"
	>
		<div class="lg:col-span-2">
			<div class="ey"><span>London's Barber Academy</span></div>
			<h1 class="hero-h1">
				<div>LEARN TO CUT.</div>
				<div class="g">GET PAID.</div>
			</h1>

			<p class="hero-sub">
				No experience needed. <strong>Real clients from week one.</strong><br />
				Walk out ready to earn in <strong>12 weeks</strong>.
			</p>

			<!-- <div class="hero-btns">
		<button class="btn-gold" onclick="go('courses')">View Courses</button>
		<button class="btn-out" onclick="go('freehaircut')">Get a Free Haircut</button>
	</div> -->

			<div class="hero-quick">
				<a href="tel:0202779988">Call: 0202 779 988</a>
				<a href="https://wa.me/442027799988" target="_blank">WhatsApp now</a>
				<a href="/contact">Ask a question</a>
			</div>
		</div>
		<!-- <div class="trust-row">
			<span class="trust-pill">No experience required</span>
			<span class="trust-pill">Enrol from £299 deposit</span>
			<span class="trust-pill">London-based, real shop</span>
			<span class="trust-pill">Certificate on completion</span>
		</div> -->

		<!-- HERO CARD -->
		<div class="hcard fi h-auto!" style="transition-delay:.2s">
			<div class="hcard-label">Start Fast</div>
			<ul class="hcard-list">
				<li>Next intake: limited spots</li>
			</ul>
			<div class="hcard-cta">
				<a href="#courses">Reserve My Place →</a>
			</div>
			<div class="hcard-note">Questions first? Message us on WhatsApp.</div>
		</div>
	</div>
</div>
<div class="ticker-wrap">
	<div class="ticker-inner">
		<span>No Experience Needed</span><span>Real Clients Week One</span><span
			>Certificate on Completion</span
		><span>Enrol from £299</span><span>London Based</span><span>Flexible Payment</span>
		<span>No Experience Needed</span><span>Real Clients Week One</span><span
			>Certificate on Completion</span
		><span>Enrol from £299</span><span>London Based</span><span>Flexible Payment</span>
	</div>
</div>
<!-- <div class="my-0 w-full justify-self-center lg:my-24 lg:w-9/10">
	<Gallery2 />
</div> -->

<Gallery2 />

<div class="section">
	<div
		class="fi"
		style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:20px"
	>
		<div>
			<div class="ey"><span>Our Courses</span></div>
			<h2 class="sec-title">WHERE DO<br />YOU <span class="g">START?</span></h2>
		</div>
	</div>
</div>
<!--
<Carousel.Root class="my-16 block w-full max-w-xs justify-self-center lg:hidden">
	<Carousel.Content>
		{#each data.coursesList as course (course.id)}
			<Carousel.Item>
				<div class="crscard fi">
					<div class="crsstripe"></div>
					<div class="crstop">
						<div class="crslv">{course.level} — {course.target}</div>
						<div class="crsnm">{course.name}</div>
						<div class="crsdur">{course.duration} · {course.experience}</div>
						<div class="crs-prow">
							<div class="crsprice">£{course.basePrice}</div>
							<div class="crspnote">full course</div>
						</div>
					</div>
					<div class="crsbody">
						<div class="urgency">
							<strong>Enrol from £{course.minPrice} deposit</strong> — {course.minPriceMessage}
						</div>
						<div class="incl">What You'll Learn & Get</div>
						<ul class="buls">
							{#each course?.description?.split(/\n+/).filter(Boolean) as point}
								<li class="capitalize">{point.trim()}</li>
							{/each}
						</ul>
						<a
							class="btn-gold"
							href="/courses/{course.id}"
							onclick={() => ($form.courseId = course.id)}
							>Reserve My Place — {course.name?.split(' ').at(-1)} →</a
						>
					</div>
				</div>
			</Carousel.Item>
		{/each}
	</Carousel.Content>
	<Carousel.Previous />
	<Carousel.Next />
</Carousel.Root> -->

<div id="courses">
	<div class="crsgrid">
		{#each data.coursesList as course (course.id)}
			<div class="crscard fi">
				<div class="crsstripe"></div>
				<div class="crstop">
					{#if course.id === Number(mostPopularCourseId)}
						<div
							class="my-4 inline-flex items-center rounded-full border border-transparent bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/80"
						>
							Most Popular
						</div>
					{/if}
					<div class="crslv">{course.level} — {course.target}</div>
					<div class="crsnm">{course.name}</div>
					<div class="crsdur">{course.duration} · {course.experience}</div>
					<div class="crs-prow">
						<div class="crsprice">£{course.basePrice}</div>
						<div class="crspnote">full course</div>
					</div>
				</div>
				<div class="crsbody">
					<div class="urgency">
						<strong>Enrol from £{course.minPrice} deposit</strong> — {course.minPriceMessage}
					</div>
					<div class="incl">What You'll Learn & Get</div>
					<ul class="buls">
						{#each course?.description?.split(/\n+/).filter(Boolean) as point}
							<li class="capitalize">{point.trim()}</li>
						{/each}
					</ul>
					<a
						class="btn-gold justify-center"
						href="/courses/{course.id}"
						onclick={() => ($form.courseId = course.id)}
						style="width:100%;padding:16px;font-size:14px"
						>Reserve My Place — {course.name?.split(' ').at(-1)} →</a
					>
				</div>
			</div>
		{/each}
	</div>
</div>

<div class="mt-10 flex w-full flex-col items-center justify-center justify-self-center lg:w-9/10">
	<Gallery title="Gallery" images={data.imagesList} bento />
</div>
<div class="chain mt-10"><div class="chain-line"></div></div>

<div class="cta-banner">
	<div class="cta-banner-bg"></div>
	<div class="cta-banner-inner fi">
		<div class="cta-banner-kicker">Start This Month</div>
		<h2 class="cta-banner-title">
			READY TO<br /><span class="g">START?</span>
		</h2>
		<p class="cta-banner-sub">Pick your course. Secure your spot. Get moving.</p>
		<div class="cta-banner-btns">
			<a class="btn-gold" href="#courses" style="padding:18px 48px;font-size:14px"
				>Reserve My Place</a
			>
			<a href="https://wa.me/442027799988" target="_blank" class="btn-out" style="padding:18px 36px"
				>Ask on WhatsApp</a
			>
		</div>
		<div class="cta-banner-trust">From £299 deposit · Limited spots · London-based</div>
	</div>
</div>

<!-- PAYMENT -->
<!-- <div class="psec" id="paySection">
	<div class="pinner">
		<div class="fi">
			<div class="ey"><span>Payment Options</span></div>
			<h2 class="ptitle">FLEX<br /><span class="g">YOUR WAY.</span></h2>
			<p class="psub">
				Your career shouldn't wait because of cash flow. Choose a payment plan that works for you —
				no credit checks, no interest, no hassle.
			</p>
		</div>
		<div class="selbanner" id="selbanner">
			Course selected: <strong id="selname"></strong> — Choose your payment method below
		</div>
		<div class="popts fi" style="transition-delay:.1s">
			<button
				onclick={() => {
					$form.paymentOption = 'minPrice';
				}}
				class="popt {$form.paymentOption === 'minPrice' ? 'sel' : ''}"
			>
				<div class="poname">Deposit to Secure</div>
				<div class="poamt" id="depAmt">
					£{data.coursesList.find((c) => c.id === $form.courseId)?.minPrice}
				</div>
				<div class="ponote">
					Lock in your place today<br />Balance due before start day<br />Quickest way to enrol
				</div>
			</button>
			<button
				onclick={() => {
					$form.paymentOption = 'threeEqual';
				}}
				class="popt {$form.paymentOption === 'threeEqual' ? 'sel' : ''}"
			>
				<div class="poname">3 Equal Instalments</div>
				<div class="poamt" id="instAmt">
					£{Math.floor(
						Number(data.coursesList.find((c) => c.id === $form.courseId)?.basePrice) / 3
					)}/mo
				</div>
				<div class="ponote">
					Spread the cost over 3 months<br />0% interest · Equal payments<br />No credit check
					required
				</div>
			</button>
			<button
				onclick={() => {
					$form.paymentOption = 'fullPrice';
				}}
				class="popt {$form.paymentOption === 'fullPrice' ? 'sel' : ''}"
			>
				<div class="poname">Pay in Full</div>
				<div class="poamt" id="fullAmt">
					£{data.coursesList.find((c) => c.id === $form.courseId)?.basePrice}
				</div>
				<div class="ponote">
					Best value · Save 5%<br />One payment, nothing to track<br />Immediate confirmation
				</div>
			</button>
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
				<input type="text" hidden name="paymentOption" bind:value={$form.paymentOption} />

				<div class="fg">
					<label for="firstName">First Name</label><input
						name="firstName"
						required
						bind:value={$form.firstName}
						type="text"
						id="ef"
						placeholder="John"
					/>
				</div>
				<div class="fg">
					<label for="lastName">Last Name</label><input
						name="lastName"
						type="text"
						bind:value={$form.lastName}
						id="ef"
						placeholder="Smith"
					/>
				</div>
			</form>
			<div class="crow">
				<div class="fg">
					<label for="email">Email</label><input
						type="email"
						id="ee"
						bind:value={$form.email}
						placeholder="john@email.com"
					/>
				</div>
				<div class="fg">
					<label for="phone">Phone</label><input
						bind:value={$form.phone}
						type="tel"
						name="phone"
						id="ep"
						placeholder="+44 7700 000000"
					/>
				</div>
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
						£{$form.paymentOption === 'minPrice'
							? Math.floor(data.coursesList.find((c) => c.id === $form.courseId)?.minPrice)
							: $form.paymentOption === 'threeEqual'
								? Math.floor(
										Number(data.coursesList.find((c) => c.id === $form.courseId)?.basePrice) / 3
									)
								: $form.paymentOption === 'fullPrice'
									? Math.floor(data.coursesList.find((c) => c.id === $form.courseId)?.basePrice)
									: '-'}
					</div>
				</div>
			</div>
			<!-- <button class="btn-gold" style="width:100%;padding:18px;font-size:14px;letter-spacing:2.5px"
				>Confirm My Enrolment →</button
			> -->
<!-- <button
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
				<a href="tel:0202779988" style="color:var(--gold);text-decoration:none">0202 779 988</a>
				or
				<a
					href="https://wa.me/442027799988"
					target="_blank"
					style="color:var(--gold);text-decoration:none">WhatsApp us</a
				><br />Deposits are non-refundable once your place is confirmed. Full terms available below.
			</div>
		</div>
	</div> -->
<!-- </div> -->
