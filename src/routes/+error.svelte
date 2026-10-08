<script>
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<Seo title={`Error ${page.status}`} noindex />
<div class="flex h-screen w-screen flex-col items-center justify-center">
	<h1 class="text-5xl text-red-600">{page.status}</h1>

	<h3 class="font-head text-2xl text-red-600">{@html page.error?.message}</h3>

	<Button href="/">Back to Home</Button>
</div>
