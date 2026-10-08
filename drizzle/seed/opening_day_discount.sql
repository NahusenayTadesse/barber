-- "Opening Day Discount": 50% off every course for one month,
-- from the start of 2026-10-08 to the end of 2026-11-08, UK time.
-- Times are UTC, which is how the app (Drizzle) stores and reads timestamps:
-- 2026-10-07 23:00:00 UTC = 8 Oct 00:00 BST; 2026-11-08 23:59:59 UTC = 8 Nov 23:59:59 GMT.
--
-- Safe to re-run: removes any existing discount with the same name first
-- (its course links are removed by the ON DELETE CASCADE).

DELETE FROM course_discounts WHERE name = 'Opening Day Discount';

INSERT INTO course_discounts (name, percentage, starts_at, expires_at, is_active)
VALUES ('Opening Day Discount', 50.00, '2026-10-07 23:00:00', '2026-11-08 23:59:59', true);

INSERT INTO course_discount_courses (discount_id, course_id)
SELECT d.id, c.id
FROM course_discounts d CROSS JOIN courses c
WHERE d.name = 'Opening Day Discount';
