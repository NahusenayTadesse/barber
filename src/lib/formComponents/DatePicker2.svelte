<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';
	import { CalendarDate, getLocalTimeZone, today, parseDate } from '@internationalized/date';
	import { CalendarIcon } from '@lucide/svelte';

	let {
		data = $bindable(),
		oldDays = false,
		year = false,
		futureDays = false
	}: {
		data: string;
		oldDays?: boolean;
		year?: boolean;
		futureDays?: boolean;
	} = $props();

	const todayDate = $derived(oldDays ? undefined : today(getLocalTimeZone()));

	let form = $state(
		parseDate(data || todayDate?.toString() || new Date().toISOString().split('T')[0])
	);

	$effect(() => {
		data = form.toString();
	});

	const formatDate = (date: CalendarDate | undefined): string => {
		if (!date) return '';

		return new Intl.DateTimeFormat('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date.toDate(getLocalTimeZone()));
	};
	const displayDate = $derived(form ? formatDate(form) : formatDate(todayDate));
</script>

<Popover.Root>
	<Popover.Trigger
		class={cn(
			buttonVariants({
				variant: 'outline',
				class: 'justify-between '
			}),
			!form && 'text-muted-foreground'
		)}
	>
		<div class="flex items-center gap-2">
			<CalendarIcon />
			{displayDate}
		</div>
	</Popover.Trigger>

	<Popover.Content class="w-auto p-0">
		<Calendar
			locale="en-GB"
			type="single"
			captionLayout={year ? 'dropdown-years' : 'label'}
			minValue={todayDate}
			maxValue={futureDays ? today(getLocalTimeZone()) : undefined}
			bind:value={form}
		/>
	</Popover.Content>
</Popover.Root>
