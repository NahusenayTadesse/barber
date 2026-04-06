<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import Loading from '$lib/components/Loading.svelte';
	import { Frown } from '@lucide/svelte';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	let filteredList = $derived(data.customersList);
</script>

<svelte:head>
	<title>Enrollments List</title>
</svelte:head>

{#if data.customersList.length === 0}
	<div class="flex h-96 w-5xl items-center justify-center">
		<p class="justify-self-cente mt-4 flex flex-row gap-4 text-center text-4xl">
			<Frown class="h-12 w-16  animate-bounce" />
			No Enrolmentes added Yet
		</p>
	</div>
{:else}
	<h2 class="my-4 text-2xl">No of Enrollments: {data.customersList?.length}</h2>

	<FilterMenu
		data={data.customersList}
		bind:filteredList
		filterKeys={['status', 'course', 'paymentOption', 'enrolledAt']}
	/>

	<DataTable data={filteredList} {columns} fileName="Enrollments List" />
{/if}
