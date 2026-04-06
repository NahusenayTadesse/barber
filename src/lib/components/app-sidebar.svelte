<script lang="ts">
	import {
		Users,
		UserRoundCog,
		ChartArea,
		Mail,
		LayoutDashboard,
		Container,
		BookText,
		Banknote,
		Plus,
		Sheet,
		Loader,
		CircleCheckBig,
		OctagonMinus,
		ListOrdered,
		CookingPot,
		Cookie
	} from '@lucide/svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { bgGradient } from '$lib/global.svelte';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';

	import NavMain from './NavMain.svelte';

	const navigation = [
		{ title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
		{ title: 'Enrollments', url: '/dashboard/enrollments', icon: Users },

		{
			title: 'Courses',
			url: '/dashboard/courses',
			icon: BookText,
			items: [
				{ title: 'All Courses', url: '/dashboard/courses', icon: Sheet },
				{ title: 'Add Course', url: '/dashboard/courses/add-course', icon: Plus }
			]
		},

		{
			title: 'Messages',
			url: '/dashboard/messages',
			icon: Mail
		},

		{
			title: 'Admin Panel',
			url: '/dashboard/admin-panel',
			icon: UserRoundCog,
			items: [
				{ title: 'Users', url: '/dashboard/admin-panel/users', icon: Users },
				{ title: 'Roles', url: '/dashboard/admin-panel/roles', icon: Users }
			]
		}
	];

	let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	const on = 'bg-sidebar-primary text-sidebar-primary-foreground';
	const off = 'text-sidebar-foreground';

	const sidebar = useSidebar();

	// function closeSidebar() {
	// 	if (sidebar.isMobile) {
	// 		sidebar.setOpenMobile(false);
	// 	}
	// }
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Content
		class="z-9999! h-full
  overflow-y-scroll pt-4
  [scrollbar-color:#a3a3a3_transparent]
  [scrollbar-width:thin]
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
