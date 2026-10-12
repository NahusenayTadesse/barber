<script lang="ts">
	import { page } from '$app/state';
	import { MenuIcon, XIcon } from '@lucide/svelte';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import ScrollArea from './ui/scroll-area/scroll-area.svelte';
	import { audienceLabels, audiences, type Audience } from '$lib/courses';

	// Only the fields the menu needs. Keep secureFields out of what you pass in.
	type Course = {
		id: number;
		name: string;
		basePrice: string; // decimal() comes back as a string
		minPrice?: string | null;
		minPriceMessage?: string | null;
		audience: Audience;
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

	// Men's courses, then women's; empty groups are left out
	const courseGroups = $derived(
		audiences
			.map((audience) => ({
				audience,
				courses: courses.filter((c) => c.audience === audience)
			}))
			.filter((g) => g.courses.length)
	);

	const onCoursePage = $derived(page.url.pathname.startsWith('/courses/'));
</script>

{#snippet drawerLink(label: string, href: string)}
	<a {href} class="drawer-link" class:active={page.url.pathname === href} onclick={handleMenuClick}>
		<span>{label}</span>
		<span class="chev">→</span>
	</a>
{/snippet}

<!-- ============ DESKTOP ============ -->
<div class="hidden lg:block">
	<nav class="site-nav">
		<!-- LEFT: Home + Contact -->
		<ul class="nav-left">
			<li>
				<a href="/courses" id="nav-home" class={page.url.pathname === '/courses' ? 'al' : ''}
					>Home</a
				>
			</li>
			<li class="nav-drop">
				<a href="/courses#courses" id="nav-courses" class={onCoursePage ? 'al' : ''}
					>Courses <span class="caret">▾</span></a
				>
				{#if courseGroups.length}
					<div class="drop-panel">
						{#each courseGroups as g (g.audience)}
							<div class="drop-col">
								<p class="drop-label">{audienceLabels[g.audience]}</p>
								{#each g.courses as course (course.id)}
									<a
										href={`/courses/${course.id}`}
										class="drop-link"
										class:active={page.url.pathname === `/courses/${course.id}`}>{course.name}</a
									>
								{/each}
							</div>
						{/each}
					</div>
				{/if}
			</li>
			<li>
				<a href="/contact" id="nav-contact" class={page.url.pathname === '/contact' ? 'al' : ''}
					>Contact</a
				>
			</li>
		</ul>

		<!-- CENTRE: Logo -->
		<a href="/" class="brand">
			<img src="/logo.webp?v=2" alt="D&D Barber Academy logo" class="brand-mark" />
			<div class="brand-copy">
				<h1>D&D Barber Academy</h1>
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
<div class="sticky top-0 z-9999 flex items-center justify-between bg-black px-4 py-3 lg:hidden">
	<!-- Compact brand, left-aligned -->
	<a href="/" class="brand brand--sm">
		<img src="/logo.webp?v=2" alt="D&D Barber Academy logo" class="brand-mark" />
		<div class="brand-copy">
			<h1>D&D Barber Academy</h1>
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
			class="drawer-content z-9999 border-0 p-0 sm:max-w-sm [&>button]:hidden"
		>
			<div class="drawer">
				<!-- Brand header -->
				<div class="drawer-head">
					<a href="/" class="brand brand--stack" onclick={handleMenuClick}>
						<img src="/logo.webp?v=2" alt="D&D Barber Academy logo" class="brand-mark" />
						<div class="brand-copy">
							<h1>D&D Barber Academy</h1>
						</div>
					</a>
					<button class="drawer-close" aria-label="Close menu" onclick={handleMenuClick}>
						<XIcon class="size-5" />
					</button>
				</div>
				<ScrollArea orientation="vertical" class="h-85">
					<!-- Scrollable body -->

					<div class="link-group">
						{@render drawerLink('Home', '/courses')}
					</div>

					{#each courseGroups as g (g.audience)}
						<p class="drawer-label">{audienceLabels[g.audience]} Courses</p>
						<div class="link-group">
							{#each g.courses as course (course.id)}
								<a
									href={`/courses/${course.id}`}
									class="drawer-course"
									class:active={page.url.pathname === `/courses/${course.id}`}
									onclick={handleMenuClick}
								>
									<span class="course-price">{course.name}</span>
								</a>
							{/each}
						</div>
					{/each}

					<div class="link-group drawer-after">
						{@render drawerLink('Contact', '/contact')}
					</div>
				</ScrollArea>

				<!-- Footer / CTA -->
				<div class="drawer-foot">
					<a href="/courses" class="cta" onclick={handleMenuClick}>Start Your Career</a>
					<p class="copyright">D&D Barber Academy © {new Date().getFullYear()}</p>
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
		width: 64px;
		height: 64px;
		object-fit: contain;
		filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.25));
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
		width: 46px;
		height: 46px;
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
		transition:
			background 0.2s ease,
			transform 0.15s ease;
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
		font-size: 18px;
		letter-spacing: 2px;
		text-transform: uppercase;
		color: #efeadb;
		transition:
			background 0.2s ease,
			color 0.2s ease;
	}
	.drawer-link .chev {
		color: var(--gold);
		opacity: 0.55;
		transform: translateX(-4px);
		transition:
			transform 0.2s ease,
			opacity 0.2s ease;
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
		transition:
			background 0.2s ease,
			border-color 0.2s ease;
		max-width: 80%;
		font-size: 8px !important;
	}
	.drawer-course .text {
		white-space: normal;
		overflow-wrap: break-word;
		word-break: break-word;
		flex: 1;
		min-width: 0; /* Important for flex items */
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
		font-size: 12px;
		font-weight: 500;
		color: #e7e2d4;
		text-overflow: ellipsis;
	}
	.course-price {
		flex-shrink: 0;
		font-family: var(--fh);
		font-size: 14px;
		letter-spacing: 1px;
		color: var(--gold);
	}

	.drawer-course.active {
		background: rgba(212, 175, 55, 0.1);
		border-color: rgba(212, 175, 55, 0.25);
	}
	.drawer-after {
		margin-top: 20px;
	}

	/* ============ DESKTOP COURSES DROPDOWN ============ */
	.nav-drop {
		position: relative;
	}
	.caret {
		font-size: 9px;
		margin-left: 2px;
	}
	.drop-panel {
		position: absolute;
		top: 100%;
		left: 0;
		display: flex;
		gap: 28px;
		min-width: 420px;
		padding: 20px 22px;
		margin-top: 18px;
		background: rgba(8, 8, 8, 0.98);
		border: 1px solid rgba(212, 175, 55, 0.2);
		box-shadow: 0 18px 40px rgba(0, 0, 0, 0.6);
		opacity: 0;
		visibility: hidden;
		transform: translateY(6px);
		transition:
			opacity 0.2s ease,
			transform 0.2s ease,
			visibility 0.2s;
	}
	/* Bridges the gap between the link and the panel so hover isn't lost */
	.drop-panel::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		top: -20px;
		height: 20px;
	}
	.nav-drop:hover .drop-panel,
	.nav-drop:focus-within .drop-panel {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
	}
	.drop-col {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}
	.drop-label {
		margin-bottom: 8px;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: var(--gold);
	}
	.nav-drop .drop-link {
		padding: 7px 0;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.5px;
		text-transform: none;
		white-space: normal;
		color: #e7e2d4;
	}
	.nav-drop .drop-link::after {
		display: none;
	}
	.nav-drop .drop-link:hover,
	.nav-drop .drop-link.active {
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
		transition:
			transform 0.15s ease,
			box-shadow 0.2s ease;
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
