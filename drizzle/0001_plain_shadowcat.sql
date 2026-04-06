ALTER TABLE `contact_messages` MODIFY COLUMN `is_read` boolean;--> statement-breakpoint
ALTER TABLE `contact_messages` MODIFY COLUMN `is_read` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `access_token_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `refresh_token_expires_at` datetime;--> statement-breakpoint
ALTER TABLE `account` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);--> statement-breakpoint
ALTER TABLE `session` MODIFY COLUMN `expires_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `session` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);--> statement-breakpoint
ALTER TABLE `verification` MODIFY COLUMN `expires_at` datetime NOT NULL;--> statement-breakpoint
ALTER TABLE `verification` MODIFY COLUMN `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3);