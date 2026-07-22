<script lang="ts">
	import { page } from '$app/state';
	import { MenuIcon, XIcon } from '@lucide/svelte';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';

	// Only the fields the menu needs. Keep secureFields out of what you pass in.
	type Course = {
		id: number;
		name: string;
		basePrice: string; // decimal() comes back as a string
		minPrice?: string | null;
		minPriceMessage?: string | null;
	};

	let { courses = [] }: { courses?: Course[] } = $props();

	let isOpen = $state(false);
	const handleMenuClick = () => {
		isOpen = false;
	};

	const gbp = new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	});

	const priceLabel = (course: Course) => {
		if (course.minPriceMessage) return course.minPriceMessage;
		const value = Number(course.basePrice);
		return Number.isFinite(value) ? gbp.format(value) : '';
	};

	let menuItems = [
		{ label: 'Home', href: '/courses' },
		{ label: 'Contact', href: '/contact' }
	];
</script>

<!-- ============ DESKTOP ============ -->
<div class="hidden lg:block">
	<nav>
		<!-- LEFT: Home + Contact -->
		<ul class="nav-left">
			<li>
				<a href="/courses" id="nav-home" class={page.url.pathname === '/courses' ? 'al' : ''}>Home</a>
			</li>
			<li>
				<a href="/contact" id="nav-contact" class={page.url.pathname === '/contact' ? 'al' : ''}
					>Contact</a
				>
			</li>
		</ul>

		<!-- CENTRE: Logo -->
		<a href="/" class="brand">
			<div class="brand-mark">D&D</div>
			<div class="brand-copy">
				<h1>D&D Barber & Academy</h1>
				<p>London · Barber Shop & Academy</p>
			</div>
		</a>

		<!-- RIGHT: Start Your Career -->
		<ul class="nav-right">
			<li><a href="/courses" class="nav-enrol">Start Your Career</a></li>
		</ul>
	</nav>
</div>

<!-- ============ MOBILE ============ -->
<div class="flex items-center justify-between px-4 py-3 lg:hidden">
	<!-- Compact brand, left-aligned -->
	<a href="/" class="brand brand--sm">
		<div class="brand-mark">D&D</div>
		<div class="brand-copy">
			<h1>D&D Barber & Academy</h1>
		</div>
	</a>

	<!-- Menu trigger, right-aligned -->
	<Sheet bind:open={isOpen}>
		<SheetTrigger>
			{#snippet child({ props: triggerProps })}
				<Button variant="ghost" size="icon" aria-label="Open menu" {...triggerProps}>
					<MenuIcon class="size-6" />
				</Button>
			{/snippet}
		</SheetTrigger>

		<SheetContent
			side="right"
			class="drawer-content z-9999 w-full border-0 p-0 sm:max-w-sm [&>button]:hidden"
		>
			<div class="drawer">
				<!-- Brand header -->
				<div class="drawer-head">
					<a href="/" class="brand brand--stack" onclick={handleMenuClick}>
						<div class="brand-mark">D&D</div>
						<div class="brand-copy">
							<h1>D&D Barber & Academy</h1>
							<p>London · Barber Shop & Academy</p>
						</div>
					</a>
					<button class="drawer-close" aria-label="Close menu" onclick={handleMenuClick}>
						<XIcon class="size-5" />
					</button>
				</div>

				<!-- Scrollable body -->
				<nav class="drawer-body">
					<div class="link-group">
						{#each menuItems as item (item.href)}
							<a
								href={item.href}
								class="drawer-link"
								class:active={page.url.pathname === item.href}
								onclick={handleMenuClick}
							>
								<span>{item.label}</span>
								<span class="chev">→</span>
							</a>
						{/each}
					</div>

					{#if courses.length}
						<p class="drawer-label">Courses</p>
						<div class="link-group">
							{#each courses as course (course.id)}
								
								<a	href={`/courses/${course.id}`}
									class="drawer-course"
									onclick={handleMenuClick}
								>
									<span class="course-name">{course.name}</span>
									{#if priceLabel(course)}
										<span class="course-price">{priceLabel(course)}</span>
									{/if}
								</a>
							{/each}
						</div>
					{/if}
				</nav>

				<!-- Footer / CTA -->
				<div class="drawer-foot">
					<a href="/courses" class="cta" onclick={handleMenuClick}>Start Your Career</a>
					<p class="copyright">D&D Barber & Academy © {new Date().getFullYear()}</p>
				</div>
			</div>
		</SheetContent>
	</Sheet>
</div>

<style>
	.brand {
		display: flex;
		align-items: center;
		gap: 16px;
	}
	.brand-mark {
		width: 58px;
		height: 58px;
		border-radius: 50%;
		border: 2px solid var(--gold);
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #0f0e00 0%, #1c1900 100%);
		box-shadow: 0 0 24px rgba(212, 175, 55, 0.18);
		font-family: var(--fh);
		font-size: 22px;
		letter-spacing: 1px;
		color: var(--gold);
		flex-shrink: 0;
	}
	.brand-copy h1 {
		font-family: var(--fh);
		font-size: 26px;
		letter-spacing: 3px;
		line-height: 1;
		background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.brand-copy p {
		margin-top: 6px;
		color: var(--grey);
		font-size: 11px;
		letter-spacing: 3px;
		text-transform: uppercase;
	}

	/* Compact brand — mobile top bar */
	.brand--sm {
		gap: 10px;
	}
	.brand--sm .brand-mark {
		width: 42px;
		height: 42px;
		font-size: 16px;
		box-shadow: 0 0 16px rgba(212, 175, 55, 0.15);
	}
	.brand--sm .brand-copy h1 {
		font-size: 16px;
		letter-spacing: 1.5px;
	}

	/* Stacked brand — drawer header */
	.brand--stack {
		flex-direction: column;
		gap: 12px;
		text-align: center;
	}
	.brand--stack .brand-copy h1 {
		font-size: 20px;
		letter-spacing: 2px;
	}

	/* ============ MOBILE DRAWER ============ */
	.drawer {
		height: 100%;
		display: flex;
		flex-direction: column;
		background: radial-gradient(120% 80% at 50% 0%, #16140a 0%, #0b0a06 55%, #080705 100%);
		color: #efeadb;
	}

	.drawer-head {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 40px 20px 28px;
		border-bottom: 1px solid rgba(212, 175, 55, 0.16);
	}

	.drawer-close {
		position: absolute;
		top: 16px;
		right: 16px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 1px solid rgba(212, 175, 55, 0.25);
		background: rgba(212, 175, 55, 0.06);
		color: var(--gold);
		transition: background 0.2s ease, transform 0.15s ease;
	}
	.drawer-close:hover {
		background: rgba(212, 175, 55, 0.14);
	}
	.drawer-close:active {
		transform: scale(0.94);
	}

	.drawer-body {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: 20px 16px;
		-webkit-overflow-scrolling: touch;
	}

	.link-group {
		display: flex;
		flex-direction: column;
	}

	.drawer-link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 14px;
		border-radius: 12px;
		font-family: var(--fh);
		font-size: 17px;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: #efeadb;
		transition: background 0.2s ease, color 0.2s ease;
	}
	.drawer-link .chev {
		color: var(--gold);
		opacity: 0.55;
		transform: translateX(-4px);
		transition: transform 0.2s ease, opacity 0.2s ease;
	}
	.drawer-link:hover,
	.drawer-link:active {
		background: rgba(212, 175, 55, 0.08);
	}
	.drawer-link:hover .chev {
		opacity: 1;
		transform: translateX(0);
	}
	.drawer-link.active {
		color: var(--gold);
		background: rgba(212, 175, 55, 0.1);
	}
	.drawer-link.active .chev {
		opacity: 1;
		transform: translateX(0);
	}

	.drawer-label {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 24px 14px 12px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: var(--gold);
		opacity: 0.75;
	}
	.drawer-label::after {
		content: '';
		flex: 1;
		height: 1px;
		background: linear-gradient(90deg, rgba(212, 175, 55, 0.35), transparent);
	}

	.drawer-course {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 15px 14px;
		border-radius: 12px;
		border: 1px solid transparent;
		transition: background 0.2s ease, border-color 0.2s ease;
	}
	.drawer-course + .drawer-course {
		margin-top: 2px;
	}
	.drawer-course:hover,
	.drawer-course:active {
		background: rgba(255, 255, 255, 0.03);
		border-color: rgba(212, 175, 55, 0.18);
	}
	.course-name {
		font-size: 15px;
		font-weight: 500;
		color: #e7e2d4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.course-price {
		flex-shrink: 0;
		font-family: var(--fh);
		font-size: 14px;
		letter-spacing: 1px;
		color: var(--gold);
	}

	.drawer-foot {
		padding: 18px 16px calc(20px + env(safe-area-inset-bottom));
		border-top: 1px solid rgba(212, 175, 55, 0.16);
		background: rgba(0, 0, 0, 0.25);
	}
	.cta {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 52px;
		border-radius: 12px;
		font-family: var(--fh);
		font-size: 14px;
		letter-spacing: 2.5px;
		text-transform: uppercase;
		color: #0b0a06;
		background: linear-gradient(90deg, var(--gold3), var(--gold), var(--gold2));
		box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
		transition: transform 0.15s ease, box-shadow 0.2s ease;
	}
	.cta:active {
		transform: translateY(1px);
		box-shadow: 0 4px 14px rgba(212, 175, 55, 0.2);
	}
	.copyright {
		margin-top: 14px;
		text-align: center;
		font-size: 11px;
		letter-spacing: 1px;
		color: var(--grey);
	}
</style>