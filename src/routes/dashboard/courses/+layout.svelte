<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	// import DialogComp from "$lib/formComponents/DialogComp.svelte";
	// import AddCustomer from "$lib/forms/AddCustomer.svelte";
	import { Plus } from '@lucide/svelte';
	import AudienceTabs from '$lib/components/AudienceTabs.svelte';
	import { audienceParam } from '$lib/courses';
	let { children } = $props();
</script>

<div
	class="mb-6 grid grid-cols-2 gap-2 md:mb-8 md:flex md:flex-row md:items-center md:justify-start"
>
	<AudienceTabs href="/dashboard/courses" noun="Courses" />
	<Button
		href="/dashboard/courses/add-course{audienceParam(page.url)
			? `?for=${audienceParam(page.url)}`
			: ''}"
		variant={page.url.pathname === '/dashboard/courses/add-course' ? 'default' : 'outline'}
		><Plus /> Add Courses</Button
	>

	<!-- <Button
		href="/dashboard/products/categories"
		variant={page.url.pathname === '/dashboard/products/categories' ? 'default' : 'outline'}
		><Sheet /> Categories</Button /> -->
	<!-- <Button
		href="/dashboard/products/suppliers"
		variant={page.url.pathname === '/dashboard/products/suppliers' ? 'default' : 'outline'}
		><Sheet /> Prices</Button
	> -->
</div>

{@render children?.()}
