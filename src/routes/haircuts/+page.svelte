<script lang="ts">
	let { data } = $props();

	const bookingLink = 'https://simplybook.me/en/';

	const heroImages = $derived(
		data.imagesList?.length
			? data.imagesList
					.filter((img): img is string => !!img)
					.map((img) => (img.startsWith('http') || img.startsWith('/') ? img : `/files/${img}`))
			: ['/images (18).webp']
	);
	const resize = (img: string, w: number, q = 70) =>
		img.startsWith('/files/') ? `${img}?w=${w}&q=${q}` : img;
	const heroImage = $derived(resize(heroImages[0], 1280, 68));
	const modelImage = $derived(resize(heroImages[1] ?? heroImages[0], 900));
	const visitImage = $derived(resize(heroImages[2] ?? heroImages[0], 900));

	const cheapestPrice = $derived.by(() => {
		const prices = data.servicesList
			.map((s) => Number(s.price))
			.filter((p) => Number.isFinite(p) && p > 0);
		return prices.length ? Math.min(...prices) : null;
	});

	const reviews = [
		{
			text: 'Best barbers in town! I got my hair done with them without breaking the bank. I will definitely come back.',
			name: 'Ebrima L Dampha'
		},
		{
			text: 'Clean shop, sharp fades and quick service. Exactly what you want from a barber.',
			name: 'Client Review'
		},
		{
			text: 'Booked online, walked in, and left fresh. Proper experience from start to finish.',
			name: 'Client Review'
		}
	];
</script>

<svelte:head>
	<title>Haircuts &amp; Prices</title>
	<meta
		name="description"
		content="See haircut, fade and beard trim prices at D&D Barber Shop in London, and book your next cut online in minutes."
	/>
	<link rel="preload" as="image" fetchpriority="high" href={heroImage} />
</svelte:head>

<!-- HERO -->
<header class="hero">
	<div class="hero-bg" style="background-image:url('{heroImage}')"></div>
	<div class="hero-grad"></div>
	<div class="hero-wrap">
		<div class="hero-in">
			<div class="ey"><span>London · Walk-ins welcome</span></div>
			<h1 class="hero-h1">
				<div class="lg:text-9xl!">THE LAST BARBER</div>
				<div class="g lg:text-9xl!">YOU'LL HAVE TO TRY.</div>
			</h1>
			<p class="hero-sub">
			Fades, beards, hot towel shaves. Thirty seconds to book. Then you're sorted.
			</p>
			<div class="hero-cta">
				<a class="btn-gold" href={bookingLink} target="_blank" rel="noopener">Book A Cut</a>
				<a class="btn-out" href="#prices">See The Price List</a>
			</div>
			<p class="hero-reply"><b class="stars-b">★★★★★ 4.9</b> from 120+ Google reviews</p>
		</div>
	</div>
</header>

<div class="ticker-wrap">
	<div class="ticker-inner">
		<span>Walk-Ins Welcome</span><span>Fades &amp; Beard Work</span><span>Hot Towel Shaves</span
		><span>Book In 30 Seconds</span><span>London Based</span><span>£10 Model Cuts</span>
		<span>Walk-Ins Welcome</span><span>Fades &amp; Beard Work</span><span>Hot Towel Shaves</span
		><span>Book In 30 Seconds</span><span>London Based</span><span>£10 Model Cuts</span>
	</div>
</div>

<div class="section" id="prices">
	<div class="ey"><span>Price list</span></div>
	<h2 class="sec-title">WHAT IT<br /><span class="g">COSTS.</span></h2>
	<p class="sec-sub" style="margin-bottom:36px">
		No consultation fees, no upsell at the chair. What's on this list is what you pay.
	</p>
	<div class="menu">
		{#each data.servicesList as service (service.id)}
			<div class="item">
				<span class="n">
					{service.name}
					{#if service.description}<small>{service.description}</small>{/if}
				</span>
				<span class="rule"></span>
				<span class="p">£{service.price}</span>
			</div>
		{/each}
	</div>
</div>

<section class="modelsec">
	<div class="model">
		<div class="model-copy">
			<div class="ey"><span>£10 model cuts</span></div>
			<h3>Same cut. Supervised. Half the price.</h3>
			<p>
				Our trainee barbers need real heads to work on, and an educator checks every single
				step. You get a proper cut for a tenner, they get the practice that makes them
				employable.
			</p>
			<ul>
				<li>Every cut supervised by a qualified educator</li>
				<li>Takes a bit longer — bring twenty minutes of patience</li>
				<li>Weekday daytime slots</li>
				<li>Tell us what you want; nothing experimental unless you ask</li>
			</ul>
			<a class="btn-gold" href="https://wa.me/447846119677" target="_blank" rel="noopener"
				>Book A Model Cut</a
			>
		</div>
		<img src={modelImage} alt="An educator supervising a trainee barber mid-cut" loading="lazy" />
	</div>
</section>

<!-- <section class="fitsec">
	<div class="ey"><span>An honest fit</span></div>
	<h2 class="sec-title">WHO THIS SHOP<br /><span class="g">SUITS.</span></h2>
	<p class="sec-sub" style="margin-bottom:44px">
		Every barbershop is right for somebody and wrong for somebody else. Here's ours, plainly.
	</p>
	<div class="fit-grid">
		<ul class="fit-list">
			<li>
				<b>People who'd rather have a barber than keep finding one.</b> Most of the chairs here
				are filled by the same faces every three weeks, and that's the point.
			</li>
			<li>
				<b>Anyone who wants the truth about what will actually suit them.</b> If the screenshot won't
				sit right on your hair, we'll say so and show you what will.
			</li>
			<li>
				<b>Textured and Afro hair, without the explaining.</b> It's core work here, at the same price
				as anything else. No surcharge, no sighing, no being squeezed in.
			</li>
			<li>
				<b>People who want in, sharp, and out.</b> Shop pace, not spa pace. A clean cut in forty
				minutes beats a perfect one in two hours.
			</li>
		</ul>
		<div class="not-fit">
			<h4>Probably not the place for</h4>
			<p>
				Anyone after an hour of ceremony, a hot towel as theatre and a bill to match. There are
				excellent shops in London doing exactly that.
			</p>
			<p>
				Anyone who wants the cheapest cut on the high street. We're fair, not the cheapest, and
				the difference shows.
			</p>
		</div>
	</div>
</section> -->

<section class="quotesec">
	<div class="quotes">
		{#each reviews as r}
			<div class="quote">
				<p>"{r.text}"</p>
				<cite>{r.name}</cite>
			</div>
		{/each}
	</div>
</section>

<section class="visitsec" id="visit">
	<div class="visit">
		<div>
			<div class="ey"><span>Find us</span></div>
			<h2 class="sec-title" style="font-size:clamp(32px,4.6vw,52px);margin:12px 0 22px">
				COME <span class="g">IN.</span>
			</h2>
			<dl>
				<dt>Location</dt><dd>69 · London, UK</dd>
				{#each data.businessHours ?? [] as day (day.dayOfWeek)}
					<dt>{day.dayLabel.slice(0, 3)}</dt>
					<dd>{day.isClosed ? 'Closed' : `${day.opensLabel} – ${day.closesLabel}`}</dd>
				{/each}
				<dt>Phone</dt><dd><a href="tel:02037003997">020 3700 3997</a></dd>
			</dl>
			<div class="hero-cta">
				<a class="btn-gold" href={bookingLink} target="_blank" rel="noopener">Book A Cut</a>
				<a class="btn-out" href="https://wa.me/447846119677" target="_blank" rel="noopener"
					>Ask On WhatsApp</a
				>
			</div>
		</div>
		<img src={visitImage} alt="Finishing a neckline at D&amp;D Barber &amp; Academy" loading="lazy" />
	</div>
</section>

<div class="cta-banner">
	<div class="cta-banner-bg"></div>
	<div class="cta-banner-inner fi">
		<div class="cta-banner-kicker">Walk-ins welcome, booking is safer</div>
		<h2 class="cta-banner-title">GET IN<br /><span class="g">THE CHAIR.</span></h2>
		<p class="cta-banner-sub">Book online, or send one message and we'll find you a slot today.</p>
		<div class="cta-banner-btns">
			<a class="btn-gold" href={bookingLink} target="_blank" rel="noopener">Book A Cut</a>
			<a href="tel:02037003997" class="btn-out">Call 020 3700 3997</a>
		</div>
		<div class="cta-banner-trust">
			{#if cheapestPrice}Cuts from £{cheapestPrice} · {/if}Model cuts £10 · London
		</div>
	</div>
</div>

<style>
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
	.hero-bg {
		position: absolute;
		inset: 0;
		z-index: -2;
		background-size: cover;
		background-position: center 40%;
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
		font-size: 14px;
		color: rgba(255, 255, 255, 0.75);
	}
	.stars-b {
		color: var(--gold);
		font-size: 15px;
		letter-spacing: 0.06em;
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
	@media (max-width: 640px) {
		.hero {
			min-height: 60vh;
			padding: 48px 0;
		}
		.hero-wrap {
			padding: 0 20px;
		}
	}

	/* ——— PRICE LIST ——— */
	.menu {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 56px;
	}
	.item {
		display: flex;
		align-items: baseline;
		gap: 14px;
		padding: 18px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}
	.item .n {
		font-weight: 600;
		font-size: 16px;
		color: var(--white);
	}
	.item .n small {
		display: block;
		font-weight: 300;
		font-size: 12.5px;
		color: var(--grey);
		white-space: normal;
		margin-top: 4px;
		line-height: 1.5;
	}
	.item .rule {
		flex: 1;
		border-bottom: 1px dotted rgba(255, 255, 255, 0.2);
		transform: translateY(-4px);
	}
	.item .p {
		font-family: var(--fh);
		font-size: 22px;
		letter-spacing: 0.5px;
		color: var(--gold);
		flex-shrink: 0;
	}
	@media (max-width: 760px) {
		.menu {
			grid-template-columns: 1fr;
			gap: 0;
		}
	}

	/* ——— MODEL CUTS ——— */
	.modelsec {
		background: var(--dark3);
		border-top: 1px solid rgba(212, 175, 55, 0.08);
		border-bottom: 1px solid rgba(212, 175, 55, 0.08);
		padding: 0;
	}
	.model {
		display: grid;
		grid-template-columns: 1fr 1fr;
		max-width: 1280px;
		margin: 0 auto;
	}
	.model-copy {
		padding: clamp(40px, 6vw, 90px) 48px;
	}
	.model-copy h3 {
		font-family: var(--fh);
		font-size: clamp(30px, 4vw, 46px);
		line-height: 1;
		letter-spacing: 0.5px;
		margin: 12px 0 16px;
	}
	.model-copy p {
		color: var(--grey);
		max-width: 34em;
		line-height: 1.8;
		font-size: 15px;
		font-weight: 300;
	}
	.model-copy ul {
		list-style: none;
		margin: 22px 0 28px;
		display: grid;
		gap: 10px;
	}
	.model-copy li {
		padding-left: 22px;
		position: relative;
		font-size: 14.5px;
		color: rgba(240, 237, 228, 0.86);
	}
	.model-copy li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 10px;
		width: 9px;
		height: 2px;
		background: var(--gold);
	}
	.model img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		min-height: 320px;
	}
	@media (max-width: 860px) {
		.model {
			grid-template-columns: 1fr;
		}
		.model img {
			min-height: 240px;
		}
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

	/* ——— QUOTES ——— */
	.quotesec {
		padding: 0 48px 100px;
		max-width: 1280px;
		margin: 0 auto;
	}
	.quotes {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}
	.quote {
		background: var(--dark2);
		border: 1px solid rgba(212, 175, 55, 0.12);
		padding: 28px 26px;
	}
	.quote p {
		font-size: 15px;
		color: rgba(240, 237, 228, 0.85);
		line-height: 1.7;
	}
	.quote cite {
		display: block;
		margin-top: 16px;
		font-style: normal;
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 600;
	}
	@media (max-width: 860px) {
		.quotes {
			grid-template-columns: 1fr;
		}
	}

	/* ——— VISIT ——— */
	.visitsec {
		background: var(--dark3);
		border-top: 1px solid rgba(212, 175, 55, 0.08);
		padding: 100px 48px;
	}
	.visit {
		max-width: 1280px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 56px;
		align-items: start;
	}
	.visit dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 12px 28px;
		font-size: 16px;
		margin-top: 8px;
		color: var(--white);
	}
	.visit dt {
		font-size: 11px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
		padding-top: 5px;
	}
	.visit dd a {
		color: var(--white);
		text-decoration: none;
	}
	.visit dd a:hover {
		color: var(--gold);
	}
	.visit img {
		border-radius: 3px;
		width: 100%;
		max-height: 420px;
		object-fit: cover;
	}
	@media (max-width: 860px) {
		.visit {
			grid-template-columns: 1fr;
			gap: 32px;
		}
	}
</style>
