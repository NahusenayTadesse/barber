<script lang="ts">
	import Lightbox from './lightbox.svelte';

	let {
		images,
		title,
		bento = false
	}: { images: string[]; title: string; bento?: boolean } = $props();

	let lightboxOpen = $state(false);
	let currentIndex = $state(0);

	// Map of index → detected orientation
	let orientations = $state<Record<number, 'landscape' | 'portrait' | 'square'>>({});

	const onImageLoad = (e: Event, index: number) => {
		const img = e.target as HTMLImageElement;
		const ratio = img.naturalWidth / img.naturalHeight;
		orientations[index] = ratio > 1.2 ? 'landscape' : ratio < 0.8 ? 'portrait' : 'square';
	};

	// Assign bento spans based on detected orientation
	const getSpan = (index: number): [number, number] => {
		const o = orientations[index];
		if (o === 'landscape') return [2, 1]; // wide
		if (o === 'portrait') return [1, 2]; // tall
		return [1, 1]; // square / unknown
	};

	const openLightbox = (index: number) => {
		currentIndex = index;
		lightboxOpen = true;
	};
</script>

<div
	class={bento
		? 'grid auto-rows-[200px] grid-cols-3 gap-4'
		: 'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'}
>
	{#each images as image, index (index)}
		{@const [colSpan, rowSpan] = bento ? getSpan(index) : [1, 1]}
		<div
			class="group cursor-pointer overflow-hidden rounded-lg bg-secondary"
			style={bento ? `grid-column: span ${colSpan}; grid-row: span ${rowSpan}; ` : ''}
			role="button"
			tabindex="0"
			onclick={() => openLightbox(index)}
			onkeydown={(e) => e.key === 'Enter' && openLightbox(index)}
		>
			<img
				src="/files/{image}"
				alt="{title} gallery image"
				loading="lazy"
				class={bento
					? 'h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
					: 'h-64 w-full object-cover transition-transform duration-300 group-hover:scale-110'}
				onload={(e) => onImageLoad(e, index)}
			/>
		</div>
	{/each}
</div>

<Lightbox {images} {title} bind:isOpen={lightboxOpen} bind:currentIndex />
