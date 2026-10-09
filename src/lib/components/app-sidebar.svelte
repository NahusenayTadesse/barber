<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { bgGradient } from '$lib/global.svelte';
	import { navigation } from '$lib/dashboard-nav';

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
					<img src="/logo.webp" class="mt-4 h-16 w-16 justify-self-center" alt="Logo" />
				</a></Sidebar.GroupLabel
			>
			<Sidebar.GroupContent class="my-4">
				<NavMain items={navigation} />
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
</Sidebar.Root>
