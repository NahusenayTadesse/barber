<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown } from '@lucide/svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import RegisterStudent from './register-student.svelte';
	import NotificationEmails from './notification-emails.svelte';
	import { audienceLabels } from '$lib/courses';
	let filteredList = $derived(data.customersList);
</script>

<svelte:head>
	<title>Enrollments List</title>
</svelte:head>

<div class="mb-6 flex flex-wrap items-center gap-2">
	<RegisterStudent data={data.form} coursesList={data.coursesList} canEmail={data.canEmail} />
	<NotificationEmails always={data.notifications.always} saved={data.notifications.saved} />
</div>

{#if data.customersList.length === 0}
	<div class="flex h-96 w-full items-center justify-center lg:w-5xl">
		<p class="mt-4 flex flex-row items-center gap-4 text-center text-2xl md:text-4xl">
			<Frown class="h-12 w-16  animate-bounce" />
			{data.audience
				? `No students on ${audienceLabels[data.audience].toLowerCase()} courses yet`
				: 'No Enrolmentes added Yet'}
		</p>
	</div>
{:else}
	<h2 class="my-4 text-lg md:text-2xl">
		{data.audience ? `${audienceLabels[data.audience]} Students` : 'No of Enrollments'}: {data
			.customersList?.length}
	</h2>

	<FilterMenu
		data={data.customersList}
		bind:filteredList
		filterKeys={[
			'status',
			'paidBy',
			'audience',
			'course',
			'paymentOption',
			'discount',
			'enrolledAt'
		]}
	/>

	<!-- Rebuilt when the list changes, so a newly registered student shows up on the same page -->
	{#key data.customersList}
		<DataTable data={filteredList} {columns} fileName="Enrollments List" />
	{/key}
{/if}
