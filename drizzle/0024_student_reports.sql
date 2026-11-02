CREATE TABLE `student_report_marks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_id` int NOT NULL,
	`skill` varchar(255) NOT NULL,
	`mark` int NOT NULL,
	CONSTRAINT `student_report_marks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrolment_id` int NOT NULL,
	`report_date` date NOT NULL,
	`week` int NOT NULL,
	`week_title` varchar(255) NOT NULL,
	`teacher_name` varchar(255),
	`comment` text,
	`created_by` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `student_report_marks` ADD CONSTRAINT `student_report_marks_report_id_student_reports_id_fk` FOREIGN KEY (`report_id`) REFERENCES `student_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_reports` ADD CONSTRAINT `student_reports_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `student_reports` ADD CONSTRAINT `student_reports_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;