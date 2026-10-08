<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { CheckCheck, X } from '@lucide/svelte';
	import { cn } from '$lib/utils.js';

	import { type Item } from '$lib/global.svelte';

	let { items = [], checkedValues = $bindable([]) }: { items: Item[]; checkedValues?: string[] } =
		$props();

	// Unique per instance, so several checkbox lists on one page don't share ids
	const uid = $props.id();

	const isChecked = (value: Item['value']) => checkedValues.includes(String(value));

	const toggle = (value: Item['value'], checked: boolean) => {
		const v = String(value);
		checkedValues = checked ? [...checkedValues, v] : checkedValues.filter((x) => x !== v);
	};

	const allChecked = $derived(items.length > 0 && checkedValues.length === items.length);

	function toggleSelectAll() {
		checkedValues = allChecked ? [] : items.map((item) => String(item.value));
	}
</script>

<div class="flex w-full flex-col gap-2">
	<div class="flex items-center justify-between gap-2">
		<span class="text-xs text-muted-foreground">
			{checkedValues.length} of {items.length} selected
		</span>
		<Button variant="ghost" size="sm" class="h-7 px-2 text-xs" onclick={toggleSelectAll}>
			{#if allChecked}
				<X class="size-3.5" /> Clear all
			{:else}
				<CheckCheck class="size-3.5" /> Select all
			{/if}
		</Button>
	</div>

	<div
		class={cn(
			'grid gap-2',
			items.length > 20 ? 'grid-cols-1 lg:grid-cols-3' : items.length > 6 ? 'sm:grid-cols-2' : ''
		)}
	>
		{#each items as item (item.value)}
			{@const id = `${uid}-${item.value}`}
			{@const checked = isChecked(item.value)}
			<label
				for={id}
				class={cn(
					'flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm transition-colors',
					checked ? 'border-primary bg-primary/10' : 'hover:bg-muted/50'
				)}
			>
				<Checkbox {id} {checked} onCheckedChange={(c) => toggle(item.value, c === true)} />
				<span class="leading-tight">{item.name}</span>
			</label>
		{/each}
	</div>
</div>
