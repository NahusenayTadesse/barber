import { secureFields, user } from './auth.schema';

import {
	mysqlTable,
	int,
	varchar,
	text,
	decimal,
	timestamp,
	mysqlEnum
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

// --- Courses Table ---
// Based on the 'crsgrid' and 'crscard' elements in the HTML
export const courses = mysqlTable('courses', {
	id: int('id').primaryKey().autoincrement(),
	name: varchar('name', { length: 255 }).notNull(), // e.g., "The Master Barber"
	level: varchar('level', { length: 100 }), // e.g., "Beginner to Advanced"
	duration: varchar('duration', { length: 100 }), // e.g., "10 Weeks"
	description: text('description'),
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

// --- Enrolments Table ---
// Based on the 'submitEnrol' function and payment selection
export const enrolments = mysqlTable('enrolments', {
	id: int('id').primaryKey().autoincrement(),
	courseId: int('course_id').references(() => courses.id),
	paymentOptionId: int('payment_option_id').references(() => pricingOptions.id),
	fullName: varchar('full_name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	status: mysqlEnum('status', ['pending', 'confirmed', 'cancelled']).default('pending'),
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull()
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
	isRead: int('is_read').default(0), // Using int for boolean compatibility
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull()
});

// --- Free Haircut Requests ---
// Based on the 'submitHC' (Haircut) function
export const haircutRequests = mysqlTable('haircut_requests', {
	id: int('id').primaryKey().autoincrement(),
	clientName: varchar('client_name', { length: 255 }).notNull(),
	clientEmail: varchar('client_email', { length: 255 }).notNull(),
	preferredDate: timestamp('preferred_date'),
	status: mysqlEnum('status', ['requested', 'scheduled', 'completed']).default('requested'),
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull()
});

export * from './auth.schema';
