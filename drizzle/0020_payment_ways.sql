CREATE TABLE `payment_ways` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(50) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_ways_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_ways_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `enrolments` ADD `payment_way_id` int;--> statement-breakpoint
ALTER TABLE `enrolments` ADD CONSTRAINT `enrolments_payment_way_id_payment_ways_id_fk` FOREIGN KEY (`payment_way_id`) REFERENCES `payment_ways`(`id`) ON DELETE set null ON UPDATE no action;