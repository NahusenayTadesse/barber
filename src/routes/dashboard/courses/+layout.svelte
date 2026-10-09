<script>
	import { page } from '$app/state';
	import Button from '$lib/components/ui/button/button.svelte';
	// import DialogComp from "$lib/formComponents/DialogComp.svelte";
	// import AddCustomer from "$lib/forms/AddCustomer.svelte";
	import { Plus, Sheet } from '@lucide/svelte';
	let { children } = $props();
</script>

<div
	class="mb-6 grid grid-cols-2 gap-2 md:mb-8 md:flex md:flex-row md:items-center md:justify-start"
>
	<Button
		href="/dashboard/courses"
		variant={page.url.pathname === '/dashboard/courses' ? 'default' : 'outline'}
		><Sheet /> Courses</Button
	>
	<Button
		href="/dashboard/courses/add-course"
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
