import { desc } from 'drizzle-orm';
import { secureFields, user } from './auth.schema';

import {
	mysqlTable,
	int,
	varchar,
	text,
	decimal,
	timestamp,
	mysqlEnum,
	boolean,
	uniqueIndex,
	primaryKey,
	date
} from 'drizzle-orm/mysql-core';

const timestamps = () => ({
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

// --- Courses Table ---
// Based on the 'crsgrid' and 'crscard' elements in the HTML
export const courses = mysqlTable('courses', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(), // e.g., "The Master Barber"
	level: varchar('level', { length: 100 }), // e.g., "Beginner to Advanced"
	duration: varchar('duration', { length: 100 }), // e.g., "10 Weeks"
	description: text('description'),
	target: varchar('target', { length: 255 }),
	experience: varchar('experience', { length: 255 }),
	minPrice: decimal('min_price', { precision: 10, scale: 2 }),
	minPriceMessage: varchar('min_price_message', { length: 255 }),
	basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
	slug: varchar('slug', { length: 255 }).unique(),
	...secureFields
});

// --- Pricing Tiers Table ---
// Handles "Deposit", "Instalments", and "Full Payment" options
export const pricingOptions = mysqlTable('pricing_options', {
	id: int('id').primaryKey().autoincrement(),
	courseId: int('course_id').references(() => courses.id),
	type: mysqlEnum('type', ['deposit', 'instalments', 'full_payment']).notNull(),
	amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
	note: text('note'), // e.g., "Pay remaining balance on day 1"
	...secureFields
});

// --- Payment Methods Table ---
// The ways a student can pay for a course (Pay in Full, 2 or 3 instalments,
// deposit...). Courses offer the ones linked in course_payment_methods.
export const paymentMethods = mysqlTable('payment_methods', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(), // e.g. "3 Equal Instalments"
	// full = whole price now; instalments = price split into `instalments` payments,
	// the first paid now; deposit = the course's minimum price now
	kind: mysqlEnum('kind', ['full', 'instalments', 'deposit']).notNull(),
	instalments: int('instalments'),
	// Extra % off the course price for this method, e.g. 10 for paying in full
	percentOff: decimal('percent_off', { precision: 5, scale: 2 }).default('0').notNull(),
	// Shown on the payment card, one line each
	description: text('description'),
	sortOrder: int('sort_order').default(0).notNull(),
	...secureFields
});

// --- Course <-> Payment Method link table ---
export const coursePaymentMethods = mysqlTable(
	'course_payment_methods',
	{
		courseId: int('course_id')
			.notNull()
			.references(() => courses.id, { onDelete: 'cascade' }),
		methodId: int('method_id')
			.notNull()
			.references(() => paymentMethods.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.courseId, table.methodId] })]
);

// --- Enrolments Table ---
// Based on the 'submitEnrol' function and payment selection
export const enrolments = mysqlTable('enrolments', {
	id: int('id').primaryKey().autoincrement(),
	courseId: int('course_id').references(() => courses.id),
	paymentOptionId: int('payment_option_id').references(() => pricingOptions.id),
	course: varchar('course', { length: 255 }),
	// The method chosen; payment_option keeps its name in case the method is deleted later
	paymentMethodId: int('payment_method_id').references(() => paymentMethods.id, {
		onDelete: 'set null'
	}),
	paymentOption: varchar('payment_option', { length: 255 }),
	firstName: varchar('first_name', { length: 255 }).notNull(),
	lastName: varchar('last_name', { length: 255 }).notNull(),
	gender: mysqlEnum('gender', ['male', 'female']), // optional
	phone: varchar('phone', { length: 50 }),
	email: varchar('email', { length: 255 }).notNull(),
	// pending = checkout started, confirmed = paid, cancelled = checkout expired
	status: mysqlEnum('status', ['pending', 'confirmed', 'cancelled']).default('pending'),
	// What was actually charged at checkout, and the discount applied (if any)
	amount: decimal('amount', { precision: 10, scale: 2 }),
	discountName: varchar('discount_name', { length: 255 }),
	discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }),
	stripeSessionId: varchar('stripe_session_id', { length: 255 }).unique(),
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull()
});

// --- Discount Nullifications Table ---
// Audit record of a discount taken off a student, e.g. a women-only discount
// claimed by someone who isn't. The enrolment goes back to unpaid with
// amount_due, so the student can pay the rest with their payment link.
export const discountNullifications = mysqlTable('discount_nullifications', {
	id: int('id').primaryKey().autoincrement(),
	enrolmentId: int('enrolment_id')
		.notNull()
		.unique()
		.references(() => enrolments.id, { onDelete: 'cascade' }),
	// The discount that was removed, copied from the enrolment
	discountName: varchar('discount_name', { length: 255 }).notNull(),
	discountPercentage: decimal('discount_percentage', { precision: 5, scale: 2 }).notNull(),
	amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).notNull(), // already paid before
	amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(), // charged by the link
	reason: text('reason').notNull(),
	nullifiedOn: date('nullified_on', { mode: 'string' }).notNull(),
	...secureFields
});

// --- Certificates Table ---
// Issued when a student completes a course. The student, course and signatory
// are copied in, so a certificate never changes when those records do.
// isActive = false means the certificate was revoked.
export const certificates = mysqlTable('certificates', {
	id: int('id').primaryKey().autoincrement(),
	// Public certificate number, also used in the verification link
	code: varchar('code', { length: 32 }).notNull().unique(),
	enrolmentId: int('enrolment_id').references(() => enrolments.id, { onDelete: 'set null' }),
	title: varchar('title', { length: 100 }).notNull(), // e.g. "Certificate of Completion"
	studentName: varchar('student_name', { length: 255 }).notNull(),
	courseName: varchar('course_name', { length: 255 }).notNull(),
	courseDetails: varchar('course_details', { length: 255 }), // e.g. "8 Weeks · Advanced Skills"
	completedOn: date('completed_on', { mode: 'string' }).notNull(),
	signatoryName: varchar('signatory_name', { length: 255 }),
	signatoryRole: varchar('signatory_role', { length: 255 }),
	...secureFields
});

// --- Contact Messages Table ---
// Based on the 'cform' and 'submitForm' logic
export const contactMessages = mysqlTable('contact_messages', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	phone: varchar('phone', { length: 50 }),
	subject: varchar('subject', { length: 255 }),
	message: text('message').notNull(),
	isRead: boolean('is_read').default(false), // Using boolean for boolean compatibility
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull()
});

// --- Free Haircut Requests ---
// Based on the 'submitHC' (Haircut) function
export const haircutRequests = mysqlTable('haircut_requests', {
	id: int('id').primaryKey().autoincrement(),
	clientName: varchar('client_name', { length: 255 }).notNull(),
	clientEmail: varchar('client_email', { length: 255 }).notNull(),
	clientPhone: varchar('client_phone', { length: 50 }),
	preferredDate: timestamp('preferred_date'),
	prefferedStyle: varchar('preferred_style', { length: 255 }),
	prefferedTime: varchar('preferred_time', { length: 50 }),
	message: text('message'),
	status: mysqlEnum('status', ['requested', 'scheduled', 'completed']).default('requested'),
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull()
});

export * from './auth.schema';

export const services = mysqlTable('services', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	description: text('description'),
	imageUrl: varchar('image_url', { length: 255 }),
	bookingLink: varchar('booking_link', { length: 255 })
});

export const gallery = mysqlTable('gallery', {
	id: int('id').primaryKey().autoincrement(),
	imageUrl: varchar('image_url', { length: 255 })
});

// --- Business Hours Table ---
export const businessHours = mysqlTable(
	'business_hours',
	{
		id: int('id').primaryKey().autoincrement(),

		// JS Date#getDay() convention: 0 = Sunday ... 6 = Saturday
		dayOfWeek: int('day_of_week').notNull(),

		// e.g. "Monday"
		dayLabel: varchar('day_label', { length: 20 }).notNull(),

		// Display order, Monday-first (0-6)
		sortOrder: int('sort_order').notNull(),

		isClosed: boolean('is_closed').default(false).notNull(),

		// e.g. "9AM", "12PM"
		opensLabel: varchar('opens_label', { length: 20 }),

		// e.g. "6PM", "12AM"
		closesLabel: varchar('closes_label', { length: 20 }),

		...timestamps()
	},
	(table) => [uniqueIndex('business_hours_day_of_week_idx').on(table.dayOfWeek)]
);

// --- Course Discounts Table ---
// A percentage off the courses linked in course_discount_courses.
// Live between startsAt and expiresAt while isActive is true.
export const courseDiscounts = mysqlTable('course_discounts', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(), // e.g., "Summer Sale"
	percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(), // e.g., 15.00
	// Only for students of this gender; null = everyone
	gender: mysqlEnum('gender', ['male', 'female']),
	startsAt: timestamp('starts_at').defaultNow().notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	...secureFields
});

// --- Course Discount <-> Course link table ---
export const courseDiscountCourses = mysqlTable(
	'course_discount_courses',
	{
		discountId: int('discount_id')
			.notNull()
			.references(() => courseDiscounts.id, { onDelete: 'cascade' }),
		courseId: int('course_id')
			.notNull()
			.references(() => courses.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.discountId, table.courseId] })]
);
