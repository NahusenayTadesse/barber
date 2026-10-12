-- How students pay: Stripe (online), Bank Transfer or Cash.
--
-- The table itself is the Drizzle migration drizzle/0020_payment_ways.sql.
-- The app finds Stripe by its slug, so keep the slugs as they are; the names
-- can be changed freely.
--
-- Safe to re-run: upserts on slug, and the backfill only fills in enrolments
-- that have no payment way yet.

INSERT INTO payment_ways (name, slug, sort_order) VALUES
('Stripe', 'stripe', 0),
('Bank Transfer', 'bank_transfer', 1),
('Cash', 'cash', 2)
ON DUPLICATE KEY UPDATE
	name = VALUES(name),
	sort_order = VALUES(sort_order),
	updated_at = now();

-- Students who already paid through a Stripe checkout. Paid students
-- registered in the dashboard are left for staff to set (Bank Transfer or Cash).
UPDATE enrolments
SET payment_way_id = (SELECT id FROM payment_ways WHERE slug = 'stripe')
WHERE payment_way_id IS NULL
	AND status = 'confirmed'
	AND stripe_session_id IS NOT NULL;
