<script lang="ts">
	import { MailCheck } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';

	let { id, email, status }: { id: number; email: string; status: string } = $props();

	let sending = $state(false);
</script>

{#if status === 'paid'}
	<form
		method="post"
		action="?/resendWelcome"
		use:enhance={() => {
			sending = true;
			return async ({ result }) => {
				sending = false;
				if (result.type === 'success') toast.success(String(result.data?.message));
				else if (result.type === 'failure') toast.error(String(result.data?.message));
				else if (result.type === 'error') toast.error("The welcome email couldn't be sent.");
			};
		}}
	>
		<input type="hidden" name="enrolmentId" value={id} />
		<Button
			size="sm"
			variant="outline"
			type="submit"
			disabled={sending}
			title="Send the welcome email to {email} again"
		>
			<MailCheck class="h-4 w-4 {sending ? 'animate-pulse' : ''}" />
			{sending ? 'Sending…' : 'Resend Welcome Email'}
		</Button>
	</form>
{:else}
	<span class="text-muted-foreground">—</span>
{/if}
