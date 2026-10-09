<script lang="ts" generics="TData, TValue">
	import {
		type ColumnDef,
		getCoreRowModel,
		getPaginationRowModel,
		type ColumnFilter,
		ColumnFiltering,
		getSortedRowModel,
		type RowSelectionState,
		getFilteredRowModel,
		type PaginationState,
		type SortingState,
		type ColumnFiltersState,
		type VisibilityState,
		type GlobalFilterColumn
	} from '@tanstack/table-core';
	import Pdf from './pdf.svelte';

	import { Input } from '$lib/components/ui/input/index.js';

	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	let {
		data,
		columns,
		search = true,
		class: className = '',
		fileName = 'File'
	}: DataTableProps<TData, TValue> = $props();
	// let filterSchema = $derived(
	//   discoverFilterSchema(data).filter(meta => !filterBlacklist.includes(meta.key))
	// );  import { Input } from "$lib/components/ui/input/index.js";

	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronDownIcon, Frown, ListOrdered } from '@lucide/svelte';
	import * as Resizable from '$lib/components/ui/resizable/index.js';
	import ResizableHandle from '../ui/resizable/resizable-handle.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';
	import type { Column } from '@tanstack/table-core';

	const mobile = new IsMobile();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: data.length });
	let columnFilters = $state<ColumnFiltersState>([]);

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		search?: boolean;
		class?: string;
		filterBlacklist?: string[];
		fileName?: string;
	};

	let sorting = $state<SortingState>([]);
	let globalFilter = $state<GlobalFilterColumn>();

	let columnVisibility = $state<VisibilityState>({});
	let rowSelection = $state<RowSelectionState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},

			get globalFilter() {
				return globalFilter;
			},
			get rowSelection() {
				return rowSelection;
			}
		},
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},

		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel()
	});

	const uniqueTableId = `table-${Math.random().toString(36).substring(2, 15)}`;

	function getTableBreakpoints<T>(data: T[]): number[] {
		const totalItems = data.length;
		const step = 10;
		const breakpoints: number[] = [];

		for (let i = step; i < totalItems; i += step) {
			breakpoints.push(i);
		}

		if (totalItems > 0) {
			breakpoints.push(totalItems);
		}

		return breakpoints;
	}

	// Phone card view: label each value with its column name
	function columnLabel(column: Column<TData, unknown>) {
		const header = column.columnDef.header;
		if (typeof header === 'string') return header;
		return column.id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
	}
	const isIndexColumn = (column: Column<TData, unknown>) => column.columnDef.header === '#';
</script>

{#snippet toolbar()}
	<Input
		type="search"
		placeholder="Search Table..."
		class="w-full md:w-64 lg:w-full"
		bind:value={globalFilter}
		oninput={() => table.setGlobalFilter(globalFilter)}
	/>
	<div
		class="-mx-1 flex shrink-0 [scrollbar-width:none] items-center gap-2 overflow-x-auto px-1 md:mx-0 md:px-0"
	>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" size={mobile.current ? 'sm' : 'default'}
						>Columns <ChevronDownIcon class="size-5" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{column.id.replace(/([a-z])([A-Z])/g, '$1 $2')}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" size={mobile.current ? 'sm' : 'default'}
						>Pages <ChevronDownIcon class="size-5" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="center" class="flex w-4! flex-col">
				{#each getTableBreakpoints(data) as column (column)}
					<DropdownMenu.Item
						class="w-4! capitalize"
						onclick={() => {
							table.setPageSize(column);
						}}
					>
						{#snippet child({ props })}
							<Button
								{...props}
								variant={pagination.pageSize === column ? 'default' : 'ghost'}
								size="icon"
								class="max-w-16"
								>{column}
							</Button>
						{/snippet}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
		<Pdf {fileName} tableId="#{uniqueTableId}" {data} />
		<Button variant="outline" size={mobile.current ? 'sm' : 'default'}>
			<ListOrdered />
			{table.getFilteredRowModel().rows.length} Results
		</Button>
	</div>
{/snippet}

{#snippet pager()}
	{#if table.getPageCount() > 1}
		<div class="flex items-center justify-end gap-2 py-3">
			<span class="mr-auto text-xs text-muted-foreground">
				Page {pagination.pageIndex + 1} of {table.getPageCount()}
			</span>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
			>
				Previous
			</Button>
			<Button
				variant="outline"
				size="sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
			>
				Next
			</Button>
		</div>
	{/if}
{/snippet}

{#if mobile.current}
	<!-- Phones: each row becomes a card, so nothing needs sideways scrolling -->
	<div class="mt-4 flex w-full flex-col gap-3 {className}">
		{#if search}
			<div class="flex flex-col gap-2">
				{@render toolbar()}
			</div>
		{/if}

		<ul class="flex flex-col gap-3">
			{#each table.getRowModel().rows as row, rowIndex (row.id)}
				{@const cells = row.getVisibleCells()}
				{@const titleCell = cells[1] && !isIndexColumn(cells[1].column) ? cells[1] : undefined}
				<li class="rounded-xl border bg-card p-4 shadow-sm">
					{#if titleCell}
						<div class="mb-2 flex items-start justify-between gap-3">
							<div class="min-w-0 text-base font-semibold break-words capitalize">
								<FlexRender
									content={titleCell.column.columnDef.cell}
									context={titleCell.getContext()}
								/>
							</div>
							<span
								class="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
							>
								#{rowIndex + 1 + pagination.pageIndex * pagination.pageSize}
							</span>
						</div>
					{/if}
					<dl class="divide-y divide-border/60">
						{#each cells as cell (cell.id)}
							{#if cell !== titleCell && !isIndexColumn(cell.column)}
								<div class="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0">
									<dt class="shrink-0 text-xs text-muted-foreground">
										{columnLabel(cell.column)}
									</dt>
									<dd class="min-w-0 text-right text-sm break-words capitalize">
										<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
									</dd>
								</div>
							{/if}
						{/each}
					</dl>
				</li>
			{:else}
				<li
					class="flex items-center justify-center gap-2 rounded-xl border p-8 text-muted-foreground"
				>
					<Frown class="animate-bounce" /> Nothing found here.
				</li>
			{/each}
		</ul>

		{@render pager()}

		<!-- Plain-text copy of the rows for the PDF / CSV export, which reads a <table> -->
		<table id={uniqueTableId} class="hidden">
			<thead>
				<tr>
					{#each table.getVisibleLeafColumns() as column (column.id)}
						<th>{columnLabel(column)}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each table.getRowModel().rows as row (row.id)}
					<tr>
						{#each row.getVisibleCells() as cell (cell.id)}
							<td>{isIndexColumn(cell.column) ? row.index + 1 : (cell.getValue() ?? '')}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<!-- min-h-0 is required for flex-child overflow -->
	<Resizable.PaneGroup
		direction="horizontal"
		class="lg:max-w-8xl mt-4 flex w-full min-w-full gap-0 rounded-lg lg:w-fit lg:min-w-2xl {className}"
	>
		<Resizable.Pane
			defaultSize={table.getAllColumns().filter((col) => col.getIsVisible()).length * 20}
			class="bg-background"
		>
			<ScrollArea orientation="vertical" class="w-full rounded-lg p-2">
				<div class="flex min-w-full flex-col gap-2 rounded-md border-0 px-1">
					{#if search}
						<ScrollArea
							orientation="horizontal"
							class="flex w-full flex-row rounded-md border whitespace-nowrap"
						>
							<div class="flex w-full space-x-4 p-4">
								{@render toolbar()}
							</div>
						</ScrollArea>
					{/if}
					<!-- As tall as the screen; longer tables scroll inside it -->
					<div class="max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-md border">
						<Table.Root id={uniqueTableId} class="relative">
							<Table.Header>
								{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
									<Table.Row>
										{#each headerGroup.headers as header, index (header.id)}
											<Table.Head
												colspan={header.colSpan}
												class="{index === 1
													? 'sticky left-0 z-10 bg-background'
													: ''} p-0 px-2 text-start"
											>
												{#if !header.isPlaceholder}
													<FlexRender
														content={header.column.columnDef.header}
														context={header.getContext()}
													/>
												{/if}
											</Table.Head>
										{/each}
									</Table.Row>
								{/each}
							</Table.Header>
							<Table.Body>
								{#each table.getRowModel().rows as row (row.id)}
									<Table.Row data-state={row.getIsSelected() && 'selected'}>
										{#each row.getVisibleCells() as cell, index (cell.id)}
											<Table.Cell
												class="word-break capitalize {index === 1
													? 'sticky left-0 z-10 bg-background'
													: ''}"
											>
												<FlexRender
													content={cell.column.columnDef.cell}
													context={cell.getContext()}
												/>
											</Table.Cell>
										{/each}
									</Table.Row>
								{:else}
									<Table.Row>
										<Table.Cell colspan={columns.length} class="text-center font-2xl">
											<div class="flex flex-row items-center justify-center gap-2">
												<Frown class="animate-bounce" /> Nothing found here.
											</div>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
					{@render pager()}
				</div>
			</ScrollArea>
		</Resizable.Pane>
		<ResizableHandle withHandle />
		<Resizable.Pane></Resizable.Pane>
	</Resizable.PaneGroup>
{/if}
