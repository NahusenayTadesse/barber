ALTER TABLE `courses` ADD `audience` enum('men','women') DEFAULT 'men' NOT NULL;--> statement-breakpoint
ALTER TABLE `course_discounts` DROP COLUMN `gender`;--> statement-breakpoint
ALTER TABLE `enrolments` DROP COLUMN `gender`;