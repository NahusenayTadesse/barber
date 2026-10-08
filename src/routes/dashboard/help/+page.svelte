<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { Download, Search, X, Lightbulb, TriangleAlert, Frown } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import {
		helpSections,
		helpTitle,
		helpSubtitle,
		type HelpBlock,
		type HelpSection
	} from '$lib/help-content';

	let query = $state('');
	let downloading = $state(false);
	let searchEl = $state<HTMLInputElement | null>(null);

	const terms = $derived(
		query
			.toLowerCase()
			.split(/\s+/)
			.filter((t) => t.length > 0)
	);

	function blockText(block: HelpBlock): string {
		switch (block.type) {
			case 'p':
			case 'tip':
			case 'warning':
				return block.text;
			default:
				return [block.title ?? '', ...block.items].join(' ');
		}
	}

	const matchesAll = (haystack: string) => {
		const h = haystack.toLowerCase();
		return terms.every((t) => h.includes(t));
	};

	type Result = { section: HelpSection; blocks: HelpBlock[]; blockHits: number };

	const results = $derived.by<Result[]>(() => {
		if (terms.length === 0) {
			return helpSections.map((section) => ({
				section,
				blocks: section.blocks,
				blockHits: 0
			}));
		}
		const out: Result[] = [];
		for (const section of helpSections) {
			const head = [section.title, section.summary, ...(section.keywords ?? [])].join(' ');
			const headMatches = matchesAll(head);
			const hits = section.blocks.filter((b) => matchesAll(blockText(b)));
			if (headMatches) {
				// The section itself is relevant: show everything, but still count block hits
				out.push({ section, blocks: section.blocks, blockHits: hits.length });
			} else if (hits.length > 0) {
				out.push({ section, blocks: hits, blockHits: hits.length });
			}
		}
		return out;
	});

	/** Split text into plain and matching pieces so matches can be wrapped in <mark>. */
	function segments(text: string): { text: string; hit: boolean }[] {
		if (terms.length === 0) return [{ text, hit: false }];
		const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
		const re = new RegExp(`(${escaped.join('|')})`, 'gi');
		return text
			.split(re)
			.filter((s) => s !== '')
			.map((s) => ({ text: s, hit: terms.includes(s.toLowerCase()) }));
	}

	async function download() {
		downloading = true;
		try {
			const { downloadHelpPdf } = await import('$lib/help-pdf');
			await downloadHelpPdf();
		} catch (e) {
			console.error(e);
			toast.error('Could not create the PDF. Please try again.');
		} finally {
			downloading = false;
		}
	}

	function onKeydown(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		const typing = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
		if (e.key === '/' && !typing) {
			e.preventDefault();
			searchEl?.focus();
		}
		if (e.key === 'Escape' && query) query = '';
	}
</script>

<svelte:window onkeydown={onKeydown} />

<svelte:head>
	<title>Help</title>
</svelte:head>

{#snippet hl(text: string)}
	{#each segments(text) as seg, i (i)}
		{#if seg.hit}
			<mark class="rounded bg-yellow-200 px-0.5 text-foreground dark:bg-yellow-500/40"
				>{seg.text}</mark
			>
		{:else}
			{seg.text}
		{/if}
	{/each}
{/snippet}

<div class="container mx-auto w-full space-y-6 p-4">
	<div class="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">{helpTitle}</h1>
			<p class="text-muted-foreground">{helpSubtitle}</p>
		</div>
		<Button onclick={download} disabled={downloading} class="w-full sm:w-auto">
			{#if downloading}
				<LoadingBtn name="Preparing PDF..." />
			{:else}
				<Download class="mr-2 h-4 w-4" /> Download PDF
			{/if}
		</Button>
	</div>

	<div class="sticky top-0 z-10 -mx-1 bg-background/90 px-1 py-2 backdrop-blur-md lg:top-14">
		<div class="relative">
			<Search
				class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
			<Input
				bind:ref={searchEl}
				type="text"
				bind:value={query}
				placeholder="Search the guide... (press / to focus)"
				aria-label="Search the help guide"
				class="pr-10 pl-9"
			/>
			{#if query}
				<button
					type="button"
					class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					onclick={() => (query = '')}
					aria-label="Clear search"
				>
					<X class="h-4 w-4" />
				</button>
			{/if}
		</div>
		<p class="mt-1 text-xs text-muted-foreground" aria-live="polite">
			{#if terms.length}
				{results.length}
				{results.length === 1 ? 'section' : 'sections'} found
			{:else}
				{helpSections.length} sections
			{/if}
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-[14rem_1fr]">
		<div class="hidden lg:block" role="navigation" aria-label="Guide sections">
			<ul class="sticky top-28 space-y-1 text-sm">
				{#each results as { section } (section.id)}
					<li>
						<a
							href="#{section.id}"
							class="block rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
						>
							{section.title}
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="space-y-6">
			{#each results as { section, blocks, blockHits } (section.id)}
				<section
					id={section.id}
					class="scroll-mt-32 rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
				>
					<h2 class="text-xl font-semibold">{@render hl(section.title)}</h2>
					<p class="mt-1 text-sm text-muted-foreground">{@render hl(section.summary)}</p>
					{#if terms.length && blockHits > 0}
						<p class="mt-1 text-xs text-muted-foreground">
							{blockHits}
							{blockHits === 1 ? 'match' : 'matches'} in this section
						</p>
					{/if}

					<div class="mt-4 space-y-4">
						{#each blocks as block, i (i)}
							{#if block.type === 'p'}
								<p class="leading-relaxed">{@render hl(block.text)}</p>
							{:else if block.type === 'steps'}
								<div>
									{#if block.title}
										<h3 class="mb-2 font-medium">{@render hl(block.title)}</h3>
									{/if}
									<ol class="list-decimal space-y-1.5 pl-6 marker:font-semibold">
										{#each block.items as item, j (j)}
											<li class="leading-relaxed">{@render hl(item)}</li>
										{/each}
									</ol>
								</div>
							{:else if block.type === 'list'}
								<div>
									{#if block.title}
										<h3 class="mb-2 font-medium">{@render hl(block.title)}</h3>
									{/if}
									<ul class="list-disc space-y-1.5 pl-6">
										{#each block.items as item, j (j)}
											<li class="leading-relaxed">{@render hl(item)}</li>
										{/each}
									</ul>
								</div>
							{:else if block.type === 'tip'}
								<div
									class="flex gap-3 rounded-lg border-l-4 border-green-600 bg-green-50 p-3 text-sm dark:bg-green-950/40"
								>
									<Lightbulb class="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
									<p><strong>Tip:</strong> {@render hl(block.text)}</p>
								</div>
							{:else if block.type === 'warning'}
								<div
									class="flex gap-3 rounded-lg border-l-4 border-amber-600 bg-amber-50 p-3 text-sm dark:bg-amber-950/40"
								>
									<TriangleAlert class="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
									<p><strong>Warning:</strong> {@render hl(block.text)}</p>
								</div>
							{/if}
						{/each}
					</div>
				</section>
			{:else}
				<div class="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
					<Frown class="h-10 w-10" />
					<p class="text-lg">Nothing found for "{query}"</p>
					<Button variant="outline" onclick={() => (query = '')}>Clear search</Button>
				</div>
			{/each}
		</div>
	</div>
</div>
