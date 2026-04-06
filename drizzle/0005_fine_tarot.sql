ALTER TABLE `courses` ADD `target` varchar(255);--> statement-breakpoint
ALTER TABLE `courses` ADD `experience` varchar(255);--> statement-breakpoint
ALTER TABLE `courses` ADD `min_price` decimal(10,2);--> statement-breakpoint
ALTER TABLE `courses` ADD `min_price_message` varchar(255);--> statement-breakpoint
ALTER TABLE `enrolments` ADD `course` varchar(255);--> statement-breakpoint
ALTER TABLE `enrolments` ADD `payment_option` varchar(255);