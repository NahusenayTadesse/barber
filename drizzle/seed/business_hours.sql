-- Business hours seed data.
--
-- The table itself is tracked as a Drizzle migration
-- (drizzle/0009_dusty_lilandra.sql). This file is a standalone,
-- idempotent script for (re)seeding it with D&D Barber & Academy's
-- opening hours. Edit these from the dashboard at /dashboard/hours,
-- or update this file to match the Google Business Profile.
--
-- Safe to re-run: upsert on day_of_week.

-- day_of_week follows JS Date#getDay(): 0 = Sunday ... 6 = Saturday
-- sort_order is Monday-first display order (0-6)
INSERT INTO business_hours (day_of_week, day_label, sort_order, is_closed, opens_label, closes_label) VALUES
(1, 'Monday',    0, false, '9AM', '6PM'),
(2, 'Tuesday',   1, false, '9AM', '6PM'),
(3, 'Wednesday', 2, false, '9AM', '6PM'),
(4, 'Thursday',  3, false, '9AM', '6PM'),
(5, 'Friday',    4, false, '9AM', '6PM'),
(6, 'Saturday',  5, false, '9AM', '6PM'),
(0, 'Sunday',    6, true,  NULL,  NULL)
ON DUPLICATE KEY UPDATE
	day_label = VALUES(day_label),
	sort_order = VALUES(sort_order),
	is_closed = VALUES(is_closed),
	opens_label = VALUES(opens_label),
	closes_label = VALUES(closes_label),
	updated_at = now();
