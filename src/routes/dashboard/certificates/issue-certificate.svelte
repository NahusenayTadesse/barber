<script module lang="ts">
	export type EnrolmentOption = {
		id: number;
		name: string;
		course: string;
		courseDetails: string;
		paid: boolean;
		hasCertificate: boolean;
	};
</script>

<script lang="ts">
	import { Award, CircleCheck, Copy, CopyCheck, Mail, Printer } from '@lucide/svelte';
	import CertificateViewer from './certificate-viewer.svelte';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { enhance as enhanceAction } from '$app/forms';
	import { untrack } from 'svelte';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import { Button } from '$lib/components/ui/button/index.js';
	import DialogComp from '$lib/formComponents/DialogComp.svelte';
	import InputComp from '$lib/formComponents/InputComp.svelte';
	import Errors from '$lib/formComponents/Errors.svelte';
	import LoadingBtn from '$lib/formComponents/LoadingBtn.svelte';
	import { printPdf } from '$lib/printPdf';
	import { issueCertificate, type IssueCertificate } from './schema';

	let {
		data,
		enrolmentOptions,
		canEmail
	}: {
		data: SuperValidated<Infer<IssueCertificate>>;
		enrolmentOptions: EnrolmentOption[];
		canEmail: boolean;
	} = $props();

	type Issued = {
		text: string;
		id: number;
		code: string;
		studentName: string;
		verifyUrl: string;
		hasEmail: boolean;
	};

	// Opened straight away from the dashboard's quick links (/dashboard/certificates?issue)
	let open = $state(page.url.searchParams.has('issue'));
	// Set after a certificate is issued: the dialog then shows what to do with it
	let issued = $state<Issued | null>(null);
	let copied = $state(false);
	let sending = $state(false);

	const { form, errors, enhance, delayed, allErrors } = superForm(
		untrack(() => data),
		{
			id: 'issue-certificate',
			validators: zod4Client(issueCertificate),
			onUpdated({ form: result }) {
				const msg = result.message;
				if (!msg) return;
				if (msg.type !== 'success') {
					toast.error(msg.text);
					return;
				}
				toast.success(msg.text);
				issued = {
					text: msg.text,
					id: msg.id,
					code: msg.code,
					studentName: msg.studentName,
					verifyUrl: msg.verifyUrl,
					hasEmail: Boolean(result.data.enrolmentId)
				};
			},
			onChange(event) {
				// Fill in the student and course from the chosen enrolment
				if (event.paths.includes('enrolmentId')) {
					const e = enrolmentOptions.find((o) => String(o.id) === $form.enrolmentId);
					if (e) {
						$form.studentName = e.name;
						$form.courseName = e.course;
						$form.courseDetails = e.courseDetails;
					}
				}
			}
		}
	);

	const enrolmentItems = $derived(
		enrolmentOptions.map((e) => ({
			value: String(e.id),
			name: `${e.name} — ${e.course}${e.paid ? '' : ' (unpaid)'}${e.hasCertificate ? ' ✓ has certificate' : ''}`
		}))
	);

	const pdfUrl = $derived(issued ? `/certificates/${issued.code}/pdf` : '');

	async function copyLink() {
		if (!issued) return;
		try {
			await navigator.clipboard.writeText(issued.verifyUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			toast.error('Copy failed.');
		}
	}
</script>

<DialogComp
	title="Issue Certificate"
	IconComp={Award}
	variant="default"
	bind:open={() => open, (v) => ((open = v), v || (issued = null))}
>
	{#if issued}
		<div class="flex w-full flex-col gap-4 p-4">
			<p class="flex items-center gap-2 font-medium">
				<CircleCheck class="h-5 w-5 text-green-500" />
				{issued.text}
			</p>
			<p class="text-sm text-muted-foreground">
				Open it to check it, print it, or send it to the student. You can do all of this later from
				the table too.
			</p>
			<div class="flex flex-wrap gap-2">
				<CertificateViewer
					code={issued.code}
					studentName={issued.studentName}
					label="View"
					variant="default"
				/>
				<Button variant="outline" onclick={() => printPdf(pdfUrl)}>
					<Printer class="h-4 w-4" /> Print
				</Button>
				{#if issued.hasEmail}
					<form
						method="post"
						action="?/email"
						use:enhanceAction={() => {
							sending = true;
							return async ({ result }) => {
								sending = false;
								if (result.type === 'success') toast.success(String(result.data?.message));
								else if (result.type === 'failure') toast.error(String(result.data?.message));
								else if (result.type === 'error') toast.error("The email couldn't be sent.");
							};
						}}
					>
						<input type="hidden" name="id" value={issued.id} />
						<Button variant="outline" type="submit" disabled={!canEmail || sending}>
							{#if sending}
								<LoadingBtn name="Sending" />
							{:else}
								<Mail class="h-4 w-4" /> Email to Student
							{/if}
						</Button>
					</form>
				{/if}
				<Button variant="outline" onclick={copyLink}>
					{#if copied}
						<CopyCheck class="h-4 w-4" /> Copied
					{:else}
						<Copy class="h-4 w-4" /> Copy Verification Link
					{/if}
				</Button>
			</div>
			<Button variant="ghost" onclick={() => (issued = null)}>
				<Award class="h-4 w-4" /> Issue Another Certificate
			</Button>
		</div>
	{:else}
		<form
			action="?/issue"
			use:enhance
			method="post"
			id="issue-certificate"
			class="flex w-full flex-col gap-4 p-4"
		>
			<Errors allErrors={$allErrors} />
			<InputComp
				{form}
				{errors}
				label="Enrolment"
				type="combo"
				name="enrolmentId"
				items={enrolmentItems}
			/>
			<p class="-mt-2 text-xs text-muted-foreground">
				Choose the student's enrolment to fill in their details, or leave it and type them below.
			</p>
			<InputComp
				{form}
				{errors}
				label="Student's Full Name (as printed)"
				type="text"
				name="studentName"
				required={true}
			/>
			<InputComp {form} {errors} label="Course" type="text" name="courseName" required={true} />
			<InputComp
				{form}
				{errors}
				label="Course Details (optional)"
				type="text"
				name="courseDetails"
				placeholder="e.g. 8 Weeks · Advanced Skills"
			/>
			<InputComp
				{form}
				{errors}
				label="Certificate Title"
				type="text"
				name="title"
				placeholder="e.g. Certificate of Completion, or Professional Barber Diploma"
			/>
			<InputComp {form} {errors} label="Date of Completion" type="date" name="completedOn" />
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<InputComp
					{form}
					{errors}
					label="Signed By"
					type="text"
					name="signatoryName"
					placeholder="Name printed on the signature line"
				/>
				<InputComp
					{form}
					{errors}
					label="Their Role"
					type="text"
					name="signatoryRole"
					placeholder="e.g. Academy Director"
				/>
			</div>

			<Button type="submit" class="mt-4" form="issue-certificate">
				{#if $delayed}
					<LoadingBtn name="Issuing Certificate" />
				{:else}
					<Award class="h-4 w-4" /> Issue Certificate
				{/if}
			</Button>
		</form>
	{/if}
</DialogComp>
