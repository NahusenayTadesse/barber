<script lang="ts">
	import { Download, Eye, ExternalLink, Printer } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button, type ButtonVariant } from '$lib/components/ui/button/index.js';
	import { printPdf } from '$lib/printPdf';

	let {
		code,
		studentName,
		label = '',
		variant = 'ghost'
	}: { code: string; studentName: string; label?: string; variant?: ButtonVariant } = $props();

	const pdfUrl = $derived(`/certificates/${code}/pdf`);
	let open = $state(false);
</script>

<Dialog.Root bind:open>
	<Dialog.Trigger>
		{#snippet child({ props })}
			<Button
				{...props}
				size={label ? 'default' : 'icon'}
				{variant}
				title="View certificate"
				aria-label="View certificate {code}"
			>
				<Eye class="h-4 w-4" />
				{label}
			</Button>
		{/snippet}
	</Dialog.Trigger>
	<Dialog.Content class="flex h-[90dvh] w-[95vw] max-w-6xl! flex-col gap-3 sm:max-w-6xl!">
		<Dialog.Header>
			<Dialog.Title>{studentName} — {code}</Dialog.Title>
		</Dialog.Header>
		<div class="flex flex-wrap gap-2">
			<Button size="sm" href="{pdfUrl}?download">
				<Download class="h-4 w-4" /> Download PDF
			</Button>
			<Button size="sm" variant="outline" onclick={() => printPdf(pdfUrl)}>
				<Printer class="h-4 w-4" /> Print
			</Button>
			<Button size="sm" variant="outline" href={pdfUrl} target="_blank" rel="noopener">
				<ExternalLink class="h-4 w-4" /> Open in New Tab
			</Button>
		</div>
		<!-- Only loaded while open, so the table doesn't fetch every certificate -->
		{#if open}
			<iframe
				src="{pdfUrl}#view=FitH&toolbar=0"
				title="Certificate {code} for {studentName}"
				class="min-h-0 w-full flex-1 border bg-muted"
			></iframe>
			<p class="text-xs text-muted-foreground sm:hidden">
				Can't see it? Phones often can't show PDFs here — use Open in New Tab.
			</p>
		{/if}
	</Dialog.Content>
</Dialog.Root>
