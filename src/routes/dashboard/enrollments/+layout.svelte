<script>
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import AddCustomer from '$lib/forms/AddCustomer.svelte';
	import AudienceTabs from '$lib/components/AudienceTabs.svelte';
	let { data, children } = $props();
</script>

<div
	class="mb-4 grid grid-cols-1 gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:justify-start md:mb-8"
>
	<AudienceTabs href="/dashboard/enrollments" noun="Students" />
	<!-- <DialogComp title="Add New Customer" variant="default">
		<AddCustomer data={data?.form} action="/dashboard/customers?/addCustomer" />
	</DialogComp> -->
</div>

{@render children?.()}
