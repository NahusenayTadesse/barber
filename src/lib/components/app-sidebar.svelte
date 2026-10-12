<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { bgGradient } from '$lib/global.svelte';
	import { navigation } from '$lib/dashboard-nav';
	import { dashboardApp } from '$lib/pwa.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Download } from '@lucide/svelte';

	import NavMain from './NavMain.svelte';

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Content
		class="z-9999! h-full
  [scrollbar-width:thin] [scrollbar-color:#a3a3a3_transparent]
  overflow-y-scroll
  pt-4
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-thumb]:bg-gray-400
  [&::-webkit-scrollbar-thumb:hover]:bg-gray-500 [&::-webkit-scrollbar-track]:bg-transparent
  {bgGradient}
"
	>
		<Sidebar.Group>
			<Sidebar.GroupLabel>
				<a
					class="mb-8 flex flex-row items-start justify-start gap-4 py-4"
					href="/"
					title="Go to Website Home Page"
					target="_blank"
				>
					<img src="/logo.webp?v=2" class="mt-4 h-16 w-16 justify-self-center" alt="Logo" />
				</a></Sidebar.GroupLabel
			>
			<Sidebar.GroupContent class="my-4">
				<NavMain items={navigation} />
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	{#if dashboardApp.installable}
		<Sidebar.Footer class="border-t p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
			<Button class="w-full rounded-full" onclick={() => dashboardApp.install()}>
				<Download /> Install dashboard app
			</Button>
		</Sidebar.Footer>
	{/if}
</Sidebar.Root>
