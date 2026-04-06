<script>
	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	import Errors from '$lib/formComponents/Errors.svelte';
	import { Mail, MapPin, Phone } from '@lucide/svelte';
	let { data } = $props();
	const { form, errors, enhance, delayed, message, allErrors } = superForm(data.form, {
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
	<title>Contact</title>
</svelte:head>
<div class="phero" style="min-height:42vh">
	<div class="phero-bg"></div>
	<div class="phero-inner fi">
		<div class="ey"><span>Get In Touch</span></div>
		<h1 class="sec-title" style="font-size:clamp(60px,9vw,116px)">
			ASK US<br /><span class="g">ANYTHING.</span>
		</h1>
		<p class="sec-sub">
			No question is too small. Whether you're ready to enrol or just exploring — we're happy to
			talk it through.
		</p>
	</div>
</div>
<div class="ticker-wrap">
	<div class="ticker-inner">
		<span>0202 779 988</span><span>WhatsApp Us</span><span>Instagram & TikTok</span><span
			>London · 69</span
		><span>Same-Day Replies</span>
		<span>0202 779 988</span><span>WhatsApp Us</span><span>Instagram & TikTok</span><span
			>London · 69</span
		><span>Same-Day Replies</span>
	</div>
</div>

<div class="cpgrid">
	<div class="fi">
		<div class="ey"><span>Reach Us</span></div>
		<h2 class="sec-title" style="font-size:clamp(42px,5vw,68px)">
			WE'RE<br /><span class="g">HERE.</span>
		</h2>
		<p style="font-size:14px;color:var(--grey);margin-bottom:8px;line-height:1.85;font-weight:300">
			The fastest way to get an answer is WhatsApp. We reply the same day during working hours —
			usually within the hour.
		</p>
		<p style="font-size:13px;color:var(--grey2);margin-bottom:28px;line-height:1.7;font-weight:300">
			If you're not ready to enrol yet, that's fine too. Most people have questions first — and we'd
			rather answer them properly than rush you into anything.
		</p>

		<div class="cii">
			<div class="cii-icon"><MapPin /></div>
			<div>
				<div class="cii-lbl">Location</div>
				<div class="cii-val">69 · London, UK</div>
			</div>
		</div>
		<div class="cii">
			<div class="cii-icon"><Phone /></div>
			<div>
				<div class="cii-lbl">Phone</div>
				<div class="cii-val">
					<a href="tel:0202779988" style="color:var(--white);text-decoration:none">0202 779 988</a>
				</div>
			</div>
		</div>
		<div class="cii">
			<div class="cii-icon"><Mail /></div>
			<div>
				<div class="cii-lbl">Email</div>
				<div class="cii-val">
					<a href="mailto:info@ddbarbers.co.uk" style="color:var(--white);text-decoration:none"
						>info@ddbarbers.co.uk</a
					>
				</div>
			</div>
		</div>
		<div class="cii">
			<div class="cii-icon">💬</div>
			<div>
				<div class="cii-lbl">WhatsApp — Fastest Response</div>
				<div class="cii-val" style="margin-top:8px">
					<a
						href="https://wa.me/442027799988"
						target="_blank"
						class="wa-big"
						style="font-size:12px;padding:12px 22px"><span>💬</span> Start a Chat</a
					>
				</div>
			</div>
		</div>
		<div
			style="margin-top:28px;padding:20px;background:rgba(212,175,55,.04);border:1px solid rgba(212,175,55,.12);border-left:3px solid var(--gold)"
		>
			<div
				style="font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--gold);font-weight:600;margin-bottom:8px"
			>
				Response Times
			</div>
			<div style="font-size:13px;color:var(--grey);font-weight:300;line-height:1.85">
				WhatsApp: within the hour during working hours<br />Email: same day, Mon–Sat<br />Phone:
				Mon–Sat, 9am–6pm
			</div>
		</div>
	</div>
	<div class="fi" style="transition-delay:.2s">
		<div
			style="background:var(--dark2);border:1px solid rgba(212,175,55,.2);padding:44px 40px;position:relative;clip-path:polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px))"
		>
			<div
				style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold3),var(--gold2),var(--gold3))"
			></div>
			<div
				style="position:absolute;top:0;right:0;border-top:20px solid rgba(212,175,55,.5);border-left:20px solid transparent"
			></div>
			<div
				style="font-family:var(--fb);font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:8px"
			>
				Send a Message
			</div>
			<div style="font-size:13px;color:var(--grey);margin-bottom:24px;font-weight:300">
				We'll get back to you the same day.
			</div>
			<form method="POST" use:enhance id="contact-form" action="?/contact" class="cform">
				<Errors allErrors={$allErrors} />
				<div class="fg">
					<label for="name"> Name</label><input
						bind:value={$form.name}
						name="name"
						type="text"
						placeholder="John Doe"
					/>
				</div>
				<div class="fg">
					<label for="email">Email</label><input
						name="email"
						bind:value={$form.email}
						type="email"
						placeholder="john@email.com"
					/>
				</div>
				<div class="fg">
					<label for="phone">Phone</label><input
						name="phone"
						bind:value={$form.phone}
						type="tel"
						placeholder="+44 7700 000000"
					/>
				</div>
				<div class="fg">
					<label for="subject">Subject</label>
					<select bind:value={$form.subject} name="subject">
						<option value="">What's on your mind?</option>
						<option>Which course is right for me?</option>
						<option>Upcoming intake dates</option>
						<option>Payment and deposit options</option>
						<option>Free haircut booking</option>
						<option>General question</option>
					</select>
				</div>
				<div class="fg">
					<label for="message">Message</label><textarea
						bind:value={$form.contactMessage}
						name="contactMessage"
						placeholder="Ask us anything — we'll give you a straight answer..."
					></textarea>
				</div>
				<button
					form="contact-form"
					class="btn-gold"
					type="submit"
					style="width:100%;padding:18px;font-size:14px"
				>
					{#if $delayed}
						<LoadingBtn name="Sending Message..." />
					{:else}
						Send My Message →
					{/if}</button
				>
			</form>
		</div>
	</div>
</div>
