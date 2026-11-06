CREATE TABLE `enrolment_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enrolment_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`payment_way_id` int,
	`paid_on` date NOT NULL,
	`stripe_session_id` varchar(255),
	`note` varchar(500),
	`created_by` varchar(255),
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `enrolment_payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `enrolment_payments_stripe_session_id_unique` UNIQUE(`stripe_session_id`)
);
--> statement-breakpoint
ALTER TABLE `enrolments` ADD `total_price` decimal(10,2);--> statement-breakpoint
ALTER TABLE `enrolments` ADD `balance_link_amount` decimal(10,2);--> statement-breakpoint
ALTER TABLE `enrolment_payments` ADD CONSTRAINT `enrolment_payments_enrolment_id_enrolments_id_fk` FOREIGN KEY (`enrolment_id`) REFERENCES `enrolments`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrolment_payments` ADD CONSTRAINT `enrolment_payments_payment_way_id_payment_ways_id_fk` FOREIGN KEY (`payment_way_id`) REFERENCES `payment_ways`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `enrolment_payments` ADD CONSTRAINT `enrolment_payments_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill: what each existing student owes in total. Instalment plans owe
-- every instalment, deposits the whole (discounted) course price. When a
-- discount was removed, it's what they'd paid plus what was then due.
UPDATE `enrolments` e
LEFT JOIN `payment_methods` m ON m.`id` = e.`payment_method_id`
LEFT JOIN `courses` c ON c.`id` = e.`course_id`
LEFT JOIN `discount_nullifications` n ON n.`enrolment_id` = e.`id`
SET e.`total_price` = CASE
	WHEN n.`id` IS NOT NULL THEN n.`amount_paid` + n.`amount_due`
	WHEN m.`kind` = 'instalments' THEN e.`amount` * GREATEST(COALESCE(m.`instalments`, 1), 1)
	WHEN m.`kind` = 'deposit' AND c.`base_price` IS NOT NULL THEN GREATEST(
		FLOOR(c.`base_price` * (1 - COALESCE(e.`discount_percentage`, 0) / 100) * (1 - m.`percent_off` / 100)),
		e.`amount`
	)
	ELSE e.`amount`
END
WHERE e.`amount` IS NOT NULL;--> statement-breakpoint
-- Backfill: what was paid before a discount was removed (they then owed the rest)
INSERT INTO `enrolment_payments` (`enrolment_id`, `amount`, `paid_on`, `note`)
SELECT n.`enrolment_id`, n.`amount_paid`, DATE(e.`created_at`), 'Paid before the discount was removed'
FROM `discount_nullifications` n
JOIN `enrolments` e ON e.`id` = n.`enrolment_id`
WHERE n.`amount_paid` > 0 AND n.`amount_due` > 0;--> statement-breakpoint
-- Backfill: the payment each paid student has made so far
INSERT INTO `enrolment_payments` (`enrolment_id`, `amount`, `payment_way_id`, `paid_on`, `stripe_session_id`)
SELECT e.`id`, e.`amount`, e.`payment_way_id`, DATE(e.`created_at`),
	CASE WHEN w.`slug` = 'stripe' THEN e.`stripe_session_id` END
FROM `enrolments` e
LEFT JOIN `payment_ways` w ON w.`id` = e.`payment_way_id`
WHERE e.`status` = 'confirmed' AND e.`amount` IS NOT NULL;
