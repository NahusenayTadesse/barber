<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { X } from '@lucide/svelte';
	import { genderAudience, type BannerDiscount } from '$lib/discounts';

	let { discount }: { discount: BannerDiscount } = $props();

	let open = $state(false);
	let closeBtn = $state<HTMLButtonElement>();

	const offer = $derived(
		(discount.more
			? 'on selected courses'
			: discount.courseLabel === 'all courses'
				? 'on all courses'
				: `on ${discount.courseLabel}`) +
			(discount.gender ? ` for ${genderAudience[discount.gender]}` : '')
	);

	// Shown once per browser session for each discount; a new discount shows again
	const seenKey = $derived(`discount-popup:${discount.name}:${discount.percentage}`);

	const GOLDS = ['#d4af37', '#f5d060', '#b8860b', '#fff3c4', '#ffffff'];

	async function celebrate() {
		const { default: confetti } = await import('canvas-confetti');
		const fire = (opts: Parameters<typeof confetti>[0]) =>
			confetti({ colors: GOLDS, zIndex: 10001, disableForReducedMotion: true, ...opts });

		// Opening burst from the middle, then cannons from both sides
		fire({ particleCount: 120, spread: 100, startVelocity: 45, origin: { y: 0.55 } });
		setTimeout(() => {
			fire({ particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } });
			fire({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } });
		}, 250);

		// A gentle shimmer of falling gold for a couple of seconds
		const end = Date.now() + 2200;
		(function shimmer() {
			fire({
				particleCount: 3,
				startVelocity: 0,
				ticks: 260,
				gravity: 0.6,
				scalar: 0.9,
				shapes: ['square', 'circle'],
				origin: { x: Math.random(), y: -0.05 }
			});
			if (Date.now() < end) requestAnimationFrame(shimmer);
		})();
	}

	async function show() {
		open = true;
		document.body.style.overflow = 'hidden';
		await tick();
		closeBtn?.focus();
		celebrate();
	}

	function close() {
		open = false;
		document.body.style.overflow = '';
		try {
			sessionStorage.setItem(seenKey, '1');
		} catch {
			// Storage blocked: the popup may show again on the next page, which is fine
		}
	}

	onMount(() => {
		let seen = false;
		try {
			seen = sessionStorage.getItem(seenKey) === '1';
		} catch {
			// Storage blocked: treat as not seen
		}
		if (seen) return;

		const timer = setTimeout(show, 900);
		return () => {
			clearTimeout(timer);
			document.body.style.overflow = '';
		};
	});
</script>

<svelte:window onkeydown={(e) => open && e.key === 'Escape' && close()} />

{#if open}
	<div
		class="dp-backdrop"
		transition:fade={{ duration: 200 }}
		onclick={close}
		aria-hidden="true"
	></div>
	<div
		class="dp-card"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dp-title"
		aria-describedby="dp-desc"
		in:scale={{ duration: 450, start: 0.8, easing: backOut }}
		out:fade={{ duration: 150 }}
	>
		<button bind:this={closeBtn} class="dp-close" onclick={close} aria-label="Close">
			<X class="size-5" />
		</button>

		<div class="dp-eyebrow">{discount.name}</div>
		<h2 id="dp-title" class="dp-pct">
			{discount.more ? 'Up to ' : ''}{discount.percentage}%<span>OFF</span>
		</h2>
		<p id="dp-desc" class="dp-offer">{offer}</p>
		<p class="dp-ends">Ends {discount.endsOn}</p>

		<a href="/courses#courses" class="btn-gold dp-cta" onclick={close}>See the Courses →</a>
		<button class="dp-later" onclick={close}>Maybe later</button>
	</div>
{/if}

<style>
	.dp-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10000;
		background: rgba(5, 5, 5, 0.78);
		backdrop-filter: blur(4px);
	}
	.dp-card {
		position: fixed;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		z-index: 10000;
		width: min(440px, calc(100vw - 32px));
		padding: 44px 32px 28px;
		text-align: center;
		background:
			radial-gradient(circle at 50% 0%, rgba(212, 175, 55, 0.22), transparent 60%), var(--dark2);
		border: 1px solid rgba(212, 175, 55, 0.45);
		border-radius: 18px;
		box-shadow:
			0 30px 80px rgba(0, 0, 0, 0.6),
			0 0 60px rgba(212, 175, 55, 0.15);
	}
	.dp-close {
		position: absolute;
		top: 12px;
		right: 12px;
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 999px;
		color: var(--grey);
		transition:
			color 0.2s,
			background 0.2s;
	}
	.dp-close:hover {
		color: var(--white);
		background: rgba(255, 255, 255, 0.08);
	}
	.dp-eyebrow {
		font-family: var(--fb);
		font-size: 13px;
		font-weight: 700;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.dp-pct {
		margin: 6px 0 0;
		font-family: var(--fh);
		font-size: clamp(84px, 24vw, 120px);
		line-height: 0.9;
		background: linear-gradient(135deg, var(--gold3), var(--gold2) 50%, var(--gold));
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.dp-pct span {
		margin-left: 10px;
		font-size: 0.45em;
		letter-spacing: 0.05em;
	}
	.dp-offer {
		margin-top: 6px;
		font-family: var(--fb);
		font-size: 18px;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--white);
	}
	.dp-ends {
		display: inline-block;
		margin-top: 14px;
		padding: 6px 14px;
		font-size: 13px;
		color: var(--gold2);
		border: 1px solid rgba(212, 175, 55, 0.35);
		border-radius: 999px;
		background: rgba(212, 175, 55, 0.08);
	}
	.dp-cta {
		display: flex;
		justify-content: center;
		width: 100%;
		margin-top: 26px;
		padding: 16px;
		font-size: 14px;
	}
	.dp-later {
		margin-top: 12px;
		font-size: 13px;
		color: var(--grey);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.dp-later:hover {
		color: var(--white);
	}
</style>
