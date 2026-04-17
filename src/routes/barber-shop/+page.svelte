<script>
	let href = 'https://simplybook.me/en/';

	let { data } = $props();
</script>

<svelte:head>
	<title>D&D Barber Shop</title>
</svelte:head>

<main class="container justify-self-center lg:mt-22">
	<section class="hero">
		<div class="hero-copy">
			<div>
				<div class="eyebrow">Fresh Cuts · Sharp Finishes</div>
				<div class="review-badge">
					<span class="badge-star">4.9 ★</span>
					<span class="badge-copy"><strong>120+ reviews</strong></span>
				</div>
				<h2 class="hero-title">BOOK YOUR<br /><span class="gold">NEXT CUT.</span></h2>
				<p class="hero-sub">
					Haircuts, fades and beard trims in a clean, premium barbershop environment. Simple
					booking, fast service, sharp results.
				</p>
				<div class="hero-points">
					<span>Haircuts</span>
					<span>Skin fades</span>
					<span>Tapers</span>
					<span>Beard trims</span>
				</div>
				<div class="hero-actions">
					<a class="btn-gold" {href} target="_blank" rel="noopener noreferrer">Book Now</a>
					<a class="btn-outline" href="tel:0202779988">Call the Shop</a>
				</div>
				<!-- <div class="hero-note">Replace the booking link with your real booking system URL.</div> -->
			</div>
		</div>

		<div class="hero-image"></div>
	</section>

	<section class="split-band">
		<div class="split-grid">
			<div class="info-card">
				<div class="info-label">Service</div>
				<div class="info-value">Haircuts</div>
				<div class="info-copy">Clean everyday cuts, fresh trims and modern finishes.</div>
			</div>
			<div class="info-card">
				<div class="info-label">Speciality</div>
				<div class="info-value">Fades</div>
				<div class="info-copy">Skin fades, tapers and sharp blends done properly.</div>
			</div>
			<div class="info-card">
				<div class="info-label">Extra</div>
				<div class="info-value">Beards</div>
				<div class="info-copy">Beard tidy-ups and shape work to finish the look.</div>
			</div>
		</div>
	</section>

	<section class="services">
		<div class="services-head">
			<div>
				<div class="services-kicker">Services & Pricing</div>
				<h2 class="services-title">BOOK THE<br /><span class="gold">SERVICE</span></h2>
			</div>
			<p class="services-sub">
				Choose your service below and book directly. Pricing is clear, simple and made for quick
				decisions.
			</p>
		</div>

		<div class="services-grid">
			{#each data?.allServices as service (service.id)}
				<div class="service-card">
					<div
						class="service-image"
						style="background-image: url('/files/{service.imageUrl}')"
					></div>
					<div class="service-body">
						<div class="service-top">
							<div class="service-name">{service.name}</div>
							<div class="service-price">£{service.price}</div>
						</div>
						<div class="service-copy">
							{service.description}
						</div>
						<a
							class="service-book"
							href={service.bookingLink}
							target="_blank"
							rel="noopener noreferrer">Book →</a
						>
					</div>
				</div>
			{/each}
		</div>

		<!-- <div class="services-grid">
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Haircut</div>
						<div class="service-price">£25</div>
					</div>
					<div class="service-copy">
						Variety of cuts including classic haircuts, fade and taper, buzz cut, undercut and more
						tailored to suit your style.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Haircut and Wash</div>
						<div class="service-price">£30</div>
					</div>
					<div class="service-copy">
						Enjoy a fresh cut followed by a relaxing hair wash using premium shampoo for a clean
						finish.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Shape Up</div>
						<div class="service-price">£10</div>
					</div>
					<div class="service-copy">
						A quick touch-up to keep your edges sharp, focused on the hairline, sideburns and
						neckline.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>

			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Kids Haircut (3–10)</div>
						<div class="service-price">£15</div>
					</div>
					<div class="service-copy">
						Gentle and professional haircuts for young children in a comfortable, easy environment.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Kids Haircut (11–15)</div>
						<div class="service-price">£20</div>
					</div>
					<div class="service-copy">
						Trendy cuts for pre-teens and teens with attention to current styles and preferences.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Haircut and Colouring</div>
						<div class="service-price">£45</div>
					</div>
					<div class="service-copy">
						A professional haircut followed by full or partial hair colouring for a complete
						refreshed look.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>

			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Hair Colouring</div>
						<div class="service-price">£20</div>
					</div>
					<div class="service-copy">
						Whether you want a bold change or a subtle refresh, our colouring service is tailored to
						your look.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Hair Colouring with Beard</div>
						<div class="service-price">£30</div>
					</div>
					<div class="service-copy">
						Hair and beard colouring to match or complement each other for a more complete finish.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Haircut, Hair Colouring with Beard</div>
						<div class="service-price">£55</div>
					</div>
					<div class="service-copy">
						Transform your look with a haircut, colouring and beard service tailored to your style.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>

			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Braids</div>
						<div class="service-price">£25</div>
					</div>
					<div class="service-copy">
						Professional braids for men with clean parting, precision and a sharp finished look.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Facials</div>
						<div class="service-price">£25</div>
					</div>
					<div class="service-copy">
						Facial treatments designed to support healthier, cleaner and more refreshed skin.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Face Steam</div>
						<div class="service-price">£10</div>
					</div>
					<div class="service-copy">
						A rejuvenating face steam treatment that opens pores, helps cleanse skin and refreshes
						your face.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>

			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Skin Care</div>
						<div class="service-price">£20</div>
					</div>
					<div class="service-copy">
						Men’s skin care services designed to help maintain healthy, clean and well-presented
						skin.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Hair and Makeup</div>
						<div class="service-price">£50</div>
					</div>
					<div class="service-copy">
						Hair grooming and makeup application for events, photoshoots, special occasions or a
						polished look.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Eyebrow Shaping</div>
						<div class="service-price">£5</div>
					</div>
					<div class="service-copy">
						Precise eyebrow grooming and shaping to sharpen your overall appearance.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>

			<div class="service-card">
				<div class="service-image"></div>
				<div class="service-body">
					<div class="service-top">
						<div class="service-name">Hair Wash</div>
						<div class="service-price">£5</div>
					</div>
					<div class="service-copy">
						A relaxing scalp cleanse using premium products that nourish and revitalize your hair.
					</div>
					<a class="service-book" {href} target="_blank" rel="noopener noreferrer">Book →</a>
				</div>
			</div>
		</div> -->
	</section>

	<section class="reviews">
		<div class="reviews-head">
			<div>
				<div class="services-kicker">Reviews</div>
				<h2 class="reviews-title">REAL<br /><span class="gold">RESULTS</span></h2>
			</div>
		</div>

		<div class="reviews-grid">
			<div class="review-card">
				<div>
					<div class="stars">★★★★★</div>
					<div class="review-text">
						Best barbers in town! I got my hair done with them without breaking the bank. I will
						definitely come back.
					</div>
				</div>
				<div class="review-name">Ebrima L Dampha</div>
			</div>

			<div class="review-card">
				<div>
					<div class="stars">★★★★★</div>
					<div class="review-text">
						Clean shop, sharp fades and quick service. Exactly what you want from a barber.
					</div>
				</div>
				<div class="review-name">Client Review</div>
			</div>

			<div class="review-card">
				<div>
					<div class="stars">★★★★★</div>
					<div class="review-text">
						Booked online, walked in, and left fresh. Proper experience from start to finish.
					</div>
				</div>
				<div class="review-name">Client Review</div>
			</div>
		</div>
	</section>

	<section class="booking-cta">
		<div class="booking-box">
			<h2>READY TO<br /><span class="gold">BOOK?</span></h2>
			<p>Click below to book your appointment online. Fast, simple and direct.</p>
			<a class="btn-gold" {href} target="_blank" rel="noopener noreferrer">Book Now</a>
		</div>
	</section>
</main>

<style>
	.brand {
		display: flex;
		align-items: center;
		gap: 16px;
		text-decoration: none;
	}
	.brand-mark {
		width: 54px;
		height: 54px;
		border-radius: 50%;
		border: 2px solid var(--gold);
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0f0e00 0%, #1c1900 100%);
		box-shadow: 0 0 24px rgba(212, 175, 55, 0.18);
		font-family: var(--fh);
		font-size: 20px;
		color: var(--gold);
		letter-spacing: 1px;
	}
	.brand-copy h1 {
		font-family: var(--fh);
		font-size: 24px;
		letter-spacing: 3px;
		line-height: 1;
		background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.brand-copy p {
		margin-top: 5px;
		font-size: 11px;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: var(--grey);
	}
	.top-actions {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}
	.mini-link {
		color: var(--grey);
		text-decoration: none;
		font-size: 12px;
		letter-spacing: 1px;
		border: 1px solid rgba(212, 175, 55, 0.16);
		padding: 10px 14px;
		transition: 0.25s;
	}
	.mini-link:hover {
		color: var(--gold);
		border-color: rgba(212, 175, 55, 0.35);
		background: rgba(212, 175, 55, 0.06);
	}

	.btn-gold,
	.btn-outline {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		text-decoration: none;
		font-family: var(--fb);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 2.5px;
		text-transform: uppercase;
		padding: 16px 30px;
		transition: 0.25s;
		cursor: pointer;
	}
	.btn-gold {
		background: linear-gradient(135deg, var(--gold3), var(--gold), var(--gold2));
		color: var(--black);
		clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
	}
	.btn-gold:hover {
		transform: translateY(-3px);
		box-shadow: 0 12px 30px rgba(212, 175, 55, 0.28);
	}
	.btn-outline {
		color: var(--gold);
		border: 1px solid rgba(212, 175, 55, 0.35);
		background: rgba(212, 175, 55, 0.05);
		clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
	}
	.btn-outline:hover {
		background: rgba(212, 175, 55, 0.1);
		transform: translateY(-3px);
	}

	.hero {
		min-height: 88vh;
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: 22px;
		align-items: stretch;
		padding: 28px 0 18px;
	}
	.hero-copy,
	.hero-image {
		position: relative;
		overflow: hidden;
		min-height: 650px;
		border: 1px solid rgba(212, 175, 55, 0.14);
		background: var(--dark2);
	}
	.hero-copy {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 42px;
		background:
			radial-gradient(circle at top right, rgba(212, 175, 55, 0.08), transparent 28%),
			linear-gradient(135deg, #0a0a0a 0%, #111111 55%, #090909 100%);
	}
	.hero-image {
		background-image: url('/images (12).webp');
		background-size: cover;
		background-position: center;
	}
	.hero-image::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(5, 5, 5, 0.7) 0%,
			rgba(5, 5, 5, 0.18) 45%,
			rgba(5, 5, 5, 0.08) 100%
		);
	}
	.eyebrow {
		color: var(--gold);
		font-size: 11px;
		letter-spacing: 5px;
		text-transform: uppercase;
		margin-bottom: 18px;
		font-weight: 700;
	}
	.hero-title {
		font-family: var(--fh);
		font-size: clamp(68px, 10vw, 138px);
		line-height: 0.9;
		letter-spacing: 2px;
		margin-bottom: 16px;
		text-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
	}
	.gold {
		background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.hero-sub {
		max-width: 560px;
		color: #c7c3bc;
		font-size: 16px;
		line-height: 1.8;
		margin-bottom: 24px;
	}
	.hero-points {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 26px;
	}
	.hero-points span {
		font-size: 11px;
		color: var(--grey);
		border: 1px solid rgba(212, 175, 55, 0.12);
		padding: 9px 11px;
		background: rgba(255, 255, 255, 0.02);
	}
	.hero-actions {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.hero-note {
		font-size: 12px;
		color: var(--grey);
		line-height: 1.7;
	}
	.review-badge {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 18px;
		padding: 10px 14px;
		border: 1px solid rgba(212, 175, 55, 0.18);
		background: rgba(212, 175, 55, 0.05);
		color: var(--white);
		font-size: 12px;
		letter-spacing: 1px;
	}
	.review-badge .badge-star {
		color: var(--gold);
		font-size: 14px;
		letter-spacing: 1px;
	}
	.review-badge .badge-copy strong {
		color: var(--gold);
		font-weight: 700;
	}

	.split-band {
		padding: 22px 0 0;
	}
	.split-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	.services {
		padding: 34px 0 10px;
	}
	.services-head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 20px;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.services-kicker {
		color: var(--gold);
		font-size: 10px;
		letter-spacing: 4px;
		text-transform: uppercase;
		font-weight: 700;
		margin-bottom: 8px;
	}
	.services-title {
		font-family: var(--fh);
		font-size: clamp(44px, 6vw, 78px);
		line-height: 0.92;
		letter-spacing: 2px;
	}
	.services-sub {
		max-width: 520px;
		color: #beb9b2;
		font-size: 15px;
		line-height: 1.8;
	}
	.services-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}

	.reviews {
		padding: 50px 0 10px;
	}
	.reviews-head {
		display: flex;
		justify-content: space-between;
		align-items: end;
		gap: 20px;
		flex-wrap: wrap;
		margin-bottom: 20px;
	}
	.reviews-title {
		font-family: var(--fh);
		font-size: clamp(40px, 6vw, 70px);
		line-height: 0.92;
		letter-spacing: 2px;
	}
	.reviews-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}
	.review-card {
		border: 1px solid rgba(212, 175, 55, 0.12);
		background: var(--dark2);
		padding: 22px;
		min-height: 160px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}
	.review-text {
		color: #d1ccc5;
		font-size: 15px;
		line-height: 1.7;
		margin-bottom: 14px;
	}
	.review-name {
		font-size: 12px;
		color: var(--gold);
		letter-spacing: 2px;
		text-transform: uppercase;
		font-weight: 700;
	}
	.stars {
		color: var(--gold);
		font-size: 14px;
		letter-spacing: 2px;
		margin-bottom: 8px;
	}

	@media (max-width: 980px) {
		.reviews-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 640px) {
		.reviews-grid {
			grid-template-columns: 1fr;
		}
	}
	.service-card {
		border: 1px solid rgba(212, 175, 55, 0.12);
		background: var(--dark2);
		padding: 0;
		display: flex;
		flex-direction: column;
		min-height: 220px;
		overflow: hidden;
	}
	.service-image {
		width: 100%;
		height: 340px;
		object-fit: contain;
		background-size: cover;
		background-position: center;
		opacity: 0.45;
		transition:
			transform 0.5s ease,
			opacity 0.3s ease;
	}
	.service-card:hover .service-image {
		transform: scale(1.08);
		opacity: 0.6;
	}
	.service-body {
		padding: 22px;
		display: flex;
		flex-direction: column;
		flex: 1;
		border: 1px solid rgba(212, 175, 55, 0.12);
		background: var(--dark2);
		padding: 22px;
		display: flex;
		flex-direction: column;
		min-height: 220px;
	}
	.service-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
		margin-bottom: 12px;
	}
	.service-name {
		font-family: var(--fb);
		font-size: 20px;
		font-weight: 700;
		line-height: 1.2;
		color: var(--white);
	}
	.service-price {
		font-family: var(--fh);
		font-size: 34px;
		line-height: 1;
		white-space: nowrap;
		background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.service-copy {
		color: #bdb8b1;
		font-size: 14px;
		line-height: 1.7;
		margin-bottom: 18px;
		flex: 1;
	}
	.service-book {
		margin-top: auto;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		color: var(--gold);
		text-decoration: none;
		font-size: 12px;
		letter-spacing: 2px;
		text-transform: uppercase;
		font-weight: 700;
	}
	.service-book:hover {
		color: var(--gold2);
	}

	/* Assign images per card */
	/*.services-grid .service-card:nth-child(1) .service-image {
		background-image: url('/images (1).webp');
	}
	.services-grid .service-card:nth-child(2) .service-image {
		background-image: url('/images (2).webp');
	}
	.services-grid .service-card:nth-child(3) .service-image {
		background-image: url('/images (3).webp');
	}
	.services-grid .service-card:nth-child(4) .service-image {
		background-image: url('/images (4).webp');
	}
	.services-grid .service-card:nth-child(5) .service-image {
		background-image: url('/images (5).webp');
	}
	.services-grid .service-card:nth-child(6) .service-image {
		background-image: url('/images (6).webp');
	}
	.services-grid .service-card:nth-child(7) .service-image {
		background-image: url('/images (7).webp');
	}
	.services-grid .service-card:nth-child(8) .service-image {
		background-image: url('/images (8).webp');
	}
	.service-image {
		background-image: url('/images (12).webp');
	}
	.services-grid .service-card:nth-child(10) .service-image {
		background-image: url('/images (7).webp');
	}
	.services-grid .service-card:nth-child(11) .service-image {
		background-image: url('/images (13).webp');
	}
	.services-grid .service-card:nth-child(12) .service-image {
		background-image: url('/images (11).webp');
	}
	.services-grid .service-card:nth-child(13) .service-image {
		background-image: url('/images (14).webp');
	}
	.services-grid .service-card:nth-child(14) .service-image {
		background-image: url('/images (15).webp');
	}
	.services-grid .service-card:nth-child(15) .service-image {
		background-image: url('/images (16).webp');
	}
	.services-grid .service-card:nth-child(16) .service-image {
		background-image: url('/images (17).webp');
	}*/

	.split-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
	}
	.info-card {
		border: 1px solid rgba(212, 175, 55, 0.12);
		background: var(--dark2);
		padding: 22px;
	}
	.info-label {
		color: var(--gold);
		font-size: 10px;
		letter-spacing: 4px;
		text-transform: uppercase;
		margin-bottom: 10px;
		font-weight: 700;
	}
	.info-value {
		font-family: var(--fh);
		font-size: 34px;
		line-height: 1;
		margin-bottom: 10px;
	}
	.info-copy {
		color: #bdb8b1;
		font-size: 14px;
		line-height: 1.7;
	}

	.booking-cta {
		padding: 70px 0 90px;
	}
	.booking-box {
		border: 1px solid rgba(212, 175, 55, 0.15);
		background:
			radial-gradient(circle at center, rgba(212, 175, 55, 0.05), transparent 36%),
			linear-gradient(135deg, #0b0b0b 0%, #111111 60%, #0b0b0b 100%);
		text-align: center;
		padding: 56px 28px;
	}
	.booking-box h2 {
		font-family: var(--fh);
		font-size: clamp(48px, 7vw, 90px);
		line-height: 0.92;
		letter-spacing: 2px;
		margin-bottom: 16px;
	}
	.booking-box p {
		max-width: 650px;
		margin: 0 auto 26px;
		color: #c2bdb7;
		font-size: 16px;
		line-height: 1.8;
	}

	.footer {
		border-top: 1px solid rgba(212, 175, 55, 0.12);
		padding: 26px 0 38px;
	}
	.footer-inner {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		flex-wrap: wrap;
		color: var(--grey);
		font-size: 12px;
		line-height: 1.7;
	}

	@media (max-width: 980px) {
		.hero {
			grid-template-columns: 1fr;
		}
		.hero-copy,
		.hero-image {
			min-height: 460px;
		}
		.split-grid {
			grid-template-columns: 1fr;
		}
		.services-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (max-width: 640px) {
		.container {
			padding: 0 20px;
		}
		.topbar-inner {
			height: auto;
			padding: 16px 0;
			align-items: flex-start;
			flex-direction: column;
		}
		.hero-copy {
			padding: 28px;
		}
		.hero-copy,
		.hero-image {
			min-height: 400px;
		}
		.hero-actions {
			flex-direction: column;
			align-items: flex-start;
		}
		.top-actions {
			width: 100%;
		}
		.services-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
