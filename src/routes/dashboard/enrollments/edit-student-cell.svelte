<script lang="ts">
	import { Pencil } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	let {
		id,
		name,
		firstName,
		lastName,
		email,
		phone
	}: {
		id: number;
		name: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string | null;
	} = $props();

	let open = $state(false);
	let saving = $state(false);
</script>

<div class="flex items-center gap-1">
	<span>{name}</span>
	<DialogComp title="Edit" IconComp={Pencil} variant="ghost" bind:open>
		<form
			method="post"
			action="?/editStudent"
			class="flex w-full flex-col gap-4 p-4"
			use:enhance={() => {
				saving = true;
				return async ({ result, update }) => {
					saving = false;
					if (result.type === 'success') {
						toast.success(String(result.data?.message));
						open = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						toast.error(String(result.data?.message));
					} else if (result.type === 'error') {
						toast.error("The student's details couldn't be saved.");
					} else {
						await update();
					}
				};
			}}
		>
			<input type="hidden" name="enrolmentId" value={id} />
			<h3 class="text-lg font-semibold">Edit {name}'s details</h3>
			<p class="text-sm text-muted-foreground">
				Fix a mistake in the student's name, email or phone. Their course and payment don't change.
			</p>

			<div class="grid gap-4 sm:grid-cols-2">
				<div class="flex flex-col gap-2">
					<Label for="firstName-{id}">First Name</Label>
					<Input
						id="firstName-{id}"
						name="firstName"
						value={firstName}
						required
						minlength={2}
						maxlength={255}
					/>
				</div>
				<div class="flex flex-col gap-2">
					<Label for="lastName-{id}">Last Name</Label>
					<Input
						id="lastName-{id}"
						name="lastName"
						value={lastName}
						required
						minlength={2}
						maxlength={255}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-2">
				<Label for="email-{id}">Email</Label>
				<Input id="email-{id}" name="email" type="email" value={email} required maxlength={255} />
			</div>

			<div class="flex flex-col gap-2">
				<Label for="phone-{id}">Phone</Label>
				<Input id="phone-{id}" name="phone" type="tel" value={phone ?? ''} maxlength={15} />
			</div>

			<Button type="submit" disabled={saving}>
				{#if saving}
					<LoadingBtn name="Saving" />
				{:else}
					<Pencil class="h-4 w-4" /> Save Changes
				{/if}
			</Button>
		</form>
	</DialogComp>
</div>
