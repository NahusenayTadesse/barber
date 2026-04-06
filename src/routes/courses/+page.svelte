<script>
	let { data } = $props();

	import { superForm } from 'sveltekit-superforms/client';
	import { toast } from 'svelte-sonner';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';

	import Errors from '$lib/formComponents/Errors.svelte';
	import { Mail, MapPin, Phone } from '@lucide/svelte';
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
	let payment = $state();
</script>

<svelte:head>
	<title>Courses & Enrollment</title>
</svelte:head>

<div class="phero">
	<div class="phero-bg"></div>
	<div class="phero-inner fi">
		<div class="ey"><span>Courses & Enrolment</span></div>
		<h1 class="sec-title" style="font-size:clamp(58px,9vw,116px)">
			CHOOSE<br />YOUR <span class="g">START.</span>
		</h1>
		<p class="sec-sub">Pick your course. Secure your place. Start cutting.</p>
	</div>
</div>
<div class="ticker-wrap">
	<div class="ticker-inner">
		<span>No Experience Needed</span><span>Real Clients Week One</span><span
			>Certificate on Completion</span
		><span>Enrol from £299</span><span>London Based</span><span>Flexible Payment</span>
		<span>No Experience Needed</span><span>Real Clients Week One</span><span
			>Certificate on Completion</span
		><span>Enrol from £299</span><span>London Based</span><span>Flexible Payment</span>
	</div>
</div>

<div class="crsgrid">
	{#each data.coursesList as course}
		<div class="crscard fi">
			<div class="crsstripe"></div>
			<div class="crstop">
				<div class="crslv">{course.level} — {course.target}</div>
				<div class="crsnm">{course.name}</div>
				<div class="crsdur">{course.duration} · {course.experience}</div>
				<div class="crs-prow">
					<div class="crsprice">£{course.basePrice}</div>
					<div class="crspnote">full course</div>
				</div>
			</div>
			<div class="crsbody">
				<div class="urgency">
					<strong>Enrol from £{course.minPrice} deposit</strong> — {course.minPriceMessage}
				</div>
				<div class="incl">What You'll Learn & Get</div>
				<ul class="buls">
					{#each course?.description?.split(/\n+/).filter(Boolean) as point}
						<li class="capitalize">{point.trim()}</li>
					{/each}
				</ul>
				<button
					class="btn-gold"
					onclick={() => ($form.courseId = course.id)}
					style="width:100%;padding:16px;font-size:14px"
					>Reserve My Place — {course.name?.split(' ').at(-1)} →</button
				>
			</div>
		</div>
	{/each}

	<!-- <div class="crscard fi" style="transition-delay:.15s">
		<div class="crsstripe"></div>
		<div class="crsbadge">Most Popular</div>
		<div class="crstop">
			<div class="crslv">Level 2 — For barbers levelling up</div>
			<div class="crsnm">12 WEEK<br />ADVANCED</div>
			<div class="crsdur">12 Weeks · Take your skills to the top</div>
			<div class="crs-prow">
				<div class="crsprice">£1,499</div>
				<div class="crspnote">full course</div>
			</div>
		</div>
		<div class="crsbody">
			<div class="urgency">
				<strong>Enrol from £399 deposit</strong> — limited spaces per cohort. Once the intake is full,
				the next available date may be weeks away.
			</div>
			<div class="incl">What You'll Learn & Get</div>
			<ul class="buls">
				<li>For barbers ready to level up</li>
				<li>Advanced fades and cleaner blending</li>
				<li>Texture, finishing and sharper client work</li>
				<li>Speed, consistency and shop-floor confidence</li>
				<li>Business, bookings and client retention</li>
				<li>Advanced certificate and 1-to-1 support</li>
			</ul>
			<button class="btn-gold" style="width:100%;padding:16px;font-size:14px"
				>Reserve My Place — Advanced →</button
			>
		</div>
	</div> -->
</div>

<div class="chain" style="margin-top:60px"><div class="chain-line"></div></div>

<!-- PAYMENT -->
<div class="psec" id="paySection">
	<div class="pinner">
		<div class="fi">
			<div class="ey"><span>Payment Options</span></div>
			<h2 class="ptitle">FLEX<br /><span class="g">YOUR WAY.</span></h2>
			<p class="psub">
				Your career shouldn't wait because of cash flow. Choose a payment plan that works for you —
				no credit checks, no interest, no hassle.
			</p>
		</div>
		<div class="selbanner" id="selbanner">
			Course selected: <strong id="selname"></strong> — Choose your payment method below
		</div>
		<div class="popts fi" style="transition-delay:.1s">
			<button
				onclick={() => {
					$form.paymentOption = 'minPrice';
				}}
				class="popt {$form.paymentOption === 'minPrice' ? 'sel' : ''}"
			>
				<div class="poname">Deposit to Secure</div>
				<div class="poamt" id="depAmt">
					£{data.coursesList.find((c) => c.id === $form.courseId)?.minPrice}
				</div>
				<div class="ponote">
					Lock in your place today<br />Balance due before start day<br />Quickest way to enrol
				</div>
			</button>
			<button
				onclick={() => {
					$form.paymentOption = 'threeEqual';
				}}
				class="popt {$form.paymentOption === 'threeEqual' ? 'sel' : ''}"
			>
				<div class="poname">3 Equal Instalments</div>
				<div class="poamt" id="instAmt">
					£{Math.floor(
						Number(data.coursesList.find((c) => c.id === $form.courseId)?.basePrice) / 3
					)}/mo
				</div>
				<div class="ponote">
					Spread the cost over 3 months<br />0% interest · Equal payments<br />No credit check
					required
				</div>
			</button>
			<button
				onclick={() => {
					$form.paymentOption = 'fullPrice';
				}}
				class="popt {$form.paymentOption === 'fullPrice' ? 'sel' : ''}"
			>
				<div class="poname">Pay in Full</div>
				<div class="poamt" id="fullAmt">
					£{data.coursesList.find((c) => c.id === $form.courseId)?.basePrice}
				</div>
				<div class="ponote">
					Best value · Save 5%<br />One payment, nothing to track<br />Immediate confirmation
				</div>
			</button>
		</div>
		<div class="cob fi" style="transition-delay:.2s">
			<div
				style="font-family:var(--fb);font-size:11px;letter-spacing:4px;text-transform:uppercase;color:var(--gold);font-weight:700;margin-bottom:22px"
			>
				Complete Your Enrolment
			</div>
			<Errors allErrors={$allErrors} />
			<form use:enhance method="post" id="enroll" action="?/enroll" class="crow">
				<input type="hidden" required name="courseId" bind:value={$form.courseId} />
				<input type="text" hidden name="paymentOption" bind:value={$form.paymentOption} />

				<div class="fg">
					<label for="firstName">First Name</label><input
						name="firstName"
						required
						bind:value={$form.firstName}
						type="text"
						id="ef"
						placeholder="John"
					/>
				</div>
				<div class="fg">
					<label for="lastName">Last Name</label><input
						name="lastName"
						type="text"
						bind:value={$form.lastName}
						id="ef"
						placeholder="Smith"
					/>
				</div>
			</form>
			<div class="crow">
				<div class="fg">
					<label for="email">Email</label><input
						type="email"
						id="ee"
						bind:value={$form.email}
						placeholder="john@email.com"
					/>
				</div>
				<div class="fg">
					<label for="phone">Phone</label><input
						bind:value={$form.phone}
						type="tel"
						name="phone"
						id="ep"
						placeholder="+44 7700 000000"
					/>
				</div>
			</div>
			<div class="csum">
				<div>
					<div class="clbl">Selected Course</div>
					<div
						style="font-family:var(--fb);font-size:15px;font-weight:700;letter-spacing:1px"
						id="summC"
					>
						{data.coursesList.find((c) => c.id === $form.courseId)?.name ??
							'— Select a course above —'}
					</div>
				</div>
				<div style="text-align:right">
					<div class="clbl">Amount Due Today</div>
					<div class="cval" id="summA">
						£{$form.paymentOption === 'minPrice'
							? Math.floor(data.coursesList.find((c) => c.id === $form.courseId)?.minPrice)
							: $form.paymentOption === 'threeEqual'
								? Math.floor(
										Number(data.coursesList.find((c) => c.id === $form.courseId)?.basePrice) / 3
									)
								: $form.paymentOption === 'fullPrice'
									? Math.floor(data.coursesList.find((c) => c.id === $form.courseId)?.basePrice)
									: '-'}
					</div>
				</div>
			</div>
			<!-- <button class="btn-gold" style="width:100%;padding:18px;font-size:14px;letter-spacing:2.5px"
				>Confirm My Enrolment →</button
			> -->
			<button
				form="enroll"
				class="btn-gold"
				type="submit"
				style="width:100%;padding:18px;font-size:14px"
			>
				{#if $delayed}
					<LoadingBtn name="Confirming Enrolment..." />
				{:else}
					Confirm My Enrolment →
				{/if}</button
			>
			<div
				style="font-size:11px;color:var(--grey);text-align:center;margin-top:14px;line-height:1.7"
			>
				Secure checkout · You'll receive a confirmation within 24 hours<br />Questions? Call us on
				<a href="tel:0202779988" style="color:var(--gold);text-decoration:none">0202 779 988</a>
				or
				<a
					href="https://wa.me/442027799988"
					target="_blank"
					style="color:var(--gold);text-decoration:none">WhatsApp us</a
				><br />Deposits are non-refundable once your place is confirmed. Full terms available below.
			</div>
		</div>
	</div>
</div>
