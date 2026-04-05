<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';

	let { open = $bindable(false), title, body }: { open: boolean; title: string; body: string } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="bg-dark-200 border-gold/30 max-w-3xl max-h-[85vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title class="font-display text-4xl text-foreground">{title}</Dialog.Title>
		</Dialog.Header>
		<div class="prose prose-invert prose-p:text-[#F0EDE4]/80 prose-p:leading-relaxed prose-h4:font-heading prose-h4:text-xs prose-h4:tracking-[3px] prose-h4:text-gold prose-h4:uppercase prose-h4:mt-6 prose-h4:mb-2">
			{@html body}
		</div>
	</Dialog.Content>
</Dialog.Root>
