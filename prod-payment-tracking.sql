-- Payment tracking for enrolments (migrations 0025_enrolment_payments + 0026_payment_plans)
-- For the production MariaDB database (10.11), run from phpMyAdmin's SQL tab or:
--   mysql -u <user> -p <database> < prod-payment-tracking.sql
--
-- Adds each student's payment history (enrolment_payments), their course total,
-- a further-payment Stripe link amount and a custom number of instalments, then
-- backfills the history and totals for existing students.
--
-- Back up the database first. Safe to run more than once, including after the
-- earlier attempt that only created the enrolment_payments table: anything that
-- already exists is skipped, and the backfill never adds a payment twice.
-- Plain statements only (no variables or PREPARE), so phpMyAdmin runs it.

-- 1. Payment history table
CREATE TABLE IF NOT EXISTS `enrolment_payments` (
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

-- Same character set as `enrolments` and `user`: the earlier attempt created the
-- table as utf8mb3, and created_by's foreign key to user.id needs a match
ALTER TABLE `enrolment_payments` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- 2. New enrolment columns
ALTER TABLE `enrolments` ADD COLUMN IF NOT EXISTS `total_price` decimal(10,2);
ALTER TABLE `enrolments` ADD COLUMN IF NOT EXISTS `balance_link_amount` decimal(10,2);
ALTER TABLE `enrolments` ADD COLUMN IF NOT EXISTS `plan_instalments` int;

-- 3. Foreign keys
ALTER TABLE `enrolment_payments` ADD CONSTRAINT `enrolment_payments_enrolment_id_enrolments_id_fk` FOREIGN KEY IF NOT EXISTS (`enrolment_id`) REFERENCES `enrolments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE `enrolment_payments` ADD CONSTRAINT `enrolment_payments_payment_way_id_payment_ways_id_fk` FOREIGN KEY IF NOT EXISTS (`payment_way_id`) REFERENCES `payment_ways`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE `enrolment_payments` ADD CONSTRAINT `enrolment_payments_created_by_user_id_fk` FOREIGN KEY IF NOT EXISTS (`created_by`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- 4. Backfill: what each existing student owes in total. Instalment plans owe
-- every instalment, deposits the whole (discounted) course price. When a
-- discount was removed, it's what they'd paid plus what was then due.
-- Only students without a total yet.
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
WHERE e.`amount` IS NOT NULL AND e.`total_price` IS NULL;

-- 5. Backfill: the payment each paid student has made so far, for students
-- with no payment history yet
INSERT INTO `enrolment_payments` (`enrolment_id`, `amount`, `payment_way_id`, `paid_on`, `stripe_session_id`)
SELECT e.`id`, e.`amount`, e.`payment_way_id`, DATE(e.`created_at`),
	CASE WHEN w.`slug` = 'stripe' THEN e.`stripe_session_id` END
FROM `enrolments` e
LEFT JOIN `payment_ways` w ON w.`id` = e.`payment_way_id`
WHERE e.`status` = 'confirmed' AND e.`amount` IS NOT NULL
	AND NOT EXISTS (SELECT 1 FROM `enrolment_payments` p WHERE p.`enrolment_id` = e.`id`);

-- 6. Backfill: what was paid before a discount was removed (they then owed the rest)
INSERT INTO `enrolment_payments` (`enrolment_id`, `amount`, `paid_on`, `note`)
SELECT n.`enrolment_id`, n.`amount_paid`, DATE(e.`created_at`), 'Paid before the discount was removed'
FROM `discount_nullifications` n
JOIN `enrolments` e ON e.`id` = n.`enrolment_id`
WHERE n.`amount_paid` > 0 AND n.`amount_due` > 0
	AND NOT EXISTS (
		SELECT 1 FROM `enrolment_payments` p
		WHERE p.`enrolment_id` = n.`enrolment_id` AND p.`note` = 'Paid before the discount was removed'
	);
