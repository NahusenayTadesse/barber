<div class="fi grid grid-cols-1 gap-3 lg:grid-cols-3" style="transition-delay:.15s">
	<div class="wc">
		<div class="wc-img wc-img-1"></div>
		<div class="wc-overlay"></div>
		<div class="wc-topbar"></div>
		<div class="wc-content">
			<div class="wc-num">01</div>
			<div class="wc-title">Real Clients.<br />Week One.</div>
			<div class="wc-copy">Real people. Real cuts. Real shop experience from the start.</div>
		</div>
	</div>

	<div class="wc">
		<div class="wc-img wc-img-2"></div>
		<div class="wc-overlay"></div>
		<div class="wc-topbar"></div>
		<div class="wc-content">
			<div class="wc-num">02</div>
			<div class="wc-title">Tutors Still<br />in the Chair.</div>
			<div class="wc-copy">Learn from working barbers who still cut every week.</div>
		</div>
	</div>

	<div class="wc">
		<div class="wc-img wc-img-3"></div>
		<div class="wc-overlay"></div>
		<div class="wc-topbar"></div>
		<div class="wc-content">
			<div class="wc-num">03</div>
			<div class="wc-title">Walk Out<br />Job-Ready.</div>
			<div class="wc-copy">Build the confidence to step into a shop and start working.</div>
		</div>
	</div>

	<div class="wc">
		<div class="wc-img wc-img-4"></div>
		<div class="wc-overlay"></div>
		<div class="wc-topbar"></div>
		<div class="wc-content">
			<div class="wc-num">04</div>
			<div class="wc-title">Small Groups.<br />Big Progress.</div>
			<div class="wc-copy">Small groups. Direct feedback. No getting lost in the room.</div>
		</div>
	</div>

	<div class="wc">
		<div class="wc-img wc-img-5"></div>
		<div class="wc-overlay"></div>
		<div class="wc-topbar"></div>
		<div class="wc-content">
			<div class="wc-num">05</div>
			<div class="wc-title">Every Texture.<br />Every Style.</div>
			<div class="wc-copy">Fades, beard work, texture and clean finishes across real clients.</div>
		</div>
	</div>

	<div class="wc">
		<div class="wc-img wc-img-6"></div>
		<div class="wc-overlay"></div>
		<div class="wc-topbar"></div>
		<div class="wc-content">
			<div class="wc-num">06</div>
			<div class="wc-title">Start for<br />£299 Deposit.</div>
			<div class="wc-copy">Secure your place fast with a deposit and flexible payment options.</div>
		</div>
	</div>
</div>

<style>
	.wc {
		position: relative;
		overflow: hidden;
		aspect-ratio: 3/4;
		cursor: default;
	}
	.wc-img {
		position: absolute;
		inset: 0;
		background-size: cover;
		background-position: center top;
		transition: transform 0.7s ease;
	}
	.wc:hover .wc-img {
		transform: scale(1.07);
	}
	.wc-img-1 {
		background-image: url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&q=80');
	}
	.wc-img-2 {
		background-image: url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80');
	}
	.wc-img-3 {
		background-image: url('https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&q=80');
	}
	.wc-img-4 {
		background-image: url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600&q=80');
	}
	.wc-img-5 {
		background-image: url('https://images.unsplash.com/photo-1622296089863-eb7fc530daa8?w=600&q=80');
	}
	.wc-img-6 {
		background-image: url('https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600&q=80');
	}
	.wc-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.93) 0%,
			rgba(0, 0, 0, 0.45) 45%,
			rgba(0, 0, 0, 0.1) 100%
		);
		transition: 0.4s;
	}
	.wc:hover .wc-overlay {
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.97) 0%,
			rgba(0, 0, 0, 0.65) 50%,
			rgba(0, 0, 0, 0.2) 100%
		);
	}
	.wc-topbar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--gold3), var(--gold2));
		transform: scaleX(0);
		transform-origin: left;
		transition: 0.45s;
	}
	.wc:hover .wc-topbar {
		transform: scaleX(1);
	}
	.wc-content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 24px 26px 28px;
	}
	.wc-num {
		font-family: var(--fh);
		font-size: 44px;
		line-height: 1;
		color: rgba(212, 175, 55, 0.16);
		margin-bottom: 4px;
	}
	.wc-title {
		font-family: var(--fh);
		font-size: 24px;
		letter-spacing: 0.5px;
		line-height: 1.1;
		margin-bottom: 6px;
	}
	.wc-copy {
		font-size: 12.5px;
		color: rgba(240, 237, 228, 0.62);
		line-height: 1.7;
		font-weight: 300;
		max-height: 0;
		overflow: hidden;
		transition:
			max-height 0.45s ease,
			opacity 0.45s ease;
		opacity: 0;
	}
	.wc:hover .wc-copy {
		max-height: 120px;
		opacity: 1;
	}
</style>
