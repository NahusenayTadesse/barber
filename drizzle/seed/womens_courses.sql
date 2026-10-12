-- Women's hairdressing courses, plus their November 50% discount.
--
-- The Professional Course (8 weeks, £2,400) comes from the women's flyer
-- (WhatsApp Image 2026-10-12 at 1.14.00 PM.jpeg) and is the only one active.
-- The others mirror the men's courses in prices.jpeg and stay inactive (hidden
-- from the website) until their details and prices are confirmed: check them
-- in the dashboard, then set them to Active.
--
-- Safe to re-run: courses upsert on slug (resetting the fields below,
-- including Active), payment method links are only added, and the discount
-- is replaced (its course links go with it, by ON DELETE CASCADE).

INSERT INTO courses (name, audience, level, duration, description, base_price, min_price, slug, is_active) VALUES
('Women''s Hairdressing Foundation Course', 'women',
 'Beginner Friendly', '4 Weeks',
 'Washing & hair care\nBlow dry & straightening basics\nBasic braiding & cornrows\nHealth & safety\nClient consultation\nLive client experience\nD&D Academy Certificate',
 1500.00, 750.00, 'womens-hairdressing-foundation-course', false),
('Women''s Hairdressing Professional Course', 'women',
 'Professional Course', '8 Weeks (3 days per week)',
 'Washing & hair care\nStraightening & blow dry\nTraditional braiding\nHair treatments & styling\nD&D Academy Certificate',
 2400.00, 1200.00, 'womens-hairdressing-professional-course', true),
('Women''s Hairdressing Master Diploma', 'women',
 'The Complete Master Course', '12 Weeks',
 'Everything in the Professional Course\nBox braids, stitch braids & advanced braiding\nHair relaxing & texture management\nHair colouring\nBusiness start-up & salon management\nBranding, marketing & career mentoring\nD&D Master Academy Diploma',
 3000.00, 1500.00, 'womens-hairdressing-master-diploma', false),
('Women''s Specialist Intensive Course', 'women',
 'Specialist Training', '4 Weeks',
 'Choose your specialist area: Hair Braiding, Hair Colouring, or Texture Services\nCertificate of Completion',
 1500.00, 750.00, 'womens-specialist-intensive-course', false),
('Women''s International Certification Programme', 'women',
 'Internationally Recognised', '12 Weeks',
 'The complete 12-Week Women''s Hairdressing Master Diploma\nAn Internationally Recognised Qualification or NVQ (when available), including the required assessments and certification',
 4200.00, 2100.00, 'womens-international-certification-programme', false)
ON DUPLICATE KEY UPDATE
	name = VALUES(name),
	audience = VALUES(audience),
	level = VALUES(level),
	duration = VALUES(duration),
	description = VALUES(description),
	base_price = VALUES(base_price),
	min_price = VALUES(min_price),
	is_active = VALUES(is_active),
	updated_at = now();

-- Offer every enabled payment method (deposit, instalments, pay in full)
INSERT IGNORE INTO course_payment_methods (course_id, method_id)
SELECT c.id, m.id
FROM courses c CROSS JOIN payment_methods m
WHERE m.is_active = true AND c.slug IN (
	'womens-hairdressing-foundation-course', 'womens-hairdressing-professional-course',
	'womens-hairdressing-master-diploma', 'womens-specialist-intensive-course',
	'womens-international-certification-programme'
);

-- "Only for November registrations": 50% off the Professional Course
-- (£2,400 -> £1,200), from today until the end of November, UK time.
-- Times are UTC, which is how the app stores and reads timestamps:
-- 2026-10-11 23:00:00 UTC = 12 Oct 00:00 BST; 2026-11-30 23:59:59 UTC = 30 Nov 23:59:59 GMT.
DELETE FROM course_discounts WHERE name = 'November Registrations';

INSERT INTO course_discounts (name, percentage, starts_at, expires_at, is_active)
VALUES ('November Registrations', 50.00, '2026-10-11 23:00:00', '2026-11-30 23:59:59', true);

INSERT INTO course_discount_courses (discount_id, course_id)
SELECT d.id, c.id
FROM course_discounts d CROSS JOIN courses c
WHERE d.name = 'November Registrations'
	AND c.slug = 'womens-hairdressing-professional-course';
