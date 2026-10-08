-- Course price seed data, taken from prices.jpeg (D&D Barber Academy price sheet).
--
-- Inserts the five courses with their base prices, plus the payment options
-- from the "Payment Plan" box: 50% non-refundable deposit, the remaining 50%
-- paid in equal instalments every 2 weeks, or full payment.
--
-- Safe to re-run: courses upsert on slug; pricing_options for these courses
-- are deleted and re-inserted.

INSERT INTO courses (name, level, duration, description, base_price, slug) VALUES
('Foundation Course',
 'Beginner Friendly', '4 Weeks',
 'Clipper & scissor techniques, classic haircuts, taper & skin fades, beard trimming & shaping, health & safety, client consultation and live client experience. Includes the D&D Barber Academy Certificate.',
 1500.00, 'foundation-course'),
('Professional Course',
 'Advanced Skills', '8 Weeks',
 'Everything in the Foundation Course plus advanced fading techniques, Afro & textured hair cutting, precision beard sculpting, hot towel shaving, modern barbering styles, and barber business & marketing. Includes the D&D Professional Barber Diploma.',
 2300.00, 'professional-course'),
('Master Barber Academy Diploma',
 'The Complete Master Course', '12 Weeks',
 'Everything in the Professional Course plus mastering all fade techniques, advanced beard sculpting, hair colouring & beard colouring, hair designs & creative patterns, men''s & women''s braiding, hair relaxing & texture management, business start-up & shop management, branding, marketing & career mentoring. Includes the D&D Master Barber Academy Diploma.',
 3000.00, 'master-barber-academy-diploma'),
('Specialist Intensive Course',
 'Specialist Training', '4 Weeks',
 'Choose your specialist area: Fade Mastery, Beard Grooming & Sculpting, Hair Designs & Patterns, Hair Braiding (Men & Women), or Hair Colouring & Texture Services. Certificate of Completion.',
 1500.00, 'specialist-intensive-course'),
('International Certification Programme',
 'Internationally Recognised', '12 Weeks',
 'Includes the complete 12-Week Master Barber Academy Diploma plus an Internationally Recognised Qualification or NVQ (when available), including the required assessments and certification.',
 4200.00, 'international-certification-programme')
ON DUPLICATE KEY UPDATE
	name = VALUES(name),
	level = VALUES(level),
	duration = VALUES(duration),
	description = VALUES(description),
	base_price = VALUES(base_price),
	updated_at = now();

-- Deposit shown on the enrolment page (courses.min_price): the 50% deposit.
-- Only fills it in where it's missing, so a deposit set in the dashboard is kept.
UPDATE courses SET min_price = base_price * 0.5
WHERE min_price IS NULL AND slug IN (
	'foundation-course', 'professional-course', 'master-barber-academy-diploma',
	'specialist-intensive-course', 'international-certification-programme'
);

-- Payment options: 50% deposit, 50% balance in equal 2-weekly instalments, or full payment.
DELETE FROM pricing_options
WHERE course_id IN (SELECT id FROM courses WHERE slug IN (
	'foundation-course', 'professional-course', 'master-barber-academy-diploma',
	'specialist-intensive-course', 'international-certification-programme'
));

INSERT INTO pricing_options (course_id, type, amount, note)
SELECT c.id, 'deposit', c.base_price * 0.5,
	'50% non-refundable deposit required to secure your place.'
FROM courses c
WHERE c.slug IN ('foundation-course', 'professional-course', 'master-barber-academy-diploma',
	'specialist-intensive-course', 'international-certification-programme');

INSERT INTO pricing_options (course_id, type, amount, note)
SELECT c.id, 'instalments', c.base_price * 0.5,
	'Remaining 50% paid in equal instalments every 2 weeks throughout your course. All course fees must be paid in full before your diploma or certificate is issued.'
FROM courses c
WHERE c.slug IN ('foundation-course', 'professional-course', 'master-barber-academy-diploma',
	'specialist-intensive-course', 'international-certification-programme');

INSERT INTO pricing_options (course_id, type, amount, note)
SELECT c.id, 'full_payment', c.base_price,
	'Pay the full course fee upfront.'
FROM courses c
WHERE c.slug IN ('foundation-course', 'professional-course', 'master-barber-academy-diploma',
	'specialist-intensive-course', 'international-certification-programme');
