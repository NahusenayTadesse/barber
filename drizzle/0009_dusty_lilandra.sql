CREATE TABLE `business_hours` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day_of_week` int NOT NULL,
	`day_label` varchar(20) NOT NULL,
	`sort_order` int NOT NULL,
	`is_closed` boolean NOT NULL DEFAULT false,
	`opens_label` varchar(20),
	`closes_label` varchar(20),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_hours_id` PRIMARY KEY(`id`),
	CONSTRAINT `business_hours_day_of_week_idx` UNIQUE(`day_of_week`)
);
