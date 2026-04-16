<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Component } from 'svelte';
	import type { IconProps } from '@lucide/svelte';
	let {
		id,
		name,
		link,
		variant = 'ghost',
		target = '',
		tooltip,
		IconComp
	}: {
		id: string;
		name: string;
		variant?: 'ghost' | 'default' | 'secondary' | 'destructive';
		link: string;
		target?: string;
		tooltip?: string;
		IconComp?: Component<IconProps>;
	} = $props();
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { buttonVariants } from '../ui/button/index.js';
	import Button from '../ui/button/button.svelte';
</script>

<Tooltip.Provider>
	<Tooltip.Root>
		<Tooltip.Trigger class={buttonVariants({ variant: 'ghost' })}>
			{#snippet child({ props })}
				<Button
					{variant}
					href="{link}/{id}"
					{target}
					{...props}
					class="wrap-break-words flex flex-row items-start! justify-start! capitalize transition-all duration-600 ease-in-out hover:scale-110"
				>
					<IconComp />
					{name}
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Content class="left-0 justify-self-start">
			<p class="text-[13px]!">{tooltip ?? `See ${name}'s page`}</p>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>
