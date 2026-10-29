<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Seo from '$lib/components/Seo.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { shortTime, weekDays } from '$lib/classes';

	let { data } = $props();
	let saving = $state(false);
	let picked = $state<number>();

	const dayName = (d: number) => weekDays.find((w) => w.value === d)?.name ?? '';
	const date = (iso: string) =>
		new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});

	// The class they're in is ticked until they pick another
	const selected = $derived(picked ?? data.current?.id);
	const choosable = $derived(data.classes.filter((c) => !c.full || c.id === data.current?.id));
</script>

<Seo title="Choose Your Class" noindex />

<div class="psec lg:mt-32!">
	<div class="pinner">
		{#if !data.paid}
			<h2 class="ptitle">Link <span class="g">not active yet</span></h2>
			<p class="psub">
				You can choose your class once your payment for <strong>{data.course}</strong> is confirmed.
				Questions? Call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>.
			</p>
		{:else if data.locked && data.current}
			<h2 class="ptitle">You're <span class="g">in class</span></h2>
			<p class="psub">
				{data.firstName}, you're in <strong>{data.current.name}</strong>, which has already started.
				To change class, please call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>.
			</p>
		{:else if choosable.length === 0}
			<h2 class="ptitle">No classes <span class="g">open yet</span></h2>
			<p class="psub">
				{#if data.current}
					You're in <strong>{data.current.name}</strong>.
				{/if}
				There are no other classes for <strong>{data.course}</strong> with places right now. Please
				check back later, or call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>.
			</p>
		{:else}
			<h2 class="ptitle">Choose your <span class="g">class</span></h2>
			<p class="psub">
				Hi {data.firstName}, pick the class for your <strong>{data.course}</strong> that fits your
				week.
				{#if data.current}
					You're currently in <strong>{data.current.name}</strong>; choose another to switch.
				{:else}
					Places are limited, so the sooner you choose the better.
				{/if}
			</p>

			<form
				method="post"
				action="?/choose"
				use:enhance={() => {
					saving = true;
					return async ({ result, update }) => {
						saving = false;
						if (result.type === 'success') {
							toast.success(String(result.data?.message));
							picked = undefined;
						} else if (result.type === 'failure') {
							toast.error(String(result.data?.message));
						}
						await update();
					};
				}}
			>
				<fieldset class="mb-8 grid gap-3 md:grid-cols-2">
					<legend class="sr-only">Classes</legend>
					{#each choosable as cls (cls.id)}
						<label class="popt text-left!" class:sel={selected === cls.id}>
							<input
								type="radio"
								name="classId"
								value={cls.id}
								class="sr-only"
								checked={selected === cls.id}
								onchange={() => (picked = cls.id)}
							/>
							<div class="poname">
								{cls.id === data.current?.id
									? 'Your class'
									: cls.started
										? 'Running now'
										: 'Starts'}
								{cls.started ? '' : date(cls.startDate)}
							</div>
							<div class="mb-3 text-2xl" style="font-family:var(--fh);letter-spacing:1px">
								{cls.name}
							</div>
							<ul class="mb-3 flex flex-col gap-1 text-sm">
								{#each cls.sessions as s, i (i)}
									<li>
										<strong>{dayName(s.dayOfWeek)}</strong>
										{shortTime(s.startTime)}–{shortTime(s.endTime)}
									</li>
								{/each}
							</ul>
							<div class="ponote">
								{#if cls.endDate}Until {date(cls.endDate)}<br />{/if}
								{#if cls.location}{cls.location}<br />{/if}
								{#if cls.instructor}With {cls.instructor}<br />{/if}
								{#if cls.spotsLeft !== null}
									{cls.spotsLeft} place{cls.spotsLeft === 1 ? '' : 's'} left
								{/if}
							</div>
							{#if cls.notes}
								<p class="ponote mt-2 italic">{cls.notes}</p>
							{/if}
						</label>
					{/each}
				</fieldset>

				<button
					class="btn-gold"
					type="submit"
					disabled={saving || !selected || selected === data.current?.id}
					style="width:100%;padding:18px;font-size:14px"
				>
					{#if saving}
						<LoadingBtn name="Saving your class..." />
					{:else if data.current}
						Switch to This Class →
					{:else}
						Confirm My Class →
					{/if}
				</button>
			</form>
			<div
				style="font-size:11px;color:var(--grey);text-align:center;margin-top:14px;line-height:1.7"
			>
				None of these times work? Call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>
				or
				<a
					href="https://wa.me/447846119677"
					target="_blank"
					rel="noopener"
					style="color:var(--gold);text-decoration:underline">WhatsApp us</a
				>
			</div>
		{/if}
	</div>
</div>
