CREATE TABLE `notification_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notification_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_emails_email_unique` UNIQUE(`email`)
);
