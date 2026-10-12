<script lang="ts">
	import { page } from '$app/state';
	import { Mars, Sheet, Venus } from '@lucide/svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { audienceParam } from '$lib/courses';

	/** Switches a list page between everything, men's (?for=men) and women's (?for=women). */
	let { href, noun }: { href: string; noun: string } = $props();

	const current = $derived(page.url.pathname === href ? audienceParam(page.url) : undefined);
	const tabs = $derived([
		{ audience: null, label: `All ${noun}`, icon: Sheet },
		{ audience: 'men', label: `Men's ${noun}`, icon: Mars },
		{ audience: 'women', label: `Women's ${noun}`, icon: Venus }
	] as const);
</script>

{#each tabs as tab (tab.label)}
	<Button
		href={tab.audience ? `${href}?for=${tab.audience}` : href}
		variant={current === tab.audience ? 'default' : 'outline'}
	>
		<tab.icon />
		{tab.label}
	</Button>
{/each}
