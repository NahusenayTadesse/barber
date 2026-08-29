<script lang="ts">
	let { data } = $props();

	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';

	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { tick } from 'svelte';
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

	// --- Hero background slider (uses the uploaded gallery images) ---
	const heroImages = $derived(
		data.imagesList?.length
			? data.imagesList
					.filter((img): img is string => !!img)
					.map((img) => (img.startsWith('http') || img.startsWith('/') ? img : `/files/${img}`))
					.map((img) => (img.startsWith('/files/') ? `${img}?w=1280&q=68` : img))
			: ['/images (18).webp']
	);
	let heroIndex = $state(0);
	$effect(() => {
		if (heroImages.length < 2) return;
		const t = setInterval(() => {
			heroIndex = (heroIndex + 1) % heroImages.length;
		}, 5000);
		return () => clearInterval(t);
	});

	const minDeposit = $derived(
		data.coursesList.length
			? Math.min(...data.coursesList.map((c) => Number(c.minPrice ?? c.basePrice)))
			: 0
	);

	const sortedByPrice = $derived(
		[...data.coursesList].sort((a, b) => Number(a.basePrice) - Number(b.basePrice))
	);

	// --- "Which course is yours?" quiz ---
	let quizStep = $state(1);
	let quizScore = $state(0);
	let quizAnswered = $state(0);

	function answerQuiz(points: number) {
		quizScore += points;
		quizAnswered++;
		quizStep = quizAnswered < 3 ? quizAnswered + 1 : 4;
	}

	function restartQuiz() {
		quizScore = 0;
		quizAnswered = 0;
		quizStep = 1;
	}

	function scrollToQuiz(e: MouseEvent) {
		e.preventDefault();
		document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	// Smoothly animates the quiz box's height across steps instead of snapping.
	let quizPanelEl = $state<HTMLDivElement>();
	let quizViewportHeight = $state<number>();
	$effect(() => {
		quizStep;
		tick().then(() => {
			if (quizPanelEl) quizViewportHeight = quizPanelEl.offsetHeight;
		});
	});

	const recommendedCourse = $derived.by(() => {
		if (!sortedByPrice.length) return null;
		const idx = Math.min(
			sortedByPrice.length - 1,
			Math.round((quizScore / 6) * (sortedByPrice.length - 1))
		);
		return sortedByPrice[idx];
	});

	const faqs = [
		{
			q: "I've never held a clipper. Am I too far behind?",
			a: 'No. Almost nobody arrives knowing how to use one properly, and every course is built to start from zero.'
		},
		{ q: 'Am I too old to start?', a: "There's no cut-off age. People train here straight out of school and twenty years into a career they've had enough of." },
		{
			q: 'Do I really cut real clients, and how many?',
			a: 'Real clients from week one, with an educator beside you. Ask us for the number on your course and we’ll give you the honest figure, not a range.'
		},
		{
			q: 'What can I actually do the day after I finish?',
			a: 'Cut, fade, line up and finish a full head on your own, at the pace a working shop needs. That last part is what gets you hired.'
		},
		{
			q: 'What happens if I fall behind?',
			a: "Tell us early and we'll work it out with you. Nobody gets pushed through a stage they haven't got yet, and nobody gets quietly written off."
		},
		{
			q: 'What if I can’t pay it all upfront?',
			a: 'Nobody does. A deposit starts you, and the rest is spread in equal instalments while you train — 0% interest, no credit check.'
		},
		{
			q: 'Will I actually get work afterwards?',
			a: 'The last weeks are built around speed, because that’s what shops hire for. Ask us where recent students ended up and we’ll name specifics, not averages.'
		}
	];
</script>

<svelte:head>
	<title>Courses & Enrollment</title>
	<meta
		name="description"
		content="Learn barbering at D&D Barber Academy in London. No experience needed, real clients from week one, and job-ready in 12 weeks."
	/>
	<link rel="preload" as="image" fetchpriority="high" href={heroImages[0]} />
</svelte:head>

<!-- HERO -->
<header class="hero">
	<div class="hero-bg-slider">
		{#each heroImages as img, i (img)}
			{#if i === heroIndex}
				<div
					class="hero-bg-slide"
					style="background-image:url('{img}')"
					in:fade={{ duration: 1200 }}
					out:fade={{ duration: 1200 }}
				></div>
			{/if}
		{/each}
	</div>
	<div class="hero-grad"></div>
	<div class="hero-wrap">
		<div class="hero-in">
			<div class="ey"><span>London's Barber Academy</span></div>
			<h1 class="hero-h1">
				<div>LEARN TO CUT.</div>
				<div class="g">GET PAID.</div>
			</h1>
			<p class="hero-sub">
				No experience needed. <strong>Real clients from week one.</strong><br />
				Walk out ready to earn in <strong>12 weeks</strong>.
			</p>
			<div class="hero-cta">
				<a class="btn-gold" href="#courses">See Courses &amp; Prices</a>
				<a class="btn-out" href="#quiz" onclick={scrollToQuiz}>Not Sure? Take The Quiz</a>
			</div>
			<p class="hero-reply">
				<span class="dot"></span> Message us on WhatsApp — we reply within about 2 hours, Mon–Sat
			</p>
		</div>
	</div>
</header>

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

<section class="proof-strip">
	<div class="proof-inner">
		<div class="proof-item"><div class="proof-num">12</div><div class="proof-label">Weeks to job-ready</div></div>
		<div class="proof-item"><div class="proof-num">Wk 1</div><div class="proof-label">Your first real client</div></div>
		<div class="proof-item"><div class="proof-num">£{minDeposit}</div><div class="proof-label">Deposit to start</div></div>
		<div class="proof-item"><div class="proof-num">0%</div><div class="proof-label">Interest, no credit check</div></div>
	</div>
</section>

<section class="qsec" id="quiz">
	<div class="pinner">
		<div class="ey"><span>Start here</span></div>
		<h2 class="sec-title">WHICH COURSE<br />IS <span class="g">YOURS?</span></h2>
		<p class="sec-sub" style="margin-bottom:36px">
		Answer these 3 questions.
		We'll point you at the one that actually fits you.
		</p>

		<div class="quiz">
			<div class="q-progress">
				<div class="q-progress-bar" style="width:{Math.min(quizStep - 1, 3) * (100 / 3)}%"></div>
			</div>
			<div class="q-viewport" style={quizViewportHeight ? `height:${quizViewportHeight}px` : ''}>
				{#key quizStep}
					<div
						class="q-panel"
						bind:this={quizPanelEl}
						in:fly={{ y: 18, duration: 420, delay: 160, easing: quintOut }}
						out:fly={{ y: -18, duration: 160, easing: quintOut }}
					>
						{#if quizStep === 1}
							<p class="q-count">Question 1 of 3</p>
							<h3 class="q-title">Have you cut hair before?</h3>
							<div class="q-opts">
								<button class="q-opt" onclick={() => answerQuiz(0)}>Never touched a clipper</button>
								<button class="q-opt" onclick={() => answerQuiz(1)}>Just mates and family at home</button
								>
								<button class="q-opt" onclick={() => answerQuiz(2)}>I already work in a shop</button>
							</div>
						{:else if quizStep === 2}
							<p class="q-count">Question 2 of 3</p>
							<h3 class="q-title">What do you want at the end of it?</h3>
							<div class="q-opts">
								<button class="q-opt" onclick={() => answerQuiz(0)}
									>A job behind a chair, as fast as possible</button
								>
								<button class="q-opt" onclick={() => answerQuiz(1)}
									>To go further — fades, beards, colour, braiding</button
								>
								<button class="q-opt" onclick={() => answerQuiz(2)}
									>To run my own shop, or work abroad</button
								>
							</div>
						{:else if quizStep === 3}
							<p class="q-count">Question 3 of 3</p>
							<h3 class="q-title">How much time can you give it?</h3>
							<div class="q-opts">
								<button class="q-opt" onclick={() => answerQuiz(0)}>A month, all in</button>
								<button class="q-opt" onclick={() => answerQuiz(1)}>A couple of months</button>
								<button class="q-opt" onclick={() => answerQuiz(2)}>Three months, properly</button>
							</div>
						{:else if recommendedCourse}
							<p class="q-count">Your starting point</p>
							<h3 class="q-result-name">{recommendedCourse.name}</h3>
							<p class="q-result-why">
								<strong>Best for:</strong>
								{recommendedCourse.target}. {recommendedCourse.experience}
							</p>
							<div class="q-actions">
								<a class="btn-gold" href="/courses/{recommendedCourse.id}">See this course</a>
								<a class="btn-out" href="#courses">Compare all courses</a>
								<button class="q-restart" type="button" onclick={restartQuiz}>Start again</button>
							</div>
						{/if}
					</div>
				{/key}
			</div>
		</div>
	</div>
</section>

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
	<p class="courses-disclaimer">
		A 50% non-refundable deposit secures your place, and the remaining 50% is paid in equal
		instalments every two weeks. Full payment is required before certification.
	</p>
</div>

<div id="courses">
	<div class="crsgrid">
		{#each data.coursesList as course (course.id)}
			<div class="crscard fi" class:pop={course.id === Number(mostPopularCourseId)}>
				<div class="crsstripe"></div>
				<div class="crstop">
					{#if course.id === Number(mostPopularCourseId)}
						<div class="crstag">Most Popular</div>
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

<!-- // <section class="fitsec">
// 	<div class="pinner">
// 		<div class="ey"><span>An honest fit</span></div>
// 		<h2 class="sec-title">WHO DOES WELL<br /><span class="g">HERE.</span></h2>
// 		<p class="sec-sub" style="margin-bottom:44px">
// 			Not everyone should train as a barber, and not everyone who should would enjoy training
// 			here. The people who get the most out of this place tend to have a few things in common.
// 		</p>
// 		<div class="fit-grid">
// 			<ul class="fit-list">
// 				<li>
// 					<b>They bought clippers long before they bought a course.</b> Cutting mates' hair in a kitchen
// 					for free counts for far more than most people give it credit for.
// 				</li>
// 				<li>
// 					<b>They'd rather be corrected on the spot than told they're doing fine.</b> Small groups exist
// 					so someone can watch your hands and say something. That only helps people who want to hear
// 					it.
// 				</li>
// 				<li>
// 					<b>They care about being employable in twelve weeks, not a certificate to frame.</b> The final
// 					weeks are about speed, because speed is what a shop actually hires for.
// 				</li>
// 				<li>
// 					<b>They want textured and Afro hair taught as core craft.</b> Braiding, relaxing, colour and
// 					pattern work sit in the syllabus, not in an optional module at the end.
// 				</li>
// 				<li>
// 					<b>They're willing to be bad at something in public for a few weeks.</b> Everybody's first
// 					fade is rough. The ones who make it did the second one anyway.
// 				</li>
// 			</ul>
// 			<div class="not-fit">
// 				<h4>Probably the wrong place for</h4>
// 				<p>
// 					Anyone after a qualification without the shop floor, or a certificate that arrives
// 					faster than the skill does. Both exist elsewhere and both cost less.
// 				</p>
// 				<p>Anyone who wants to be told they're already good. That's a nice week and a wasted three months.</p>
// 			</div>
// 		</div>
// 	</div>
// </section> -->

<section class="psec">
	<div class="pinner">
		<div class="ey"><span>Paying for it</span></div>
		<h2 class="sec-title" style="font-size:clamp(36px,5vw,64px)">
			YOU DON'T PAY<br />IT ALL AT <span class="g">ONCE.</span>
		</h2>
		<p class="sec-sub" style="margin-bottom:20px">
			Your career shouldn't wait on cash flow. Here's exactly how the money works...
		</p>
		<div class="pstep-grid">
			<div class="pstep">
				<div class="psn">01</div>
				<div>
					<div class="pst">Pay the deposit</div>
					<div class="psd">
					A deposit secures your place on the next intake. It's non-refundable once paid.
					</div>
				</div>
			</div>
			<div class="pstep">
				<div class="psn">02</div>
				<div>
					<div class="pst">Spread the rest</div>
					<div class="psd">
					Pay the remaining balance in equal installments while you train, <span class="text-primary">Interest-free</span>
					</div>
				</div>
			</div>
			<div class="pstep">
				<div class="psn">03</div>
				<div>
					<div class="pst">Finish paid up</div>
					<div class="psd">
					All fees are cleared before certification, with <span class="text-primary"> no hidden costs</span>.
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="why-section">
	<div class="why-inner">
		<div class="why-intro">
			<h2 class="why-bigclaim">TAUGHT ON<br />REAL HEADS.</h2>
			<div class="why-body">
				<p><strong>Real clients from week one.</strong> You're on a paying client's head with an educator stood next to you from the first week.</p>
				<p><em>Small groups.</em>Small enough for hands-on correction.</p>
			</div>
		</div>
		<div class="why-cards">
			<div class="wc">
				<div class="wc-img wc-img-1"></div>
				<div class="wc-overlay"></div>
				<div class="wc-topbar"></div>
				<div class="wc-content">
					<div class="wc-num">01</div>
					<div class="wc-title">Real Clients</div>
					<div class="wc-copy">Paying clients from week one, with an educator beside you.</div>
				</div>
			</div>
			<div class="wc">
				<div class="wc-img wc-img-2"></div>
				<div class="wc-overlay"></div>
				<div class="wc-topbar"></div>
				<div class="wc-content">
					<div class="wc-num">02</div>
					<div class="wc-title">Educators On The Floor</div>
					<div class="wc-copy">The people teaching you still cut in the shop every week.</div>
				</div>
			</div>
			<div class="wc">
				<div class="wc-img wc-img-3"></div>
				<div class="wc-overlay"></div>
				<div class="wc-topbar"></div>
				<div class="wc-content">
					<div class="wc-num">03</div>
					<div class="wc-title">Afro &amp; Textured Hair</div>
					<div class="wc-copy">Taught as core skill, not an optional add-on module.</div>
				</div>
			</div>
		</div>
	</div>
</section>

<section class="faqsec">
	<div class="pinner">
		<div class="ey"><span>Straight answers</span></div>
		<h2 class="sec-title">QUESTIONS PEOPLE<br /><span class="g">ASK.</span></h2>
		<div class="faq-list">
			{#each faqs as f}
				<details class="faq-item">
					<summary>{f.q}</summary>
					<p>{f.a}</p>
				</details>
			{/each}
		</div>
	</div>
</section>

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
			<a href="https://wa.me/447846119677" target="_blank" class="btn-out">Ask on WhatsApp</a>
		</div>
		<div class="cta-banner-trust">From £299 deposit · Limited spots · London-based</div>
	</div>
</div>

<style>
	/* ——— BUTTONS (flat, sharp — matches academy.html) ——— */
	.btn-gold,
	.btn-out {
		clip-path: none;
		border-radius: 2px;
		padding: 11px 20px;
		font-size: 12px;
		letter-spacing: 0.05em;
		box-shadow: none;
		transition:
			transform 0.15s ease,
			background 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
	}
	.btn-gold {
		background: var(--gold);
		color: #0c0c0c;
	}
	.btn-gold:hover {
		background: var(--gold2);
		transform: translateY(-1px);
		box-shadow: none;
	}
	.btn-out {
		border: 1.5px solid rgba(212, 175, 55, 0.5);
	}
	.btn-out:hover {
		border-color: var(--gold);
		background: rgba(212, 175, 55, 0.08);
		transform: translateY(-1px);
	}

	/* ——— COURSES DISCLAIMER ——— */
	.courses-disclaimer {
		margin-top: 20px;
		padding: 14px 18px;
		background: rgba(212, 175, 55, 0.06);
		border: 1px solid rgba(212, 175, 55, 0.2);
		border-left: 3px solid var(--gold);
		font-size: 16.5px;
		line-height: 1.6;
		color: orange;
		max-width: 62em;
	}

	/* ——— PROOF STRIP (academy.html's hairline-grid technique, dark tokens) ——— */
	.proof-strip {
		background: rgba(255, 255, 255, 0.06);
		border-top: 1px solid rgba(255, 255, 255, 0.06);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		padding: 0;
	}
	.proof-inner {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 1px;
		padding: 0;
		max-width: none;
	}
	.proof-item {
		background: var(--dark);
		padding: 40px 22px;
	}
	@media (max-width: 760px) {
		.proof-inner {
			grid-template-columns: 1fr 1fr;
		}
	}

	/* ——— COURSE CARD "MOST POPULAR" TAG ——— */
	.crscard {
		overflow: visible;
	}
	.crscard.pop {
		border-color: var(--gold);
		box-shadow: 0 20px 50px rgba(212, 175, 55, 0.14);
	}
	.crstag {
		position: absolute;
		top: -11px;
		left: 36px;
		background: linear-gradient(135deg, var(--gold3), var(--gold2));
		color: var(--black);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		padding: 6px 12px;
		border-radius: 2px;
	}

	/* ——— HERO ——— */
	.hero {
		position: relative;
		overflow: hidden;
		min-height: 80vh;
		display: flex;
		align-items: center;
		padding: 64px 0;
	}
	.hero-wrap {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 48px;
		width: 100%;
	}
	.hero-bg-slider {
		position: absolute;
		inset: 0;
		z-index: -2;
	}
	.hero-bg-slide {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center 35%;
	}
	.hero-grad {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: linear-gradient(
			90deg,
			rgba(12, 12, 12, 0.94) 0%,
			rgba(12, 12, 12, 0.8) 48%,
			rgba(12, 12, 12, 0.4) 100%
		);
	}
	.hero-in {
		position: relative;
		max-width: 760px;
	}
	.hero-cta {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 28px;
	}
	.hero-reply {
		margin-top: 18px;
		font-size: 13px;
		color: rgba(255, 255, 255, 0.6);
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.hero-reply .dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: #4ade80;
		box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.18);
		flex-shrink: 0;
	}
	@media (max-width: 860px) {
		.hero {
			min-height: 70vh;
			padding: 56px 0;
		}
		.hero-wrap {
			padding: 0 24px;
		}
		.hero-grad {
			background: linear-gradient(180deg, rgba(12, 12, 12, 0.78), rgba(12, 12, 12, 0.94));
		}
	}

	/* ——— QUIZ ——— */
	.qsec {
		background: var(--dark3);
		padding: 100px 48px;
		border-top: 1px solid rgba(212, 175, 55, 0.08);
		border-bottom: 1px solid rgba(212, 175, 55, 0.08);
	}
	.pinner {
		max-width: 920px;
		margin: 0 auto;
	}
	.quiz {
		background: var(--dark2);
		border: 1px solid rgba(212, 175, 55, 0.16);
		padding: clamp(24px, 4vw, 46px);
		overflow: hidden;
	}
	.q-progress {
		height: 3px;
		background: rgba(212, 175, 55, 0.12);
		border-radius: 2px;
		margin-bottom: 30px;
		overflow: hidden;
	}
	.q-progress-bar {
		height: 100%;
		background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2));
		border-radius: 2px;
		transition: width 0.5s cubic-bezier(0.65, 0, 0.35, 1);
	}
	.q-viewport {
		position: relative;
		overflow: hidden;
		transition: height 0.4s cubic-bezier(0.65, 0, 0.35, 1);
	}
	.q-count {
		font-size: 11px;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 700;
	}
	.q-title {
		font-family: var(--fh);
		font-size: clamp(28px, 4vw, 44px);
		line-height: 1;
		margin: 14px 0 28px;
	}
	.q-opts {
		display: grid;
		gap: 10px;
	}
	.q-opt {
		text-align: left;
		background: rgba(255, 255, 255, 0.02);
		color: var(--white);
		border: 1px solid rgba(212, 175, 55, 0.14);
		padding: 18px 22px;
		font-family: var(--ff);
		font-size: 15px;
		cursor: pointer;
		transition:
			transform 0.2s cubic-bezier(0.65, 0, 0.35, 1),
			border-color 0.2s,
			background 0.2s,
			box-shadow 0.2s;
	}
	.q-opt:hover {
		border-color: var(--gold);
		background: rgba(212, 175, 55, 0.08);
		transform: translateX(4px);
		box-shadow: 0 6px 20px -10px rgba(212, 175, 55, 0.4);
	}
	.q-opt:active {
		transform: translateX(4px) scale(0.985);
	}
	.q-result-name {
		font-family: var(--fh);
		font-size: clamp(32px, 5vw, 52px);
		line-height: 1;
		color: var(--gold);
		margin: 10px 0 14px;
	}
	.q-result-why {
		color: var(--grey);
		max-width: 44em;
		line-height: 1.7;
	}
	.q-result-why strong {
		color: var(--white);
	}
	.q-actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px;
		margin-top: 28px;
	}
	.q-restart {
		background: none;
		border: none;
		color: var(--grey);
		text-decoration: underline;
		cursor: pointer;
		font-family: var(--ff);
		font-size: 13px;
		padding: 8px 4px;
	}

	/* ——— FIT SECTION ——— */
	.fitsec {
		padding: 100px 48px;
		max-width: 1280px;
		margin: 0 auto;
	}
	.fit-grid {
		display: grid;
		grid-template-columns: 1.1fr 0.9fr;
		gap: 56px;
		align-items: start;
	}
	.fit-list {
		list-style: none;
		display: grid;
		gap: 20px;
	}
	.fit-list li {
		padding-left: 32px;
		position: relative;
		font-size: 15px;
		color: var(--grey);
		line-height: 1.7;
	}
	.fit-list li::before {
		content: '✓';
		position: absolute;
		left: 0;
		top: 0;
		color: var(--gold);
		font-weight: 700;
	}
	.fit-list li b {
		color: var(--white);
		font-weight: 600;
	}
	.not-fit {
		background: var(--dark2);
		border: 1px solid rgba(212, 175, 55, 0.14);
		border-left: 3px solid #b9433a;
		padding: 28px 26px;
	}
	.not-fit h4 {
		font-size: 11px;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: #d97066;
		margin-bottom: 14px;
		font-weight: 700;
	}
	.not-fit p {
		font-size: 14.5px;
		color: var(--grey);
		line-height: 1.7;
	}
	.not-fit p + p {
		margin-top: 12px;
	}
	@media (max-width: 900px) {
		.fit-grid {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}

	/* ——— PAYMENT STEPS ——— */
	.psec {
		background: var(--dark3);
		padding: 100px 48px;
		border-top: 1px solid rgba(212, 175, 55, 0.08);
	}
	.pstep-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
		margin-top: 24px;
	}
	.psec .pstep {
		background: var(--dark2);
		border: 1px solid rgba(212, 175, 55, 0.12);
		padding: 26px 24px;
		border-bottom: 1px solid rgba(212, 175, 55, 0.12);
	}
	@media (max-width: 760px) {
		.pstep-grid {
			grid-template-columns: 1fr;
		}
	}

	/* ——— FAQ ——— */
	.faqsec {
		background: var(--dark3);
		border-top: 1px solid rgba(212, 175, 55, 0.08);
		padding: 100px 48px;
	}
	.faqsec .pinner {
		max-width: 900px;
	}
	.faq-list {
		margin-top: 20px;
	}
	.faq-item {
		border-bottom: 1px solid rgba(212, 175, 55, 0.14);
		padding: 20px 0;
	}
	.faq-item summary {
		cursor: pointer;
		font-family: var(--fb);
		font-weight: 700;
		font-size: 16px;
		list-style: none;
		display: flex;
		justify-content: space-between;
		gap: 20px;
		align-items: flex-start;
	}
	.faq-item summary::-webkit-details-marker {
		display: none;
	}
	.faq-item summary::after {
		content: '+';
		color: var(--gold);
		font-size: 22px;
		line-height: 1;
		flex: none;
		transition: transform 0.2s;
	}
	.faq-item[open] summary::after {
		transform: rotate(45deg);
	}
	.faq-item p {
		margin-top: 12px;
		color: var(--grey);
		font-size: 14.5px;
		line-height: 1.75;
		max-width: 62em;
	}

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
		.hero {
			min-height: 60vh;
			padding: 48px 0;
		}
		.hero-wrap {
			padding: 0 20px;
		}
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

		.hero-cta {
			gap: 10px;
			margin-top: 22px;
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
			font-size: 13px !important;
			letter-spacing: 0.4px;
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
