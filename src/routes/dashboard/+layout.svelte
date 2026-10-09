<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/app-sidebar.svelte';
	import AvatarSettings from '$lib/components/AvatarSettings.svelte';
	import BottomMenu from '$lib/components/bottomMenu.svelte';
	import { page } from '$app/state';
	import { pageTitle } from '$lib/dashboard-nav';

	let { children, data } = $props();

	const title = $derived(pageTitle(page.url.pathname));

	// Lets app.css restyle dialogs (which render outside this layout) as phone bottom sheets
	$effect(() => {
		document.documentElement.dataset.app = 'dashboard';
		return () => delete document.documentElement.dataset.app;
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<!-- Lets the app bars reach under the notch / home indicator; padded back with safe-area insets -->
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
	<meta name="theme-color" content="#0c0c0c" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
</svelte:head>

<Sidebar.Provider>
	<AppSidebar />
	<main class="flex min-h-dvh w-full min-w-0 flex-col">
		<header
			class="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/85 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl"
		>
			<div class="flex h-14 w-full items-center gap-3">
				<Sidebar.Trigger class="hidden rounded-lg md:inline-flex" />
				<a href="/dashboard" class="shrink-0 md:hidden" aria-label="Dashboard home">
					<img src="/logo.webp" alt="" class="h-8 w-8" />
				</a>
				<h1 class="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight">{title}</h1>
				<AvatarSettings data={data?.name} />
			</div>
		</header>
		<div
			class="w-full min-w-0 flex-1 px-4 pt-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:px-6 md:pb-8"
		>
			{@render children?.()}
		</div>
	</main>
	<BottomMenu />
</Sidebar.Provider>
