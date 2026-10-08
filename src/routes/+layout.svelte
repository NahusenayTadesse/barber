<script lang="ts">
	import './layout.css';
	import bebasNeueWoff2 from '@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff2?url';
	import { getFlash } from 'sveltekit-flash-message';
	import { page, updated } from '$app/state';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';

	const flash = getFlash(page, { clearAfterMs: 5000 });

	import { toast } from 'svelte-sonner';

	async function notifyBrowser(title: string, body: string) {
		if (!('Notification' in window)) return; // Safari iOS etc.
		if (Notification.permission === 'granted') {
			new Notification(title, { body, icon: '/logo.png' });
		} else if (Notification.permission !== 'denied') {
			const perm = await Notification.requestPermission();
			if (perm === 'granted') new Notification(title, { body, icon: '/logo.png' });
		}
	}
	import Header from '$lib/components/header.svelte';
	import Footer from '$lib/components/footer.svelte';
	import Floating from '$lib/components/WhatsAppFloat.svelte';
	import DiscountPopup from '$lib/components/DiscountPopup.svelte';

	// This initializes the class and puts it into Svelte's context

	let { data, children } = $props();

	// async function requestNotificationPermission() {
	// 	if (!('Notification' in window)) return;
	// 	await Notification.requestPermission();
	// }

	// let iconify = $state('h-6 w-6 animate-ping');

	$effect(() => {
		if (!$flash) return;
		if (page.data.flash?.type === 'success') toast.success($flash.message);
		if (page.data.flash?.type === 'error') toast.error($flash?.message);
		if (Notification.permission === 'granted') {
			notifyBrowser(
				page.data.flash?.type === 'success'
					? 'Success'
					: page.data.flash?.type === 'error'
						? 'Error'
						: 'Message',
				$flash.message
			);
		}
		$flash = undefined;
	});
</script>

<svelte:head>
	<link rel="icon" href="/logo.jpeg" />
	<link rel="apple-touch-icon" href="/logo.jpeg" />
	<meta name="theme-color" content="#050505" />
	<link rel="preload" as="font" type="font/woff2" href={bebasNeueWoff2} crossorigin="anonymous" />
</svelte:head>

<Toaster position="bottom-right" richColors closeButton />

<ProgressBar color="#b8860b" zIndex={1000} />

{#if !page.url.pathname.startsWith('/dashboard') && page.url.pathname !== '/'}
	<!-- Not on the enrolment, payment or certificate pages, so it never interrupts checkout -->
	{#if data.bannerDiscount && !/^\/(courses|pay|certificates)\/.+/.test(page.url.pathname)}
		<DiscountPopup discount={data.bannerDiscount} />
	{/if}
	<Header courses={data?.courses} />
	<main>
		{@render children()}
	</main>

	<Footer courses={data?.courses} />
	<Floating />
{:else}
	{@render children()}
{/if}
