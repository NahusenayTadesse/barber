CREATE TABLE `discount_nullifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrolment_id` int NOT NULL,
	`discount_name` varchar(255) NOT NULL,
	`discount_percentage` decimal(5,2) NOT NULL,
	`amount_paid` decimal(10,2) NOT NULL,
	`amount_due` decimal(10,2) NOT NULL,
	`reason` text NOT NULL,
	`nullified_on` date NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),
	CONSTRAINT `discount_nullifications_id` PRIMARY KEY(`id`),
	CONSTRAINT `discount_nullifications_enrolment_id_unique` UNIQUE(`enrolment_id`)
);
--> statement-breakpoint
ALTER TABLE `discount_nullifications` ADD CONSTRAINT `discount_nullifications_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discount_nullifications` ADD CONSTRAINT `discount_nullifications_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `discount_nullifications` ADD CONSTRAINT `discount_nullifications_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;