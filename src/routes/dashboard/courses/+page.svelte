<script lang="ts">
	import { columns } from './columns';

	let { data } = $props();

	import DataTable from '$lib/components/Table/data-table.svelte';

	import { Frown, Plus } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import FilterMenu from '$lib/components/Table/FilterMenu.svelte';
	import { audienceLabels } from '$lib/courses';

	let filteredList = $derived(data?.productList);
</script>

<svelte:head>
	<title>Courses List</title>
</svelte:head>

{#if data.productList.length === 0}
	<div class="flex h-96 w-full flex-col items-center justify-center lg:w-5xl">
		<p class="mt-4 flex flex-row items-center gap-4 text-center text-2xl md:text-4xl">
			<Frown class="h-12 w-16  animate-bounce" />
			{data.audience
				? `No ${audienceLabels[data.audience].toLowerCase()} courses yet`
				: 'Courses List is Empty'}
		</p>
		<Button href="/dashboard/courses/add-course{data.audience ? `?for=${data.audience}` : ''}"
			><Plus />Add New Course</Button
		>
	</div>
{:else}
	<h2 class="my-4 text-lg md:text-2xl">
		{data.audience ? `${audienceLabels[data.audience]} Courses` : 'No of Courses'}: {data
			.productList?.length}
	</h2>

	<div class="mb-4 p-0 md:mt-8 md:pt-4 lg:w-full lg:p-0">
		<FilterMenu
			bind:filteredList
			data={data?.productList}
			filterKeys={['level', 'duration', 'basePrice', 'minPrice', 'status']}
		/>
		<DataTable data={filteredList} {columns} fileName="Courses List" />
	</div>
{/if}
