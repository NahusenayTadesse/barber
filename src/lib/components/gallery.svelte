<script lang="ts">
	import Lightbox from './lightbox.svelte';

	let {
		images,
		title,
		bento = false
	}: { images: string[]; title: string; bento?: boolean } = $props();

	let lightboxOpen = $state(false);
	let currentIndex = $state(0);

	type Orientation = 'landscape' | 'portrait' | 'square';
	type Status = 'loading' | 'loaded' | 'error';

	// Keyed by image path (not index) so state survives list changes
	// and is shared correctly across duplicate images.
	let orientation = $state<Record<string, Orientation>>({});
	let status = $state<Record<string, Status>>({});

	// Svelte action that resolves reliably even when the browser serves the
	// image from cache — in that case `load` can fire before a listener attaches,
	// so we check `node.complete` synchronously instead of only waiting on events.
	function track(node: HTMLImageElement, key: string) {
		const onLoad = () => {
			const ratio = node.naturalWidth / node.naturalHeight;
			orientation[key] = ratio > 1.2 ? 'landscape' : ratio < 0.8 ? 'portrait' : 'square';
			status[key] = 'loaded';
		};
		const onError = () => (status[key] = 'error');

		if (node.complete) {
			node.naturalWidth > 0 ? onLoad() : onError();
		} else {
			status[key] = 'loading';
			node.addEventListener('load', onLoad);
			node.addEventListener('error', onError);
		}

		return {
			destroy() {
				node.removeEventListener('load', onLoad);
				node.removeEventListener('error', onError);
			}
		};
	}

	// Bento spans, derived from the detected orientation.
	// Inline styles avoid any Tailwind purge surprises on dynamic span classes.
	const spanStyle = (key: string): string => {
		if (!bento) return '';
		const o = orientation[key];
		if (o === 'landscape') return 'grid-column: span 2; grid-row: span 1;';
		if (o === 'portrait') return 'grid-column: span 1; grid-row: span 2;';
		return 'grid-column: span 1; grid-row: span 1;';
	};

	const openLightbox = (index: number) => {
		currentIndex = index;
		lightboxOpen = true;
	};
</script>

<div
	class={bento
		? 'grid auto-rows-[200px] grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'
		: 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
>
	{#each images as image, index (image)}
		<button
			type="button"
			onclick={() => openLightbox(index)}
			style={spanStyle(image)}
			aria-label={`View image ${index + 1} of ${images.length} from ${title}`}
			class="group relative block overflow-hidden rounded-xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
		>
			{#if status[image] === 'error'}
				<div
					class="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
						<rect width="18" height="18" x="3" y="3" rx="2" />
						<path d="m3 16 5-5 4 4" />
						<path d="m21 21-6-6" />
						<circle cx="9" cy="9" r="1.5" />
					</svg>
					<span class="text-xs">Image unavailable</span>
				</div>
			{:else}
				{#if status[image] !== 'loaded'}
					<div class="absolute inset-0 animate-pulse bg-muted-foreground/10"></div>
				{/if}
				<img
					src={`/files/${image}`}
					alt={`${title} — image ${index + 1}`}
					use:track={image}
					loading={index < 4 ? 'eager' : 'lazy'}
					decoding="async"
					class={`w-full object-cover transition duration-500 ease-out ${bento ? 'h-full' : 'h-64'} ${
						status[image] === 'loaded' ? 'opacity-100' : 'opacity-0'
					} motion-safe:group-hover:scale-105`}
				/>
				<div
					class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100"
				>
					<span class="rounded-full bg-white/90 p-2 text-black shadow-lg">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<circle cx="11" cy="11" r="8" />
							<path d="m21 21-4.3-4.3" />
							<path d="M11 8v6" />
							<path d="M8 11h6" />
						</svg>
					</span>
				</div>
			{/if}
		</button>
	{/each}
</div>

<Lightbox {images} {title} bind:isOpen={lightboxOpen} bind:currentIndex />