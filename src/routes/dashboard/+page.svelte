<script lang="ts">
	import { Users, MessageSquare, TrendingUp, Calendar } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card'; // Standard Shadcn-Svelte path

	let { data } = $props();

	let totalActivity = $derived(data.enrolmentResult[0]?.count + data.messageResult[0]?.count);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="space-y-6">
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
</div>
