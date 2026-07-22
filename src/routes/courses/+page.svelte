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

<!-- HERO -->
<div
	class="bg-start relative z-0 flex w-full flex-col items-center justify-center justify-self-center bg-cover py-12 lg:py-24"
	style="background-image: url('/images (18).webp');"
>
	<div class="absolute inset-0 -z-1 bg-black/40 lg:bg-black/30"></div>
	<div
		class="grid w-full grid-cols-1 items-center justify-between gap-8 px-5 py-2 lg:w-9/10 lg:grid-cols-3 lg:gap-4 lg:p-3"
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

			<div class="hero-quick">
				<a href="tel:0202779988">Call: 0202 779 988</a>
				<a href="https://wa.me/442027799988" target="_blank">WhatsApp now</a>
				<a href="/contact">Ask a question</a>
			</div>
		</div>

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
						class="btn-gold justify-center! items-center! flex! flex-row!"
						href="/courses/{course.id}"
						onclick={() => ($form.courseId = course.id)}
						style="width:100%;padding:16px;font-size:14px"
						>Reserve My Place</a
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
			<a class="btn-gold" href="#courses">Reserve My Place</a>
			<a href="https://wa.me/442027799988" target="_blank" class="btn-out">Ask on WhatsApp</a>
		</div>
		<div class="cta-banner-trust">From £299 deposit · Limited spots · London-based</div>
	</div>
</div>

<style>
	/* =========================================================
	   MOBILE POLISH ‑ applies at ≤640px only.
	   Scoped to this component, so your global desktop styles
	   are left completely untouched. Tune the values to taste.
	   ========================================================= */

	/* Anchor jump for the #courses button clears any fixed header */
	:global(#courses) {
		scroll-margin-top: 80px;
	}

	@media (max-width: 640px) {
		/* ---- Hero ---- */
		.hero-h1 {
			font-size: clamp(46px, 15vw, 68px);
			line-height: 0.9;
			letter-spacing: -0.02em;
		}
		.hero-sub {
			font-size: 15px;
			line-height: 1.6;
			margin-top: 14px;
		}
		.ey {
			margin-bottom: 10px;
		}

		/* Quick links become full-width, thumb-friendly tap targets */
		.hero-quick {
			display: grid;
			grid-template-columns: 1fr;
			gap: 10px;
			margin-top: 20px;
		}
		.hero-quick a {
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 52px;
			padding: 14px 18px;
			border-radius: 12px;
			text-align: center;
			font-weight: 600;
		}

		/* Hero card sits tighter under the copy */
		.hcard {
			padding: 22px;
			border-radius: 18px;
		}
		.hcard-cta a {
			display: flex;
			min-height: 52px;
			align-items: center;
			justify-content: center;
		}

		/* ---- Ticker ---- */
		.ticker-wrap {
			padding: 9px 0;
		}
		.ticker-inner span {
			font-size: 12px;
			letter-spacing: 2px;
		}

		/* ---- Section heading ---- */
		.section {
			padding: 44px 20px;
		}
		.sec-title {
			font-size: clamp(42px, 13vw, 64px);
			line-height: 0.9;
			letter-spacing: -0.02em;
		}

		/* ---- Course cards ---- */
		.crsgrid {
			display: grid;
			grid-template-columns: 1fr;
			gap: 18px;
			padding: 0 20px;
		}
		.crscard {
			border-radius: 18px;
			overflow: hidden;
		}
		.crstop,
		.crsbody {
			padding: 24px;
		}
		.crsnm {
			font-size: 24px;
			line-height: 1.1;
		}
		.crsprice {
			font-size: 36px;
		}
		.buls li {
			font-size: 14px;
			line-height: 1.55;
		}

		/* ---- Buttons: keep the label on a single line ---- */
		/* font-size uses !important to beat the inline style on the card CTA */
		.btn-gold,
		.btn-out {
			font-size: 16px !important;
			letter-spacing: 0.5px;
		}

		/* ---- CTA banner ---- */
		.cta-banner-inner {
			padding: 52px 22px;
		}
		.cta-banner-title {
			font-size: clamp(48px, 15vw, 72px);
			line-height: 0.9;
			letter-spacing: -0.02em;
		}
		.cta-banner-sub {
			font-size: 15px;
		}
		/* Stack the CTA buttons full-width instead of side-by-side */
		.cta-banner-btns {
			display: grid;
			grid-template-columns: 1fr;
			gap: 12px;
			width: 100%;
		}
		.cta-banner-btns .btn-gold,
		.cta-banner-btns .btn-out {
			width: 100%;
			min-height: 54px;
			padding: 16px 24px;
			display: flex;
			align-items: center;
			justify-content: center;
			text-align: center;
		}
	}
</style>