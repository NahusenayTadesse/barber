<script lang="ts">
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { edit } from './schema.js';
	import { superForm } from 'sveltekit-superforms/client';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Clock3, Save } from '@lucide/svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import FormCard from '$lib/formComponents/FormCard.svelte';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const { form, errors, enhance, delayed, message } = superForm(data.form, {
		validators: zod4Client(edit),
		dataType: 'json'
	});

	$effect(() => {
		if ($message) {
			if ($message.type === 'error') {
				toast.error($message.text);
			} else {
				toast.success($message.text);
			}
		}
	});
</script>

<svelte:head>
	<title>Opening Hours</title>
</svelte:head>

<main class="container mx-auto w-full! space-y-8 p-4">
	<div class="border-b pb-4">
		<h1 class="text-3xl font-bold tracking-tight">Opening Hours</h1>
		<p class="text-muted-foreground">
			Controls the hours shown across the site (home, footer, contact page). Keep this in sync
			with the Google Business Profile.
		</p>
	</div>

	<section class="space-y-4 lg:col-span-7">
		<div class="flex items-center gap-2 text-lg font-semibold">
			<Clock3 class="h-5 w-5 text-primary" />
			<h2>Weekly Schedule</h2>
		</div>

		<FormCard title="Days & Hours" className="w-full shadow-sm border">
			<form method="post" use:enhance class="flex w-full flex-col gap-3">
				{#each $form.days as day, i (day.dayOfWeek)}
					<div
						class="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:gap-4"
					>
						<div class="w-28 shrink-0 font-medium">{day.dayLabel}</div>

						<div class="flex items-center gap-2">
							<Checkbox id="closed-{i}" bind:checked={$form.days[i].isClosed} />
							<Label for="closed-{i}" class="text-sm">Closed</Label>
						</div>

						{#if !day.isClosed}
							<div class="flex flex-1 flex-wrap items-center gap-2">
								<Label for="opens-{i}" class="text-muted-foreground text-xs">Opens</Label>
								<Input
									id="opens-{i}"
									class="w-24"
									placeholder="e.g. 9AM"
									bind:value={$form.days[i].opensLabel}
								/>
								<Label for="closes-{i}" class="text-muted-foreground text-xs">Closes</Label>
								<Input
									id="closes-{i}"
									class="w-24"
									placeholder="e.g. 6PM"
									bind:value={$form.days[i].closesLabel}
								/>
							</div>
						{/if}

						{#if $errors.days?.[i]}
							<p class="text-sm text-red-500">
								{Object.values($errors.days[i]).flat().join(', ')}
							</p>
						{/if}
					</div>
				{/each}

				<div class="flex justify-end pt-2">
					<Button type="submit" class="w-full px-8 sm:w-auto" size="lg">
						{#if $delayed}
							<LoadingBtn name="Saving Changes..." />
						{:else}
							<Save class="mr-2 h-4 w-4" /> Save Hours
						{/if}
					</Button>
				</div>
			</form>
		</FormCard>
	</section>
</main>
