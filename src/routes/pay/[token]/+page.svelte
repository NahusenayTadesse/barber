<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Seo from '$lib/components/Seo.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	let { data, form } = $props();
	let paying = $state(false);

	// Back from Stripe without paying
	onMount(() => {
		if (page.url.searchParams.has('cancelled')) {
			toast.info('Payment cancelled — no money was taken. You can try again below.');
		}
	});
</script>

<Seo title="Complete Your Enrolment" noindex />

<div class="psec lg:mt-32!">
	<div class="pinner">
		{#if data.status === 'confirmed'}
			<h2 class="ptitle">Already <span class="g">paid</span></h2>
			<p class="psub">
				Thanks{data.firstName ? `, ${data.firstName}` : ''}. Your payment for
				<strong>{data.course}</strong> has already been received. There's nothing more to pay.
			</p>
		{:else if data.status === 'cancelled' || data.amount <= 0}
			<h2 class="ptitle">Link <span class="g">no longer active</span></h2>
			<p class="psub">
				This payment link can't be used any more. Please call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				> and we'll sort it out.
			</p>
		{:else}
			<h2 class="ptitle">Complete your <span class="g">enrolment</span></h2>
			<p class="psub">
				Hi {data.firstName}, your place on the <strong>{data.course}</strong> is reserved. Pay below to
				confirm it.
			</p>
			<div class="cob" style="margin-top:28px">
				<div class="csum">
					<div>
						<div class="clbl">Course</div>
						<div style="font-family:var(--fb);font-size:15px;font-weight:700;letter-spacing:1px">
							{data.course}
						</div>
						{#if data.paymentOption}
							<div style="font-size:13px;color:var(--grey);margin-top:4px">
								{data.paymentOption}
							</div>
						{/if}
					</div>
					<div style="text-align:right">
						<div class="clbl">Amount Due Today</div>
						<div class="cval">£ {data.amount}</div>
					</div>
				</div>
				{#if form?.message}
					<p style="color:#e5484d;margin:12px 0">{form.message}</p>
				{/if}
				<form
					method="post"
					action="?/pay"
					use:enhance={() => {
						paying = true;
						return async ({ update }) => {
							await update();
							paying = false;
						};
					}}
				>
					<button
						class="btn-gold"
						type="submit"
						disabled={paying}
						style="width:100%;padding:18px;font-size:14px"
					>
						{#if paying}
							<LoadingBtn name="Opening secure checkout..." />
						{:else}
							Pay £{data.amount} Securely →
						{/if}
					</button>
				</form>
				<div
					style="font-size:11px;color:var(--grey);text-align:center;margin-top:14px;line-height:1.7"
				>
					Secure card payment by Stripe<br />Questions? Call us on
					<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
						>020 3700 3997</a
					>
					or
					<a
						href="https://wa.me/447846119677"
						target="_blank"
						style="color:var(--gold);text-decoration:underline">WhatsApp us</a
					>
				</div>
			</div>
		{/if}
	</div>
</div>
