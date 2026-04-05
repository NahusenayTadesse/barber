import { sql, relations } from 'drizzle-orm';
import {
	mysqlTable,
	datetime,
	varchar,
	text,
	timestamp,
	boolean,
	index
} from 'drizzle-orm/mysql-core';

export const user = mysqlTable('user', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires', { mode: 'date', fsp: 3 }),
	createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { fsp: 3 })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
});

export const session = mysqlTable(
	'session',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		expiresAt: datetime('expires_at').notNull(),
		token: varchar('token', { length: 255 }).notNull().unique(),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = mysqlTable(
	'account',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: varchar('user_id', { length: 36 })
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: datetime('access_token_expires_at'),
		refreshTokenExpiresAt: datetime('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = mysqlTable(
	'verification',
	{
		id: varchar('id', { length: 36 }).primaryKey(),
		identifier: varchar('identifier', { length: 255 }).notNull(),
		value: text('value').notNull(),
		expiresAt: datetime('expires_at').notNull(),
		createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);
export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const secureFields = {
	isActive: boolean('is_active').default(true).notNull(),
	createdBy: varchar('created_by', { length: 255 }).references(() => user.id, {
		onDelete: 'set null'
	}),
	updatedBy: varchar('updated_by', { length: 255 }).references(() => user.id, {
		onDelete: 'set null'
	}),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.default(sql`CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3)`)
		.notNull()
};
