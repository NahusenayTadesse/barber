CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(32) NOT NULL,
	`enrolment_id` int,
	`title` varchar(100) NOT NULL,
	`student_name` varchar(255) NOT NULL,
	`course_name` varchar(255) NOT NULL,
	`course_details` varchar(255),
	`completed_on` date NOT NULL,
	`signatory_name` varchar(255),
	`signatory_role` varchar(255),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`),
	CONSTRAINT `certificates_code_unique` UNIQUE(`code`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;