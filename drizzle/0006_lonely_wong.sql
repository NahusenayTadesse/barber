ALTER TABLE `enrolments` ADD `first_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `enrolments` ADD `last_name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `enrolments` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `enrolments` DROP COLUMN `full_name`;