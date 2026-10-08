CREATE TABLE `course_discount_courses` (
	`discount_id` int NOT NULL,
	`course_id` int NOT NULL,
	CONSTRAINT `course_discount_courses_discount_id_course_id_pk` PRIMARY KEY(`discount_id`,`course_id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
--> statement-breakpoint
-- Carry existing discounts over: a single-course discount keeps its course,
-- an "All Courses" discount (course_id NULL) is linked to every current course.
INSERT INTO `course_discount_courses` (`discount_id`, `course_id`)
SELECT `id`, `course_id` FROM `course_discounts` WHERE `course_id` IS NOT NULL;
--> statement-breakpoint
INSERT INTO `course_discount_courses` (`discount_id`, `course_id`)
SELECT d.`id`, c.`id` FROM `course_discounts` d CROSS JOIN `courses` c WHERE d.`course_id` IS NULL;
--> statement-breakpoint
ALTER TABLE `course_discounts` DROP FOREIGN KEY `course_discounts_course_id_courses_id_fk`;
--> statement-breakpoint
ALTER TABLE `course_discount_courses` ADD CONSTRAINT `course_discount_courses_discount_id_course_discounts_id_fk` FOREIGN KEY (`discount_id`) REFERENCES `course_discounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discount_courses` ADD CONSTRAINT `course_discount_courses_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `course_discounts` DROP COLUMN `course_id`;