import type { SubmitFunction } from '@sveltejs/kit';
import { invalidateAll } from '$app/navigation';
import { toast } from 'svelte-sonner';

/**
 * use:enhance handler for the class forms: toasts the action's message and
 * reloads the page data on success. setBusy tracks the submit in progress.
 */
export const submitWithToast =
	(setBusy: (busy: boolean) => void, onSuccess?: () => void): SubmitFunction =>
	() => {
		setBusy(true);
		return async ({ result, update }) => {
			setBusy(false);
			if (result.type === 'success') {
				toast.success(String(result.data?.message));
				onSuccess?.();
				await invalidateAll();
			} else if (result.type === 'failure') {
				toast.error(String(result.data?.message));
			} else if (result.type === 'error') {
				toast.error('Something went wrong. Please try again.');
			} else {
				await update();
			}
		};
	};
