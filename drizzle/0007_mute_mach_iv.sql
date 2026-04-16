CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`description` text,
	`image_url` varchar(255),
	`booking_link` varchar(255),
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
