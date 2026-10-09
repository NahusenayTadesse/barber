<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { Menu } from '@lucide/svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import { tabs, isActive } from '$lib/dashboard-nav';

	const sidebar = useSidebar();

	// Close the "More" drawer once a link in it has been followed
	afterNavigate(() => sidebar.setOpenMobile(false));

	// "More" is lit when the current page isn't one of the tabs
	const onTab = $derived(tabs.some((tab) => isActive(tab.url, page.url.pathname)));
</script>

<nav
	aria-label="Dashboard"
	class="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
>
	<ul class="grid grid-cols-5">
		{#each tabs as tab (tab.url)}
			{@const active = isActive(tab.url, page.url.pathname)}
			<li>
				<a
					href={tab.url}
					aria-current={active ? 'page' : undefined}
					class="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95
					{active ? 'text-primary' : 'text-muted-foreground'}"
				>
					<span
						class="flex h-7 w-12 items-center justify-center rounded-full transition-colors {active
							? 'bg-primary/15'
							: ''}"
					>
						<tab.icon class="size-5" />
					</span>
					{tab.title}
				</a>
			</li>
		{/each}
		<li>
			<button
				type="button"
				onclick={() => sidebar.setOpenMobile(true)}
				class="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors active:scale-95
				{!onTab || sidebar.openMobile ? 'text-primary' : 'text-muted-foreground'}"
			>
				<span
					class="flex h-7 w-12 items-center justify-center rounded-full transition-colors {!onTab ||
					sidebar.openMobile
						? 'bg-primary/15'
						: ''}"
				>
					<Menu class="size-5" />
				</span>
				More
			</button>
		</li>
	</ul>
</nav>
