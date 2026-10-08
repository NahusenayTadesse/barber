ALTER TABLE `enrolments` ADD `amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `enrolments` ADD `discount_name` varchar(255);--> statement-breakpoint
ALTER TABLE `enrolments` ADD `discount_percentage` decimal(5,2);--> statement-breakpoint
ALTER TABLE `enrolments` ADD `stripe_session_id` varchar(255);--> statement-breakpoint
ALTER TABLE `enrolments` ADD CONSTRAINT `enrolments_stripe_session_id_unique` UNIQUE(`stripe_session_id`);