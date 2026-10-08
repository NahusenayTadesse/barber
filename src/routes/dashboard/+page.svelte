<script lang="ts">
	import {
		Users,
		MessageSquare,
		TrendingUp,
		Calendar,
		UserPlus,
		Award,
		BookText,
		Plus,
		CreditCard,
		BadgePercent,
		SprayCan,
		Images,
		Clock3,
		Mail,
		KeyRound,
		CircleHelp,
		Globe,
		ChevronRight,
		CircleCheck,
		TriangleAlert
	} from '@lucide/svelte';
	import type { Component } from 'svelte';
	import * as Card from '$lib/components/ui/card'; // Standard Shadcn-Svelte path

	let { data } = $props();

	let totalActivity = $derived(data.enrolmentResult[0]?.count + data.messageResult[0]?.count);

	type Link = { title: string; href: string; icon: Component; description?: string };

	const quickActions: (Link & { external?: boolean })[] = [
		{ title: 'Register Student', href: '/dashboard/enrollments?register', icon: UserPlus },
		{ title: 'Issue Certificate', href: '/dashboard/certificates?issue', icon: Award },
		{ title: 'Add Course', href: '/dashboard/courses/add-course', icon: Plus },
		{ title: 'Start a Discount', href: '/dashboard/discounts', icon: BadgePercent },
		{ title: 'Read Messages', href: '/dashboard/messages', icon: Mail },
		{ title: 'Opening Hours', href: '/dashboard/hours', icon: Clock3 },
		{ title: 'Add Gallery Photos', href: '/dashboard/gallery', icon: Images },
		{ title: 'View Website', href: '/', icon: Globe, external: true }
	];

	// Every dashboard section, grouped by what it's for
	const siteMap: { group: string; links: Link[] }[] = [
		{
			group: 'Students',
			links: [
				{
					title: 'Enrollments',
					href: '/dashboard/enrollments',
					icon: Users,
					description: 'Everyone on your courses. Register students and send payment links.'
				},
				{
					title: 'Certificates',
					href: '/dashboard/certificates',
					icon: Award,
					description: 'Issue, view, print and email certificates when students finish.'
				}
			]
		},
		{
			group: 'Courses & Pricing',
			links: [
				{
					title: 'All Courses',
					href: '/dashboard/courses',
					icon: BookText,
					description: 'Edit course details and prices, or hide a course from the website.'
				},
				{
					title: 'Add Course',
					href: '/dashboard/courses/add-course',
					icon: Plus,
					description: 'Put a new course on the website.'
				},
				{
					title: 'Payment Methods',
					href: '/dashboard/payment-methods',
					icon: CreditCard,
					description: 'Pay in full, instalments or deposit, and which courses offer each.'
				},
				{
					title: 'Discounts',
					href: '/dashboard/discounts',
					icon: BadgePercent,
					description: 'Run a percentage-off sale on chosen courses for set dates.'
				}
			]
		},
		{
			group: 'Website',
			links: [
				{
					title: 'Services',
					href: '/dashboard/services',
					icon: SprayCan,
					description: 'Barber services, prices and booking links.'
				},
				{
					title: 'Gallery',
					href: '/dashboard/gallery',
					icon: Images,
					description: 'The photos that scroll across the homepage.'
				},
				{
					title: 'Opening Hours',
					href: '/dashboard/hours',
					icon: Clock3,
					description: 'Weekly hours shown on the home, contact pages and footer.'
				}
			]
		},
		{
			group: 'Inbox & Account',
			links: [
				{
					title: 'Messages',
					href: '/dashboard/messages',
					icon: Mail,
					description: 'Enquiries sent through the website contact form.'
				},
				{
					title: 'Change Password',
					href: '/dashboard/change-password',
					icon: KeyRound,
					description: 'Update the password you sign in with.'
				},
				{
					title: 'Help',
					href: '/dashboard/help',
					icon: CircleHelp,
					description: 'Step-by-step guide to everything in the dashboard.'
				}
			]
		}
	];

	const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`;

	const attentionItems = $derived(
		[
			data.attention.unpaid > 0 && {
				text: `${plural(data.attention.unpaid, 'student')} still to pay`,
				action: 'Send payment links',
				href: '/dashboard/enrollments'
			},
			data.attention.paidWithoutCertificate > 0 && {
				text: `${plural(data.attention.paidWithoutCertificate, 'paid student')} without a certificate`,
				action: 'Issue certificates',
				href: '/dashboard/certificates?issue'
			},
			data.attention.coursesWithoutMethods.length > 0 && {
				text: `${plural(data.attention.coursesWithoutMethods.length, 'active course')} can't be paid for online: ${data.attention.coursesWithoutMethods.map((c) => c.name).join(', ')}`,
				action: 'Add payment methods',
				href: '/dashboard/payment-methods'
			},
			data.attention.recentMessages > 0 && {
				text: `${plural(data.attention.recentMessages, 'message')} in the last 7 days`,
				action: 'Read messages',
				href: '/dashboard/messages'
			}
		].filter((item) => item !== false)
	);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
		<div class="flex items-center space-x-2 text-sm text-muted-foreground">
			<Calendar class="h-4 w-4" />
			<span>Today, {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span
			>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		<Card.Root class="overflow-hidden transition-all hover:shadow-md">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">New Enrolments</Card.Title>
				<Users class="h-4 w-4 text-blue-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.enrolmentResult[0]?.count}</div>
				<p class="text-xs text-muted-foreground">
					<span class="inline-flex items-center font-medium text-emerald-500">
						<TrendingUp class="mr-1 h-3 w-3" />
						Active
					</span>
					{' '}students joined today
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root class="overflow-hidden transition-all hover:shadow-md">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Inquiries</Card.Title>
				<MessageSquare class="h-4 w-4 text-purple-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.messageResult[0]?.count}</div>
				<p class="text-xs text-muted-foreground">Contact form submissions</p>
			</Card.Content>
		</Card.Root>

		<Card.Root
			class="overflow-hidden border-primary/20 bg-primary/5 transition-all hover:shadow-md md:col-span-2 lg:col-span-1"
		>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Engagement</Card.Title>
				<TrendingUp class="h-4 w-4 text-primary" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-primary">{totalActivity}</div>
				<p class="text-xs text-muted-foreground">Combined interactions today</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
		<span><strong class="text-foreground">{data.totals.paidStudents}</strong> paid students</span>
		<span
			><strong class="text-foreground">{data.totals.certificates}</strong> certificates issued</span
		>
		<span
			><strong class="text-foreground">{data.totals.liveDiscounts}</strong>
			{data.totals.liveDiscounts === 1 ? 'discount' : 'discounts'} running</span
		>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
		<Card.Root>
			<Card.Header>
				<Card.Title>Needs attention</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if attentionItems.length}
					<ul class="divide-y">
						{#each attentionItems as item (item.href + item.text)}
							<li class="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
								<span class="flex items-start gap-2 text-sm">
									<TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
									{item.text}
								</span>
								<a
									href={item.href}
									class="inline-flex items-center text-sm font-medium text-primary hover:underline"
								>
									{item.action}
									<ChevronRight class="h-4 w-4" />
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="flex items-center gap-2 text-sm text-muted-foreground">
						<CircleCheck class="h-4 w-4 text-green-500" /> All caught up — nothing needs your attention.
					</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title>Quick actions</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
					{#each quickActions as action (action.href)}
						<a
							href={action.href}
							target={action.external ? '_blank' : undefined}
							rel={action.external ? 'noopener' : undefined}
							class="flex flex-col items-center gap-2 rounded-lg border p-3 text-center text-sm font-medium transition-colors hover:border-primary hover:bg-primary/5"
						>
							<action.icon class="h-5 w-5 text-primary" />
							{action.title}
						</a>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<section aria-labelledby="dashboard-map">
		<h3 id="dashboard-map" class="mb-1 text-xl font-semibold">Dashboard map</h3>
		<p class="mb-4 text-sm text-muted-foreground">
			Everything you can manage, and where to find it.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			{#each siteMap as { group, links } (group)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="text-sm tracking-wide text-muted-foreground uppercase"
							>{group}</Card.Title
						>
					</Card.Header>
					<Card.Content class="space-y-1">
						{#each links as link (link.href)}
							<a
								href={link.href}
								class="group flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-muted"
							>
								<span
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"
								>
									<link.icon class="h-4 w-4" />
								</span>
								<span class="min-w-0 flex-1">
									<span class="block font-medium">{link.title}</span>
									<span class="block text-xs text-muted-foreground">{link.description}</span>
								</span>
								<ChevronRight
									class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
								/>
							</a>
						{/each}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</section>
</div>
