<script lang="ts">
	import { Ban, Copy, CopyCheck, Mail, Printer, RotateCcw } from '@lucide/svelte';
	import CertificateViewer from './certificate-viewer.svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import { printPdf } from '$lib/printPdf';

	let {
		id,
		code,
		studentName,
		verifyUrl,
		email,
		isActive
	}: {
		id: number;
		code: string;
		studentName: string;
		verifyUrl: string;
		email: string | null;
		isActive: boolean;
	} = $props();

	const pdfUrl = $derived(`/certificates/${code}/pdf`);
	let copied = $state(false);
	let busy = $state(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(verifyUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			toast.error('Copy failed.');
		}
	}

	/** Runs a row action and shows its result as a toast. */
	const action = () => {
		busy = true;
		return async ({
			result,
			update
		}: {
			result: import('@sveltejs/kit').ActionResult;
			update: () => Promise<void>;
		}) => {
			busy = false;
			if (result.type === 'success') {
				toast.success(String(result.data?.message));
				await update();
			} else if (result.type === 'failure') toast.error(String(result.data?.message));
			else if (result.type === 'error') toast.error('Something went wrong. Please try again.');
		};
	};
</script>

<div class="flex items-center gap-1">
	{#if isActive}
		<CertificateViewer {code} {studentName} />
		<Button size="icon" variant="ghost" onclick={() => printPdf(pdfUrl)} title="Print">
			<Printer class="h-4 w-4" />
		</Button>
		<form method="post" action="?/email" use:enhance={action}>
			<input type="hidden" name="id" value={id} />
			<Button
				size="icon"
				variant="ghost"
				type="submit"
				disabled={busy || !email}
				title={email ? `Email to ${email}` : 'No email address for this student'}
			>
				<Mail class="h-4 w-4 {busy ? 'animate-pulse' : ''}" />
			</Button>
		</form>
		<Button size="icon" variant="ghost" onclick={copyLink} title="Copy verification link">
			{#if copied}<CopyCheck class="h-4 w-4" />{:else}<Copy class="h-4 w-4" />{/if}
		</Button>
		<form
			method="post"
			action="?/revoke"
			use:enhance={({ cancel }) => {
				if (!confirm(`Revoke certificate ${code}? It will show as not valid when checked.`)) {
					cancel();
					return;
				}
				return action();
			}}
		>
			<input type="hidden" name="id" value={id} />
			<Button size="icon" variant="ghost" type="submit" disabled={busy} title="Revoke">
				<Ban class="h-4 w-4 text-red-500" />
			</Button>
		</form>
	{:else}
		<form method="post" action="?/restore" use:enhance={action}>
			<input type="hidden" name="id" value={id} />
			<Button size="sm" variant="outline" type="submit" disabled={busy}>
				<RotateCcw class="h-4 w-4" /> Restore
			</Button>
		</form>
	{/if}
</div>
