<script>
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	let { data } = $props();
	const { form, enhance, delayed, message, allErrors } = superForm(data.form, {
		dataType: 'json'
	});
	$effect(() => {
		if ($message) {
			if ($message.type === 'error') toast.error($message.text);
			else {
				toast.success($message.text);
			}
		}
	});
</script>

<svelte:head>
	<title>Free Haircut</title>
</svelte:head>
<div class="fhero">
	<div
		style="position:absolute;inset:0;background:radial-gradient(ellipse 50% 60% at 30% 50%,rgba(212,175,55,.06) 0%,transparent 70%)"
	></div>
	<div class="fhbig">FREE</div>
	<div class="fh-inner">
		<div class="fi">
			<div class="ey"><span>For the Community</span></div>
			<h1 class="hero-h1" style="font-size:clamp(68px,10vw,126px)">
				<div class="g">FREE</div>
				<div>HAIRCUT.</div>
			</h1>
			<p
				style="font-size:16px;color:rgba(240,237,228,.72);font-weight:300;max-width:420px;line-height:1.85;margin:20px 0 32px"
			>
				Our students learn on real people — and that means <strong style="color:var(--white)"
					>you get a free professional haircut</strong
				>, fully supervised by our lead tutor. Great cut, no catch, no cost.
			</p>
			<div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:36px">
				<button class="btn-gold">Book My Free Haircut</button>
				<a href="https://wa.me/442027799988" target="_blank" class="btn-out">Ask via WhatsApp</a>
			</div>
			<div>
				<div class="pstep">
					<div class="psn">01</div>
					<div>
						<div class="pst">Request Your Slot</div>
						<div class="psd">
							Fill in the form — tell us your preferred style and when you're free. Takes two
							minutes.
						</div>
					</div>
				</div>
				<div class="pstep">
					<div class="psn">02</div>
					<div>
						<div class="pst">We Confirm Within 24 Hours</div>
						<div class="psd">
							We'll text or WhatsApp you with a confirmed date, time and address.
						</div>
					</div>
				</div>
				<div class="pstep">
					<div class="psn">03</div>
					<div>
						<div class="pst">Come In, Leave Fresh</div>
						<div class="psd">
							Sit back and get a precise, professional cut — supervised by our tutor the entire
							time. Completely free.
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="fi" style="transition-delay:.2s" id="fhanchor">
			<div class="fhcard">
				<div
					style="font-family:var(--fb);font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:28px"
				>
					Book Your Free Haircut
				</div>
				<form method="post" use:enhance id="freehaircut" action="?/freehaircut" class="cform">
					<Errors allErrors={$allErrors} />
					<div class="fg">
						<label for="name">Name</label><input
							bind:value={$form.name}
							type="text"
							placeholder="John Doe"
						/>
					</div>
					<div class="fg">
						<label for="phone">Phone / WhatsApp</label><input
							type="tel"
							name="phone"
							bind:value={$form.phone}
							placeholder="+44 7700 000000"
						/>
					</div>
					<div class="fg">
						<label for="email">Email</label><input
							bind:value={$form.email}
							name="email"
							type="email"
							placeholder="john@email.com"
						/>
					</div>
					<div class="fg">
						<label for="style">Preferred Style</label>
						<select name="prefferedStyle" bind:value={$form.prefferedStyle}
							><option value="">Select...</option><option>Skin Fade</option><option
								>Taper Fade</option
							><option>Classic Scissor Cut</option><option>Afro / Textured Cut</option><option
								>Beard Trim</option
							><option>Whatever the tutor recommends</option></select
						>
					</div>
					<div class="fg">
						<label for="availability">Availability</label>
						<select name="prefferedTime" bind:value={$form.prefferedTime}
							><option value="">Select...</option><option>Weekdays (Mon–Fri)</option><option
								>Weekends (Sat–Sun)</option
							><option>Flexible</option></select
						>
					</div>
					<div class="fg">
						<label for="notes">Anything else?</label><textarea
							name="contactMessage"
							bind:value={$form.contactMessage}
							placeholder="Extra notes for us..."
							style="height:72px"
						></textarea>
					</div>
					<button
						form="freehaircut"
						class="btn-gold"
						type="submit"
						style="width:100%;padding:18px;font-size:14px"
					>
						{#if $delayed}
							<LoadingBtn name="Submitting Request..." />
						{:else}
							Submit My Request →
						{/if}</button
					>
					<div style="font-size:11px;color:var(--grey);text-align:center">
						We'll confirm within 24 hours
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<div class="chain"><div class="chain-line"></div></div>
<div style="background:var(--dark2);padding:80px 48px">
	<div style="max-width:960px;margin:0 auto;text-align:center" class="fi">
		<div class="ey" style="justify-content:center"><span>What to Expect</span></div>
		<h2
			class="sec-title"
			style="font-size:clamp(44px,6vw,72px);text-align:center;margin-bottom:40px"
		>
			NO CATCH. <span class="g">JUST A CUT.</span>
		</h2>
		<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">
			<div style="background:var(--dark3);padding:32px 24px;border-top:3px solid var(--gold3)">
				<div style="font-family:var(--fh);font-size:22px;letter-spacing:1px;margin-bottom:10px">
					60–90 MINUTES
				</div>
				<div style="font-size:13px;color:var(--grey);line-height:1.7">
					Students take their time to deliver a clean, precise result. Worth every minute.
				</div>
			</div>
			<div style="background:var(--dark3);padding:32px 24px;border-top:3px solid var(--gold)">
				<div style="font-family:var(--fh);font-size:22px;letter-spacing:1px;margin-bottom:10px">
					FULLY SUPERVISED
				</div>
				<div style="font-size:13px;color:var(--grey);line-height:1.7">
					A qualified tutor oversees every cut from start to finish. Your result is in safe hands.
				</div>
			</div>
			<div style="background:var(--dark3);padding:32px 24px;border-top:3px solid var(--gold2)">
				<div style="font-family:var(--fh);font-size:22px;letter-spacing:1px;margin-bottom:10px">
					COMPLETELY FREE
				</div>
				<div style="font-size:13px;color:var(--grey);line-height:1.7">
					No charge, no pressure, no upsell. Just a professional haircut at no cost to you.
				</div>
			</div>
		</div>
	</div>
</div>
