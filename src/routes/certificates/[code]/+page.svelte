<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { printPdf } from '$lib/printPdf';

	let { data } = $props();

	const pdfUrl = $derived(`/certificates/${data.code}/pdf`);
	let printing = $state(false);

	async function print() {
		printing = true;
		await printPdf(pdfUrl);
		printing = false;
	}
</script>

<Seo title="Certificate Verification" noindex />

<div class="psec lg:mt-32!">
	<div class="pinner">
		{#if !data.certificate}
			<h2 class="ptitle">Certificate <span class="g">not found</span></h2>
			<p class="psub">
				We have no certificate with the number <strong>{data.code}</strong>. Check the number on the
				certificate and try again, or call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				>.
			</p>
		{:else if !data.certificate.isActive}
			<h2 class="ptitle">Certificate <span class="g">revoked</span></h2>
			<p class="psub">
				Certificate <strong>{data.code}</strong> was issued by D&D Barber Academy but is no longer
				valid. Please call us on
				<a href="tel:02037003997" style="color:var(--gold);text-decoration:underline"
					>020 3700 3997</a
				> if you have questions.
			</p>
		{:else}
			{@const c = data.certificate}
			<h2 class="ptitle">Verified <span class="g">certificate</span></h2>
			<p class="psub">This certificate is genuine and was issued by D&D Barber Academy, London.</p>
			<div class="cob" style="margin-top:28px">
				<div class="verified">✓ Valid</div>
				<dl class="facts">
					<dt>Awarded to</dt>
					<dd class="name">{c.studentName}</dd>
					<dt>Award</dt>
					<dd>{c.title}</dd>
					<dt>Course</dt>
					<dd>
						{c.courseName}{#if c.courseDetails}<span class="details">
								· {c.courseDetails}</span
							>{/if}
					</dd>
					<dt>Completed</dt>
					<dd>{c.completedOn}</dd>
					<dt>Certificate No.</dt>
					<dd>{c.code}</dd>
				</dl>
				<div class="actions">
					<a class="btn-gold" href="{pdfUrl}?download">Download PDF</a>
					<button class="btn-outline" type="button" onclick={print} disabled={printing}>
						{printing ? 'Opening…' : 'Print'}
					</button>
					<a class="btn-outline" href={pdfUrl} target="_blank" rel="noopener">View</a>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.verified {
		display: inline-block;
		margin-bottom: 18px;
		padding: 4px 12px;
		border: 1px solid var(--gold);
		color: var(--gold);
		font-family: var(--fb);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 3px;
		text-transform: uppercase;
	}
	.facts {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 10px 24px;
		margin: 0;
	}
	.facts dt {
		color: var(--grey);
		font-family: var(--fb);
		font-size: 12px;
		letter-spacing: 2px;
		text-transform: uppercase;
		padding-top: 3px;
	}
	.facts dd {
		margin: 0;
		font-size: 16px;
	}
	.facts .name {
		font-size: 22px;
		font-weight: 700;
	}
	.details {
		color: var(--grey);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 28px;
	}
	.actions > * {
		padding: 14px 26px;
		font-size: 13px;
		cursor: pointer;
	}
	@media (max-width: 560px) {
		.facts {
			grid-template-columns: 1fr;
			gap: 2px;
		}
		.facts dd {
			margin-bottom: 10px;
		}
	}
</style>
