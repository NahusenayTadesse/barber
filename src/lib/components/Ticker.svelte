<script lang="ts">
	let { items }: { items: string[] } = $props();
</script>

<div class="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-light py-2.5 overflow-hidden whitespace-nowrap">
	<div class="inline-flex animate-ticker">
		{#each [...items, ...items] as item}
			<span class="font-display text-sm tracking-[4px] text-dark-100 px-7 before:content-['✦_']">{item}</span>
		{/each}
	</div>
</div>
