# Bug Hunt — Checkout & Dashboard

Reviewed 2026-10-08. Covers the course checkout flow, every dashboard form action, uploads and auth.

## Status (updated 2026-10-08)

| # | Issue | Status |
|---|---|---|
| 1 | Dashboard actions work logged out | **Fixed**: guard in `hooks.server.ts`; logged-out POSTs now redirect to `/login` (verified) |
| 2 | Payments never confirmed | **Fixed**: enrolment stores the Stripe session; webhook `/api/stripe/webhook` and the new `/courses/success` page mark it paid; expired sessions are marked cancelled (verified end to end in the Stripe sandbox) |
| 3 | Stripe payments can't be matched | **Fixed**: course + option as product name, `customer_email`, `client_reference_id`, metadata |
| 4 | Success toast on cancel | **Fixed**: separate success page; cancel returns to the course with a "payment cancelled" notice |
| 5 | Stripe error crashes checkout | **Fixed**: caught, friendly message shown, the unused enrolment removed |
| 6 | Deposit £0 / broken | **Fixed**: Deposit hidden when there's no deposit price; course seed now sets `min_price` to 50% |
| 7 | Inactive courses shown and sellable | **Fixed**: filtered from the course list, menus, banner and checkout; `/courses/<inactive>` is a 404 |
| 8 | Enrollments amounts wrong | **Fixed**: shows the amount actually charged, discount and Paid/Unpaid/Cancelled; older rows fall back to an estimate |
| 9 | Gallery upload limits | **Fixed**: form validated; images only (JPG/PNG/WebP/AVIF), 10 MB each, max 30 |
| 10 | Course delete fails / blank toast | **Fixed**: courses with enrolments can't be deleted (message says to set Inactive); price options removed with the course; toasts show |
| 11 | Messages add/edit broken | **Fixed**: removed; wording corrected; newest messages first |
| 12 | `/courses?/enroll` without payment | **Fixed**: action removed |
| 13 | Discount times depend on server timezone | **Fixed**: discount days are UK days (Europe/London, BST-aware); Opening Day seed uses exact instants |
| 14 | Login status codes | **Fixed**: 400 for bad form, 401 for wrong credentials; stray `}` removed |
| 15 | Raw errors shown | **Fixed** in course add/edit, gallery, hours, and the public Contact and Free Haircut forms. Change Password still shows Better Auth's own messages (e.g. "Invalid password"), which are useful. |
| 16 | Personal data in logs | **Fixed**: `console.log(session)` / `console.log(form)` removed |
| 17 | Course price list wrong id | **Fixed** |
| 18 | Wrong `$types` import | **Fixed** |
| 19 | Payment wording contradicts itself | **Open**: needs your decision (see below) |
| 20 | Dead `addCustomer` action | **Fixed**: removed |
| 21 | *(new)* Free Haircut never saved style/time | **Fixed**: field names didn't match the `preffered…` columns, so they were silently dropped (verified now saving) |
| 22 | *(new)* Free Haircut action live while page is switched off | **Open**: `/freehaircut` returns 404 on purpose, but its form action still accepts submissions. Remove it, or leave it if you'll re-enable the page. |

### Before deploying
- Run migrations `0010`, `0011`, `0012`, `0013`, `0014` on production. Production was set up with `db:push`, so `db:migrate` would replay everything: apply these SQL files directly.
- In the **live** Stripe dashboard, add a webhook endpoint `https://<your-domain>/api/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired` and `checkout.session.async_payment_failed`, and put its signing secret in `STRIPE_WEBHOOK_SECRET`. Without it, payments are still confirmed when the customer reaches the success page, but not if they close the tab first.

---

## Original findings

**Verified** = reproduced against the local dev server (logged out, using IDs that don't exist or invalid data, so nothing was changed). Everything else comes from reading the code.

---

## Critical

### 1. Dashboard actions work without logging in
**Where:** every `+page.server.ts` under `src/routes/dashboard/` (services, messages, gallery, hours, courses/[id], courses/add-course). The only exception is `discounts`.
**What happens:** `dashboard/+layout.server.ts` redirects logged-out users, but in SvelteKit a layout `load` only runs on page loads, **not on form POSTs**. Anyone who knows a URL can create, edit or delete data.
**Verified:** while logged out:
- `POST /dashboard/services?/delete` → `"Service Successfully Deleted"`
- `POST /dashboard/messages?/delete` → `"Testimonial Successfully Deleted"`
- `POST /dashboard/courses/999999?/delete` → `success 204`
- `POST /dashboard/hours` → reached validation, so valid data would be saved
- `POST /dashboard/discounts?/delete` → `401 "Please log in again."` (the only guarded action)

**Worst case:** a single request to `/dashboard/gallery?/editGallery` with `existing=` empties the whole gallery. Courses, services and messages can be deleted one ID at a time.
**Fix:** add a check in `src/hooks.server.ts` that rejects any `/dashboard` request (GET or POST) without `event.locals.user`. One check covers every route, current and future.

### 2. Payments are never confirmed; every checkout attempt is saved as an enrolment
**Where:** `src/routes/courses/[id]/+page.server.ts` (`enroll` action)
**What happens:** the enrolment row is inserted when the Stripe session is *created*, before anyone pays. There is no webhook, and `success_url` carries no session id, so nothing ever records whether the person paid. Every abandoned checkout shows up in Dashboard → Enrollments looking exactly like a real one (status stays `pending` forever).
**Fix:** save the Stripe session id on the enrolment, and add a `checkout.session.completed` webhook (or verify the session on the success page) that marks the enrolment `confirmed`.

---

## High

### 3. A Stripe payment can't be matched to a student
**Where:** `src/routes/courses/[id]/+page.server.ts:76`
**What happens:** the Checkout session is created with only `name: 'Service Fee'`. There is no course name, no `customer_email`, no `client_reference_id` and no `metadata`. In the Stripe dashboard, every payment is an anonymous "Service Fee", so you can't tell who paid for which course or which option.
**Fix:** set `customer_email`, `client_reference_id: <enrolment id>`, `metadata: { courseId, paymentOption, discountId }`, and use the course name as the product name.

### 4. "Enrolment Successfully Applied!" shows even when payment is cancelled
**Where:** `src/routes/courses/[id]/+page.server.ts:115`
**What happens:** the success flash message is set *before* redirecting to Stripe. `cancel_url` and `success_url` both go to `/courses`, so someone who cancels on Stripe comes back to a green "success" toast.
**Fix:** use different success and cancel URLs, and only show success after the payment is confirmed (see #2).

### 5. A Stripe error crashes the checkout page
**Where:** `src/routes/courses/[id]/+page.server.ts:76`
**What happens:** `stripe.checkout.sessions.create` isn't in a `try/catch`. Any Stripe error (bad key, network failure, amount below Stripe's minimum) becomes a generic 500 error page instead of a form message.
**Fix:** wrap the call in `try/catch` and return `message(form, { type: 'error', ... })`.

### 6. Deposit option is broken for every seeded course
**Where:** `courses.min_price` data / `src/routes/courses/[id]/+page.svelte`
**What happens:** the enrolment page reads the deposit from `courses.min_price`, but `drizzle/seed/course_prices.sql` leaves it `NULL` (it writes deposits to `pricing_options` instead). The Deposit card shows **£0**, and choosing it is rejected at checkout. On production this applies to any course without a Min Price set.
**Fix:** either fill in `min_price` (e.g. 50% of `base_price`) or read the deposit from `pricing_options`. Hide the Deposit option when it would be £0.

### 7. Inactive courses are still shown and can still be bought
**Where:** `src/routes/courses/+page.server.ts`, `src/routes/courses/[id]/+page.server.ts`, `src/routes/+layout.server.ts`
**What happens:** the dashboard lets you set a course to Inactive (`is_active`), but no public query filters on it. Inactive courses still appear on the course list and in the header/footer menus, and `/courses/<id>` still takes payments for them.
**Fix:** add `where(eq(courses.isActive, true))` to the public course queries, and return 404 for an inactive course on `/courses/[id]`.

### 8. Enrollments dashboard shows wrong amounts (£0 for "Pay in Full")
**Where:** `src/routes/dashboard/enrollments/+page.server.ts:19-28`
**What happens:** the SQL `CASE` checks for `'basePrice'`, but the checkout stores `'fullPrice'`, so every full payment shows **£0**. The amounts are also recalculated from *today's* prices: they ignore the 10% pay-in-full saving and any discount that applied, and they change whenever a course price is edited.
**Fix:** save the amount actually charged (and the discount used) on the enrolment at checkout, and show that.

---

## Medium

### 9. Gallery: anyone can upload unlimited files of any type
**Where:** `src/routes/dashboard/gallery/+page.server.ts`, `schema.ts`
**What happens:** besides having no auth check (#1), the action never checks `form.valid`. The schema only limits files to 10 MB each, with no limit on count and no file-type check, so the server disk can be filled.
**Fix:** auth (#1), check `form.valid`, and limit the number of files and allow only image types.

### 10. Deleting a course that has enrolments fails, with a broken message
**Where:** `src/routes/dashboard/courses/[id]/+page.server.ts:112-129`
**What happens:**
- `enrolments.course_id` and `pricing_options.course_id` reference courses with no `ON DELETE` rule, so deleting a course with any enrolment throws a foreign key error.
- The flash messages use the key `text`, but the layout reads `$flash.message`, so the success and error toasts are blank.
- `if (!id)` sets a flash message but doesn't `return`, so it continues anyway.

**Fix:** use `message:` in `setFlash`, add a `return` after the missing-id check, and either block deleting courses that have enrolments (with a clear message) or deactivate them instead.

### 11. Messages page has broken add/edit actions copied from another project
**Where:** `src/routes/dashboard/messages/+page.server.ts:42-104`
**What happens:** the `add` and `edit` actions refer to testimonial fields (`position`, `avatar`, `testimonial`), an undefined `avatarFile`, and `saveUploadedFile` without importing it. The UI only uses `delete`, but the endpoints are live: calling them throws and returns a 500. The delete message says "Testimonial Successfully Deleted".
**Fix:** remove `add` and `edit` (or rewrite them as "mark as read"), and fix the wording.

### 12. Public `/courses?/enroll` creates enrolments with no payment
**Where:** `src/routes/courses/+page.server.ts:31`
**What happens:** an old `enroll` action is still live. It inserts an enrolment directly with no payment step, and nothing on that page uses it anymore. It's a spam route into the Enrollments table.
**Fix:** delete the action.

### 13. Discount start/end times depend on the server's timezone
**Where:** `src/routes/dashboard/discounts/+page.server.ts` (`toRange`)
**What happens:** "start of day" and "end of day" use the server process's local timezone. Your dev machine is UTC+3. If production runs in UTC, discounts in UK summer time (BST) start and end an hour off.
**Fix:** set `TZ=Europe/London` for the Node process in production, or build the dates explicitly in `Europe/London`.

---

## Low

14. **Login returns 500 for validation errors**: `src/routes/login/+page.server.ts:31` uses status 500 for a bad form; it should be 400. The message also contains a stray `}`: `'Please Check the form}'`.
15. **Raw error messages shown to users**: course add/edit, gallery and change-password append `err.message` (SQL and internal errors) to the toast.
16. **Personal data in logs**: `console.log(session)` in checkout and `console.log(form)` in course add/edit write customer details to the server logs.
17. **Course price list in the dashboard compares the wrong id**: `src/routes/dashboard/courses/+page.server.ts` uses `productIds.includes(p.id)` (the price id) instead of `p.courseId`, so prices end up matched to the wrong course or dropped.
18. **Course edit/delete use the parent route's types**: `src/routes/dashboard/courses/[id]/+page.server.ts:10` imports `../$types`, which is why `params.id` doesn't type-check.
19. **Payment wording contradicts itself**: the course list says "remaining 50% paid in equal instalments **every two weeks**", but the enrolment page offers "3 Equal Instalments **/mo**" and "Balance due before start day".
20. **Unused `enrollments` `addCustomer` action**: it inserts a `name` column that doesn't exist on `enrolments`. Its UI is commented out, but the endpoint is live and would throw.

---

## Suggested order
1. #1 (auth guard in `hooks.server.ts`): one small change that closes the biggest hole.
2. #2–#5 together (Stripe webhook, metadata, correct success/cancel handling, error handling).
3. #6–#8 (deposit price, inactive courses, enrolment amounts).
4. The rest.
