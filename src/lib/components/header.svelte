<script lang="ts">
	import { page } from '$app/state';
	let isOpen = $state(false);

	const handleMenuClick = () => {
		isOpen = false;
	};

	import { MenuIcon, XIcon } from '@lucide/svelte';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';

	let menuItems = [
		{ label: 'Home', href: '/' },
		{ label: 'Courses', href: '/courses' },
		{ label: 'Barber Shop', href: '/barber-shop' },
		{ label: 'Contact', href: '/contact' }
	];
</script>

<div class="hidden lg:block">
	<nav>
		<!-- LEFT: Home + Courses -->
		<ul class="nav-left">
			<li>
				<a href="/" id="nav-home" class={page.url.pathname === '/' ? 'al' : ''}>Home </a>
			</li>
			<li>
				<a href="/courses" class={page.url.pathname === '/courses' ? 'al' : ''} id="nav-courses"
					>Courses</a
				>
			</li>
		</ul>

		<!-- CENTRE: Logo -->
		<!-- <a class="nav-logo" href="/">
			<div class="nav-oval"><span class="nav-oval-t">D&D</span></div>
			<div class="nav-nt">D&D Barber & Academy</div>
			<div class="nav-nb">London · Est. 69 · Barber Academy</div>
		</a> -->
		<a href="/" class="brand">
			<div class="brand-mark">D&D</div>
			<div class="brand-copy">
				<h1>D&D Barber & Academy</h1>
				<p>London · Barber Shop & Academy</p>
			</div>
		</a>

		<!-- RIGHT: Free Haircut + Start Your Career -->
		<ul class="nav-right">
			<li>
				<a
					href="/barber-shop"
					class={page.url.pathname === '/barber-shop' ? 'al' : ''}
					id="nav-freehaircut">Book a Haircut</a
				>
			</li>
			<li>
				<a href="contact" id="nav-contact" class={page.url.pathname === '/contact' ? 'al' : ''}
					>Contact</a
				>
			</li>
			<li><a href="/courses" class="nav-enrol">Start Your Career</a></li>
		</ul>

		<!-- <button class="ham" id="ham" onclick={toggleMenu} aria-label="toggle menu"
		><span></span><span></span><span></span></button
	> -->

		<div class="ham">
			<Sheet bind:open={isOpen}>
				<SheetTrigger>
					{#snippet child({ props: triggerProps })}
						<Button variant="default" size="icon" {...triggerProps}>
							{#if isOpen}
								<XIcon class="size-5" />
							{:else}
								<MenuIcon class="size-5" />
							{/if}
						</Button>
					{/snippet}
				</SheetTrigger>
				<SheetContent side="right" class="z-9999 w-70 pt-4">
					<div class="flex h-full flex-col">
						<div class="flex items-center justify-between border-b px-6 py-5">
							<div class="flex items-center gap-3">
								<img src="/logo.webp" alt="Logo" class="h-8 w-8 object-contain" />
								<span class="text-lg font-bold tracking-tight">D&D Barber & Academy</span>
							</div>
						</div>

						<div class="flex flex-col gap-1">
							{#each menuItems as item (item.href)}
								<Button
									variant="ghost"
									href={item.href}
									class="group relative flex h-12 w-full justify-start rounded-xl px-4 text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground"
									onclick={handleMenuClick}
								>
									<span class="flex items-center gap-3">
										{item.label}
									</span>

									<span class="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
										→
									</span>
								</Button>
							{/each}
						</div>

						<div class="mt-auto border-t p-4">
							<p class="text-center text-xs text-muted-foreground">
								DND Barber & Academy © {new Date().getFullYear()}
							</p>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	</nav>
</div>

<div class="flex flex-row items-center justify-between p-2 px-4 lg:hidden">
	<!-- <a href="/">
		<img src="/logo.webp" class=" h-16 w-16" alt="Logo" />
	</a> -->

	<a href="/" class="brand flex w-full! flex-row items-center justify-center">
		<div class="brand-mark">D&D</div>
		<div class="brand-copy scale-80 items-center text-center">
			<h1>D&D Barber & Academy</h1>
			<p>London · Barber Shop & Academy</p>
		</div>
	</a>
	<Sheet bind:open={isOpen}>
		<SheetTrigger>
			{#snippet child({ props: triggerProps })}
				<Button variant="default" size="icon" {...triggerProps}>
					{#if isOpen}
						<XIcon class="size-5" />
					{:else}
						<MenuIcon class="size-5" />
					{/if}
				</Button>
			{/snippet}
		</SheetTrigger>
		<SheetContent side="right" class="z-9999 w-70 pt-4">
			<div class="flex h-full flex-col pt-8">
				<!-- <div class="flex items-center justify-between border-b px-6 py-5">
					<div class="flex items-center gap-3">
						<img src="/logo.webp" alt="Logo" class="h-8 w-8 object-contain" />
						<span class="text-lg font-bold tracking-tight">D&D Barber & Academy</span>
					</div>
				</div> -->

				<a href="/" class="brand flex w-full! flex-col items-center justify-center">
					<div class="brand-mark">D&D</div>
					<div class="brand-copy items-center text-center">
						<h1>D&D Barber & Academy</h1>
						<p>London · Barber Shop & Academy</p>
					</div>
				</a>

				<div class="flex flex-col gap-1">
					{#each menuItems as item (item.href)}
						<Button
							variant="ghost"
							href={item.href}
							class="group relative flex h-12 w-full justify-start rounded-xl px-4 text-base font-medium transition-all hover:bg-accent hover:text-accent-foreground"
							onclick={handleMenuClick}
						>
							<span class="flex items-center gap-3">
								{item.label}
							</span>

							<span class="ml-auto opacity-0 transition-opacity group-hover:opacity-100"> → </span>
						</Button>
					{/each}
				</div>

				<div class="mt-auto border-t p-4">
					<p class="text-center text-xs text-muted-foreground">
						DND Barber & Academy © {new Date().getFullYear()}
					</p>
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
</style>
