-- =====================================================================
-- MediMind seed 001 — global reference data
-- Load after migrations 0006–0009. Safe to re-run (ON CONFLICT DO NOTHING).
-- SQL Server: replace "ON CONFLICT (id) DO NOTHING" with a MERGE or
-- "IF NOT EXISTS" guard; all other syntax is portable.
-- Fixed UUIDs make cross-file references and SQL Server migration predictable.
-- =====================================================================

-- ---------- roles ----------
INSERT INTO public.role (id, code, name, description) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'admin',        'Administrator', 'Tenant configuration, users, subscription and features'),
  ('b1000000-0000-4000-8000-000000000002', 'clinician',    'Clinician',     'Clinical workspace: patients, charting, orders and AI review'),
  ('b1000000-0000-4000-8000-000000000003', 'doctor',       'Doctor',        'Physician with prescribing and diagnosis rights'),
  ('b1000000-0000-4000-8000-000000000004', 'nurse',        'Nurse',         'Nursing documentation, vitals and medication administration'),
  ('b1000000-0000-4000-8000-000000000005', 'receptionist', 'Front Desk',    'Registration, appointments, walk-ins and service billing')
ON CONFLICT (id) DO NOTHING;

-- ---------- subscription plans ----------
INSERT INTO public.subscription_plan (id, code, name, monthly_price, currency_code, max_facilities, max_users) VALUES
  ('b2000000-0000-4000-8000-000000000001', 'STARTER',      'Starter',      1500.00, 'AED', 1,   15),
  ('b2000000-0000-4000-8000-000000000002', 'PROFESSIONAL', 'Professional', 4500.00, 'AED', 3,   75),
  ('b2000000-0000-4000-8000-000000000003', 'ENTERPRISE',   'Enterprise',  12000.00, 'AED', 25, 1000)
ON CONFLICT (id) DO NOTHING;

-- ---------- features ----------
INSERT INTO public.feature (id, code, name, description) VALUES
  ('b3000000-0000-4000-8000-000000000001', 'AI_INSIGHTS',       'AI Insights',              'Clinical decision support and care pathways on the patient record'),
  ('b3000000-0000-4000-8000-000000000002', 'PEDO_CHART',        'Pedodontics chart',        'Mixed-dentition odontogram with tooth-surface findings'),
  ('b3000000-0000-4000-8000-000000000003', 'AI_DENTAL_SUMMARY', 'AI pediatric dental plan', 'Case-grounded AI treatment summary with clinician approval'),
  ('b3000000-0000-4000-8000-000000000004', 'DENTAL_IMAGING',    'Dental imaging',           'X-ray and photo attachments on the dental chart'),
  ('b3000000-0000-4000-8000-000000000005', 'CASE_LIBRARY',      'Case library',             'Clinic-uploaded reference cases for AI grounding'),
  ('b3000000-0000-4000-8000-000000000006', 'SERVICE_BILLING',   'Service billing',          'Front-desk invoicing against the service price list')
ON CONFLICT (id) DO NOTHING;
