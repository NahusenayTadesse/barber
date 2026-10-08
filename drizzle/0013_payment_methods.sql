CREATE TABLE `course_payment_methods` (
	`course_id` int NOT NULL,
	`method_id` int NOT NULL,
	CONSTRAINT `course_payment_methods_course_id_method_id_pk` PRIMARY KEY(`course_id`,`method_id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`kind` enum('full','instalments','deposit') NOT NULL,
	`instalments` int,
	`percent_off` decimal(5,2) NOT NULL DEFAULT '0',
	`description` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_by` varchar(255),
	`updated_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3),
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--> statement-breakpoint
ALTER TABLE `enrolments` ADD `payment_method_id` int;--> statement-breakpoint
ALTER TABLE `course_payment_methods` ADD CONSTRAINT `course_payment_methods_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_payment_methods` ADD CONSTRAINT `course_payment_methods_method_id_payment_methods_id_fk` FOREIGN KEY (`method_id`) REFERENCES `payment_methods`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_updated_by_user_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrolments` ADD CONSTRAINT `enrolments_payment_method_id_payment_methods_id_fk` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- The three options the checkout offered before, so the website looks the same
INSERT INTO `payment_methods` (`id`, `name`, `kind`, `instalments`, `percent_off`, `description`, `sort_order`) VALUES
(1, 'Deposit to Secure', 'deposit', NULL, 0, 'Lock in your place today\nBalance due before start day\nQuickest way to enrol', 1),
(2, '3 Equal Instalments', 'instalments', 3, 0, 'Spread the cost over 3 months\n0% interest · Equal payments\nNo credit check required', 2),
(3, 'Pay in Full', 'full', NULL, 10, 'Best value · Save 10%\nOne payment, nothing to track\nImmediate confirmation', 3);
--> statement-breakpoint
-- Every existing course keeps offering all three
INSERT INTO `course_payment_methods` (`course_id`, `method_id`)
SELECT c.`id`, m.`id` FROM `courses` c CROSS JOIN `payment_methods` m;
--> statement-breakpoint
-- Link earlier enrolments to their method and store its name
UPDATE `enrolments` SET `payment_method_id` = 1, `payment_option` = 'Deposit to Secure' WHERE `payment_option` = 'minPrice';
--> statement-breakpoint
UPDATE `enrolments` SET `payment_method_id` = 2, `payment_option` = '3 Equal Instalments' WHERE `payment_option` = 'threeEqual';
--> statement-breakpoint
UPDATE `enrolments` SET `payment_method_id` = 3, `payment_option` = 'Pay in Full' WHERE `payment_option` = 'fullPrice';