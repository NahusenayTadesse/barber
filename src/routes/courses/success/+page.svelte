<script lang="ts">
	let { data } = $props();
	import Seo from '$lib/components/Seo.svelte';
</script>

<Seo title={data.paid ? 'Enrolment Confirmed' : 'Payment Processing'} noindex />

<div class="psec lg:mt-32!">
	<div class="pinner">
		{#if data.paid}
			<h2 class="ptitle">You're <span class="g">enrolled!</span></h2>
			<p class="psub">
				Thanks{data.firstName ? `, ${data.firstName}` : ''}. Your payment{data.amount
					? ` of £${data.amount}`
					: ''} for <strong>{data.course || 'your course'}</strong> has been received.
				{#if data.email}A receipt is on its way to {data.email}.{/if} We'll be in touch within 24 hours
				to confirm your start date.
			</p>
		{:else}
			<h2 class="ptitle">Payment <span class="g">processing</span></h2>
			<p class="psub">
				We haven't received confirmation of your payment yet. This usually takes a moment. If you
				don't hear from us within 24 hours, call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>.
			</p>
		{/if}
		<a class="btn-gold" href="/courses" style="display:inline-block;margin-top:24px"
			>Back to Courses</a
		>
	</div>
</div>
