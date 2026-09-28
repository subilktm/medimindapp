-- =====================================================================
-- MediMind seed 002 — demo tenant, staff, logins and three demo patients
-- Load after 001_reference_data.sql. Safe to re-run (ON CONFLICT DO NOTHING).
-- All timestamps are UTC (Dubai local time minus 4 hours).
-- auth_user_id values reference the existing sign-in accounts
-- (admin / clinician / reception); no foreign key into the auth system.
-- =====================================================================

-- ---------- tenant, facility, departments ----------
INSERT INTO public.tenant (id, code, name, country_code, time_zone) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'MEDIMIND-DEMO', 'MediMind Demo Health', 'AE', 'Asia/Dubai')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.facility (id, tenant_id, code, name, license_no, address, phone) VALUES
  ('a2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'DXB-01', 'MediMind Dubai Clinic', 'DHA-F-0042871', 'Healthcare City, Building 27, Dubai', '+971 4 555 0100')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.department (id, tenant_id, facility_id, code, name, specialty) VALUES
  ('a3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'CARD',  'Cardiology',          'Cardiology'),
  ('a3000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'RESP',  'Respiratory',         'Pulmonology'),
  ('a3000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'IMED',  'Internal medicine',   'Internal medicine'),
  ('a3000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'HTN',   'Hypertension clinic', 'Internal medicine'),
  ('a3000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'ALRG',  'Allergy clinic',      'Allergy and immunology'),
  ('a3000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'PEDO',  'Pediatric dentistry', 'Pedodontics'),
  ('a3000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'FRONT', 'Front office',        NULL)
ON CONFLICT (id) DO NOTHING;

-- ---------- staff (clinical person records) ----------
INSERT INTO public.staff_member (id, tenant_id, facility_id, first_name, last_name, title, profession, specialty, license_no, email, phone) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Lena',   'Hart',          'Dr.', 'Physician',     'Consultant Cardiologist',  'DHA-P-118204', 'lena.hart@medimind.local',   '+971 50 100 2001'),
  ('c1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Maria',  'Santos',        NULL,  'Nurse',         'Primary nurse',            'DHA-N-220931', 'maria.santos@medimind.local', '+971 50 100 2002'),
  ('c1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Nabil',  'Rahman',        'Dr.', 'Physician',     'Consulting Nephrologist',  'DHA-P-104377', 'nabil.rahman@medimind.local', '+971 50 100 2003'),
  ('c1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'Front',  'Desk',          NULL,  'FrontDesk',     'Reception',                NULL,           'reception@medimind.local',    '+971 4 555 0101'),
  ('c1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'System', 'Administrator', NULL,  'Administrator', 'IT administration',        NULL,           'admin@medimind.local',        '+971 4 555 0102')
ON CONFLICT (id) DO NOTHING;

-- ---------- login accounts (linked to existing sign-in users) ----------
INSERT INTO public.user_account (id, tenant_id, auth_user_id, username, staff_member_id) VALUES
  ('c2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'cdbde6fc-c67d-4d88-b46a-5ddfabcf6783', 'admin',     'c1000000-0000-4000-8000-000000000005'),
  ('c2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'fc09632f-206f-4c44-b22a-c0860758d05e', 'clinician', 'c1000000-0000-4000-8000-000000000001'),
  ('c2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', '751350a1-ae23-493b-99cc-98b51d99929c', 'reception', 'c1000000-0000-4000-8000-000000000004')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_account_role (id, tenant_id, user_account_id, role_id, facility_id) VALUES
  ('c3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', NULL),
  ('c3000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000001'),
  ('c3000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000005', 'a2000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ---------- subscription and features ----------
INSERT INTO public.tenant_subscription (id, tenant_id, subscription_plan_id, starts_on, ends_on, status) VALUES
  ('c4000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000002', '2026-01-01', '2026-12-31', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tenant_feature (id, tenant_id, feature_id, is_enabled) VALUES
  ('c5000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000001', TRUE),
  ('c5000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000002', TRUE),
  ('c5000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000003', TRUE),
  ('c5000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000004', TRUE),
  ('c5000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000005', TRUE),
  ('c5000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'b3000000-0000-4000-8000-000000000006', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ---------- service price list ----------
INSERT INTO public.service_item (id, tenant_id, code, name, category, unit_price) VALUES
  ('c6000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'CONS-CARD', 'Cardiology consultation',  'Consultation', 450.00),
  ('c6000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'ECG-12',    'ECG 12 lead',              'Diagnostics',  180.00),
  ('c6000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'LAB-TROP',  'Troponin I',               'Laboratory',   220.00),
  ('c6000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'RAD-CXR',   'Chest X-ray',              'Radiology',    260.00),
  ('c6000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'DEN-EXAM',  'Pediatric dental exam',    'Dental',       200.00),
  ('c6000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'DEN-FLUOR', 'Fluoride varnish',         'Dental',       150.00),
  ('c6000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'IP-BEDDAY', 'Inpatient bed day',        'Inpatient',    900.00)
ON CONFLICT (id) DO NOTHING;

-- ---------- patients ----------
INSERT INTO public.patient (id, tenant_id, facility_id, mrn, first_name, last_name, date_of_birth, sex, blood_group, mobile) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'MM-92031', 'Emma',   'Thompson',  '1984-05-14', 'Female', 'O+', '+971 50 234 8102'),
  ('d1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'MM-92045', 'Marcus', 'Vance',     '1958-02-02', 'Male',   'A+', '+971 55 610 4420'),
  ('d1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'MM-92058', 'Elena',  'Rodriguez', '1996-11-22', 'Female', 'B+', '+971 52 481 9033')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_contact (id, tenant_id, patient_id, contact_type, full_name, relationship, phone, national_id, is_legal_guardian) VALUES
  ('d2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Emergency', 'Sara Thompson', 'Sister', '+971 50 234 8102', '784-1988-2213045-7', FALSE),
  ('d2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'NextOfKin', 'Helen Vance',   'Wife',   '+971 55 610 4421', NULL, FALSE),
  ('d2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Emergency', 'Lucia Rodriguez', 'Sister', '+971 52 481 9034', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_allergy (id, tenant_id, patient_id, allergen, reaction, severity, recorded_on, recorded_by_staff_id) VALUES
  ('d3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Penicillin',          'Widespread itchy rash (urticaria)',  'Moderate', '2003-01-01', 'c1000000-0000-4000-8000-000000000001'),
  ('d3000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'No known allergies',  'Confirmed with patient on admission', 'None',     '2026-09-19', 'c1000000-0000-4000-8000-000000000001'),
  ('d3000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Sulfonamides',        'Flat red rash across the trunk',     'Moderate', '2015-01-01', 'c1000000-0000-4000-8000-000000000001'),
  ('d3000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Pollen (seasonal)',   'Sneezing, itchy eyes',               'Mild',     '2024-04-14', 'c1000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_insurance (id, tenant_id, patient_id, payer_name, policy_no, member_no, eligibility_status, valid_from, valid_to) VALUES
  ('d4000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'MediMind Health', 'DH-2024-77821', 'MMH-0092031', 'Verified', '2026-01-01', '2026-12-31'),
  ('d4000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'MediMind Health', 'DH-2023-51204', 'MMH-0092045', 'Verified', '2026-01-01', '2026-12-31'),
  ('d4000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'MediMind Health', 'DH-2025-90133', 'MMH-0092058', 'Verified', '2026-01-01', '2026-12-31')
ON CONFLICT (id) DO NOTHING;

-- ---------- clinical history ----------
INSERT INTO public.patient_history_entry (id, tenant_id, patient_id, category, description, relation, onset_text, status, facility_name, notes, is_flagged) VALUES
  -- Emma
  ('d5000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'PastMedical', 'Essential hypertension', NULL, '03 Mar 2021', 'Controlled', NULL, 'Home readings mostly below 135/85 on amlodipine.', FALSE),
  ('d5000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'PastMedical', 'Dyslipidemia', NULL, '12 Nov 2022', 'Ongoing', NULL, 'LDL above target; diet and activity plan in place.', FALSE),
  ('d5000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'PastMedical', 'Gestational diabetes', NULL, 'Jun 2014', 'Resolved', NULL, 'Diet-controlled; normal postpartum glucose tolerance test.', FALSE),
  ('d5000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Surgical', 'Coronary angiography (right radial access)', NULL, '15 Sep 2026', NULL, 'MediMind Cardiology', 'No significant stenosis requiring intervention.', FALSE),
  ('d5000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Surgical', 'Laparoscopic appendicectomy', NULL, 'Aug 2009', NULL, 'City General Hospital', 'Uncomplicated recovery.', FALSE),
  ('d5000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Family', 'Myocardial infarction', 'Father', 'Age 58', NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Family', 'Type 2 diabetes', 'Mother', 'Age 61', NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Social', 'Smoking: never smoked', NULL, NULL, NULL, NULL, NULL, FALSE),
  ('d5000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Social', 'Alcohol: occasional, under 4 units per week', NULL, NULL, NULL, NULL, NULL, FALSE),
  ('d5000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Social', 'Occupation: secondary school teacher', NULL, NULL, NULL, NULL, NULL, FALSE),
  ('d5000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Screening', 'Mammogram: normal (BI-RADS 1)', NULL, 'Jan 2026', NULL, NULL, NULL, FALSE),
  ('d5000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Screening', 'HbA1c: 5.6%', NULL, 'May 2026', NULL, NULL, NULL, FALSE),
  -- Marcus
  ('d5000000-0000-4000-8000-000000000013', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'PastMedical', 'Essential hypertension', NULL, '08 Jan 2018', 'Ongoing', NULL, 'Variable control linked to missed evening doses.', FALSE),
  ('d5000000-0000-4000-8000-000000000014', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'PastMedical', 'Osteoarthritis, both knees', NULL, '2016', 'Ongoing', NULL, 'Right knee replaced; left knee managed with physiotherapy.', FALSE),
  ('d5000000-0000-4000-8000-000000000015', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'PastMedical', 'Benign prostatic hyperplasia', NULL, '2020', 'Controlled', NULL, 'Mild symptoms; no current medication.', FALSE),
  ('d5000000-0000-4000-8000-000000000016', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Surgical', 'Right total knee replacement', NULL, 'Apr 2019', NULL, 'MediMind Orthopaedics', 'Good function; uses a cane on long walks.', FALSE),
  ('d5000000-0000-4000-8000-000000000017', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Surgical', 'Left inguinal hernia repair', NULL, '1998', NULL, 'City General Hospital', 'No recurrence.', FALSE),
  ('d5000000-0000-4000-8000-000000000018', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Family', 'Stroke', 'Father', 'Age 72', NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000019', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Family', 'Atrial fibrillation', 'Brother', 'Age 65', NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000020', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Social', 'Smoking: ex-smoker, 20 pack-years, quit 2010', NULL, NULL, NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000021', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Social', 'Mobility: independent; cane for longer distances', NULL, NULL, NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000022', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Screening', 'CHA2DS2-VASc score 2 - review needed', NULL, '19 Sep 2026', NULL, NULL, NULL, TRUE),
  -- Elena
  ('d5000000-0000-4000-8000-000000000023', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'PastMedical', 'Childhood asthma', NULL, '2001', 'Resolved', NULL, 'No inhaler use since age 12 until current admission.', FALSE),
  ('d5000000-0000-4000-8000-000000000024', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'PastMedical', 'Seasonal allergic rhinitis', NULL, '14 Apr 2024', 'Controlled', NULL, 'Spring symptoms; antihistamine when needed.', FALSE),
  ('d5000000-0000-4000-8000-000000000025', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'PastMedical', 'Iron deficiency anaemia', NULL, '2022', 'Resolved', NULL, 'Treated with three months of oral iron.', FALSE),
  ('d5000000-0000-4000-8000-000000000026', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Surgical', 'Tonsillectomy', NULL, '2004', NULL, 'Children''s Hospital', 'Childhood procedure; no complications.', FALSE),
  ('d5000000-0000-4000-8000-000000000027', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Family', 'Asthma', 'Mother', 'Childhood', NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000028', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Social', 'Environment: lives with a pet cat; possible allergen', NULL, NULL, NULL, NULL, NULL, TRUE),
  ('d5000000-0000-4000-8000-000000000029', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Screening', 'Cervical screening: normal', NULL, 'Aug 2025', NULL, NULL, NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.patient_immunization (id, tenant_id, patient_id, vaccine, administered_on, administered_text, dose_no, status) VALUES
  ('d6000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Influenza',              '2025-10-01', 'Oct 2025', NULL, 'UpToDate'),
  ('d6000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'COVID-19 booster',       '2024-11-01', 'Nov 2024', NULL, 'UpToDate'),
  ('d6000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Tdap',                   '2019-02-01', 'Feb 2019', NULL, 'UpToDate'),
  ('d6000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'Hepatitis B',            NULL,         '2005',     3,    'CompletedSeries'),
  ('d6000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Influenza',              '2025-10-01', 'Oct 2025', NULL, 'UpToDate'),
  ('d6000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Pneumococcal (PCV20)',   '2024-03-01', 'Mar 2024', 1,    'CompletedSeries'),
  ('d6000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'Shingles (recombinant)', NULL,         '2023',     2,    'CompletedSeries'),
  ('d6000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'COVID-19 booster',       '2024-10-01', 'Oct 2024', NULL, 'UpToDate'),
  ('d6000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Influenza',              NULL,         'Not given in 2025', NULL, 'Due'),
  ('d6000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'COVID-19',               '2023-12-01', 'Dec 2023', NULL, 'Due'),
  ('d6000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'HPV',                    NULL,         '2010',     3,    'CompletedSeries'),
  ('d6000000-0000-4000-8000-000000000012', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'Tdap',                   '2021-06-01', 'Jun 2021', NULL, 'UpToDate')
ON CONFLICT (id) DO NOTHING;

-- ---------- appointments (UTC) ----------
INSERT INTO public.appointment (id, tenant_id, facility_id, department_id, patient_id, staff_member_id, scheduled_start, scheduled_end, reason, status) VALUES
  ('e2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '2026-09-25 06:00:00', '2026-09-25 06:30:00', 'Cardiology review', 'Confirmed'),
  ('e2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', '2026-10-08 05:30:00', '2026-10-08 06:00:00', 'Blood pressure and renal profile follow-up', 'Scheduled'),
  ('e2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', '2026-09-25 07:00:00', '2026-09-25 07:30:00', 'Respiratory clinic follow-up', 'Scheduled')
ON CONFLICT (id) DO NOTHING;

-- ---------- encounters (UTC) ----------
INSERT INTO public.encounter (id, tenant_id, facility_id, department_id, patient_id, attending_staff_id, encounter_no, encounter_type, status, admitted_at, discharged_at, room, chief_complaint, summary, disposition, follow_up) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'IP-2026-0915-008', 'Inpatient',  'Active',    '2026-09-15 05:20:00', NULL, 'C-214', 'Chest discomfort and shortness of breath', 'Admitted for monitored recovery after cardiac catheterisation. Pain is improving, observations are stable and the puncture site remains clean.', 'Continue inpatient cardiology observation in room C-214.', 'Cardiology review on 25 Sep 2026 at 10:00 AM.'),
  ('e1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'OP-2026-0827-116', 'Outpatient', 'Completed', '2026-08-27 10:15:00', '2026-08-27 11:00:00', NULL, 'Intermittent exertional chest pressure', 'Reviewed recurrent exertional symptoms. ECG was unchanged; elective coronary angiography was planned after shared decision-making.', 'Discharged home after consultation.', 'Return for planned angiography on 15 Sep 2026.'),
  ('e1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000003', 'd1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'OP-2026-0512-064', 'Outpatient', 'Completed', '2026-05-12 07:30:00', '2026-05-12 08:15:00', NULL, 'Routine hypertension review', 'Routine chronic-disease review found acceptable home readings and elevated LDL cholesterol without treatment complications.', 'Routine outpatient discharge.', 'Review in three months with home blood-pressure log.'),
  ('e1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'IP-2026-0919-014', 'Inpatient',  'Active',    '2026-09-19 03:45:00', NULL, 'C-208', 'Syncope with irregular heartbeat', 'Admitted after an unwitnessed syncopal episode with rapid atrial fibrillation. Rate is improving under telemetry; no recurrent loss of consciousness.', 'Continue monitored inpatient care in room C-208.', 'Consultant review after echocardiogram and rhythm trend.'),
  ('e1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000004', 'd1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000003', 'OP-2026-0606-081', 'Outpatient', 'Completed', '2026-06-06 05:10:00', '2026-06-06 06:00:00', NULL, 'Blood-pressure medication review', 'Reviewed variable home blood-pressure readings. Medication adherence and measurement technique were reinforced.', 'Discharged home.', 'Primary-care blood-pressure review in four weeks.'),
  ('e1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000002', 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'IP-2026-0921-003', 'Inpatient',  'Active',    '2026-09-21 02:30:00', NULL, 'R-116', 'Persistent cough, fever and wheezing', 'Admitted with acute bronchitis and wheeze. Oxygen saturation is borderline but stable; treatment response is under review.', 'Continue respiratory observation in room R-116.', 'Respiratory review later today and clinic follow-up on 25 Sep 2026.'),
  ('e1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'a3000000-0000-4000-8000-000000000005', 'd1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000001', 'OP-2024-0414-129', 'Outpatient', 'Completed', '2024-04-14 12:00:00', '2024-04-14 12:45:00', NULL, 'Seasonal sneezing and nasal congestion', 'Seasonal allergic rhinitis diagnosed and treated conservatively, with good symptom control reported afterward.', 'Discharged from clinic.', 'Review as needed during allergy season.')
ON CONFLICT (id) DO NOTHING;

-- ---------- SOAP notes ----------
INSERT INTO public.clinical_note (id, tenant_id, encounter_id, author_staff_id, note_type, subjective, objective, assessment, plan_of_care, signed_at) VALUES
  ('e3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'SOAP', 'Reports mild central discomfort on movement and no pain at rest. Denies dizziness, palpitations or worsening breathlessness.', 'Alert and comfortable at rest. Cardiovascular observations stable. Right radial access site clean, dry and neurovascularly intact.', 'Expected post-procedural discomfort with no current evidence of access-site complication or acute cardiac instability.', 'Continue telemetry, reassess pain after analgesia, review pending troponin and encourage assisted mobilisation.', '2026-09-21 05:30:00'),
  ('e3000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'SOAP', 'Two weeks of chest pressure when climbing stairs, relieved within five minutes of rest. No syncope or rest pain.', 'Regular pulse, clear chest and no peripheral oedema. Resting ECG without acute ischaemic change.', 'Stable exertional symptoms requiring anatomical assessment; blood pressure above target.', 'Arrange elective angiography, continue aspirin and amlodipine, and provide emergency symptom advice.', '2026-08-27 11:00:00'),
  ('e3000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000003', 'SOAP', 'Taking medication consistently. No headache, ankle swelling or postural symptoms.', 'Clinic blood pressure close to target; cardiovascular and respiratory examinations unremarkable.', 'Hypertension controlled on current therapy. Dyslipidemia requires repeat assessment.', 'Continue current therapy, reinforce diet and activity advice, and repeat fasting lipid profile.', '2026-05-12 08:15:00'),
  ('e3000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'SOAP', 'Describes sudden light-headedness before briefly losing consciousness. No current chest pain or focal neurological symptoms.', 'Irregular tachycardia on examination. Neurological examination is non-focal and orthostatic observations are pending.', 'Syncope likely related to uncontrolled atrial fibrillation; requires rhythm monitoring and stroke-risk assessment.', 'Continue telemetry, obtain repeat ECG and electrolytes, assess anticoagulation eligibility and institute falls precautions.', '2026-09-19 05:00:00'),
  ('e3000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000005', 'c1000000-0000-4000-8000-000000000003', 'SOAP', 'Occasional missed evening doses; no chest pain, headache or exertional dyspnoea.', 'Mildly elevated clinic blood pressure with otherwise normal cardiovascular examination.', 'Suboptimal blood-pressure control associated with inconsistent medication timing.', 'Use a daily medication reminder, record twice-daily readings for two weeks and review before dose escalation.', '2026-06-06 06:00:00'),
  ('e3000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'SOAP', 'Three days of productive cough, fever and chest tightness. Reports partial relief after inhaled bronchodilator.', 'Low-grade fever with scattered expiratory wheeze. Speaking full sentences with no accessory-muscle use.', 'Acute bronchitis with bronchospasm and mild oxygen desaturation; no focal consolidation on initial imaging.', 'Continue bronchodilator, repeat oxygen saturation and temperature, maintain hydration and escalate if respiratory effort increases.', '2026-09-21 04:00:00'),
  ('e3000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000007', 'c1000000-0000-4000-8000-000000000001', 'SOAP', 'Recurrent sneezing, itchy eyes and clear nasal discharge during spring. No wheeze or nocturnal cough.', 'Pale nasal mucosa and clear secretions. Chest clear on auscultation.', 'Seasonal allergic rhinitis without lower-airway involvement.', 'Start allergen avoidance measures and non-sedating antihistamine; return if wheeze develops.', '2024-04-14 12:45:00')
ON CONFLICT (id) DO NOTHING;

-- ---------- latest vitals (21 Sep 2026 08:00 Dubai) ----------
INSERT INTO public.vital_sign_set (id, tenant_id, patient_id, encounter_id, recorded_at, recorded_by_staff_id, systolic_mmhg, diastolic_mmhg, pulse_bpm, temperature_c, spo2_percent, respiratory_rate, pain_score) VALUES
  ('e4000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', '2026-09-21 04:00:00', 'c1000000-0000-4000-8000-000000000002', 138, 86, 88,  37.2, 97, 18, 4),
  ('e4000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', '2026-09-21 04:00:00', 'c1000000-0000-4000-8000-000000000002', 144, 90, 104, 36.8, 95, 20, 1),
  ('e4000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', '2026-09-21 04:00:00', 'c1000000-0000-4000-8000-000000000002', 118, 76, 92,  38.1, 94, 22, 2)
ON CONFLICT (id) DO NOTHING;

-- ---------- diagnoses ----------
INSERT INTO public.diagnosis (id, tenant_id, patient_id, encounter_id, icd10_code, description, diagnosis_type, status, onset_date, resolved_date, recorded_by_staff_id) VALUES
  ('e5000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'G89.18', 'Post-operative pain',        'Primary',   'Active',   '2026-09-15', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'I10',    'Essential hypertension',     'Secondary', 'Active',   '2021-03-03', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'E78.5',  'Dyslipidemia',               'Secondary', 'Active',   '2022-11-12', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'I48.91', 'Atrial fibrillation',        'Primary',   'Active',   '2026-09-19', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'R55',    'Syncope and collapse',       'Secondary', 'Active',   '2026-09-19', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'I10',    'Essential hypertension',     'Secondary', 'Active',   '2018-01-08', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'J20.9',  'Acute bronchitis',           'Primary',   'Active',   '2026-09-21', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'R06.2',  'Wheezing',                   'Secondary', 'Active',   '2026-09-20', NULL, 'c1000000-0000-4000-8000-000000000001'),
  ('e5000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000007', 'J30.2',  'Seasonal allergic rhinitis', 'Primary',   'Resolved', '2024-04-14', '2024-06-30', 'c1000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ---------- clinical orders and results ----------
INSERT INTO public.clinical_order (id, tenant_id, facility_id, patient_id, encounter_id, ordered_by_staff_id, order_type, name, priority, status, ordered_at) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Procedure', 'ECG 12 Lead',          'Urgent',  'Completed', '2026-09-15 05:40:00'),
  ('f1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Lab',       'Troponin I',           'Urgent',  'Pending',   '2026-09-21 05:20:00'),
  ('f1000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Lab',       'Lipid profile',        'Routine', 'Ordered',   '2026-09-21 05:25:00'),
  ('f1000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Procedure', 'Coronary angiography', 'Routine', 'Completed', '2026-08-27 10:50:00'),
  ('f1000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000001', 'Lab',       'Renal profile',        'Routine', 'Completed', '2026-08-27 10:50:00'),
  ('f1000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Procedure', 'ECG 12 Lead',          'Urgent',  'Completed', '2026-09-19 04:00:00'),
  ('f1000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Lab',       'Electrolytes',         'Urgent',  'Pending',   '2026-09-21 04:30:00'),
  ('f1000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Imaging',   'Echocardiogram',       'Routine', 'Ordered',   '2026-09-21 04:35:00'),
  ('f1000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Imaging',   'Chest X-Ray',          'Urgent',  'Completed', '2026-09-21 02:45:00'),
  ('f1000000-0000-4000-8000-000000000010', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Lab',       'Full blood count',     'Routine', 'Pending',   '2026-09-21 03:00:00'),
  ('f1000000-0000-4000-8000-000000000011', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Procedure', 'Repeat SpO2',          'Urgent',  'Ordered',   '2026-09-21 06:40:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_result (id, tenant_id, clinical_order_id, result_name, result_value, unit, reference_range, abnormal_flag, resulted_at, verified_by_staff_id) VALUES
  ('f2000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 'ECG interpretation', 'Sinus rhythm, no acute ST changes', NULL,      NULL,       'Normal', '2026-09-15 06:00:00', 'c1000000-0000-4000-8000-000000000001'),
  ('f2000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000005', 'Creatinine',         '72',                                'umol/L',  '45-90',    'Normal', '2026-08-27 14:00:00', 'c1000000-0000-4000-8000-000000000003'),
  ('f2000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000006', 'ECG interpretation', 'Atrial fibrillation, ventricular rate 118 bpm', NULL, NULL,     'High',   '2026-09-19 04:15:00', 'c1000000-0000-4000-8000-000000000001'),
  ('f2000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000009', 'Chest X-ray report', 'No focal consolidation; mild peribronchial thickening', NULL, NULL, 'Normal', '2026-09-21 03:30:00', 'c1000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ---------- medication orders and administrations ----------
INSERT INTO public.medication_order (id, tenant_id, patient_id, encounter_id, prescriber_staff_id, drug_name, strength, dose_form, route, frequency, status, indication, start_date, monitoring, hold_criteria, safety_note) VALUES
  ('f3000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Aspirin',            '75 mg',                  'Tablet',              'Oral',    'Once daily at 08:00',                   'Active', 'Post-catheterisation antiplatelet therapy', '2026-09-15', 'Bleeding, bruising, dyspepsia and platelet count if clinically indicated.', 'Hold and escalate if active bleeding, suspected allergy or urgent procedure planned.', 'No aspirin allergy recorded; confirm no additional over-the-counter NSAID use.'),
  ('f3000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Amlodipine',         '5 mg',                   'Tablet',              'Oral',    'Once daily at 20:00',                   'Active', 'Essential hypertension', '2021-03-03', 'Blood pressure trend, ankle swelling, dizziness and postural symptoms.', 'Hold if systolic BP is below 100 mmHg or symptomatic hypotension occurs.', 'Current BP remains above target; continue daily trend review.'),
  ('f3000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Paracetamol',        '500 mg',                 'Tablet',              'Oral',    'Every 6 hours when required',           'PRN',    'Post-operative pain', '2026-09-15', 'Pain score, total daily dose and liver-risk history.', 'Do not exceed 4 g in 24 hours; hold if liver injury is suspected.', 'Pain score is moderate; reassess 30-60 minutes after each dose.'),
  ('f3000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Bisoprolol',         '2.5 mg',                 'Tablet',              'Oral',    'Once daily at 09:00',                   'Active', 'Rate control for atrial fibrillation', '2026-09-19', 'Heart rate, blood pressure, dizziness, bronchospasm and rhythm trend.', 'Hold if pulse is below 55 bpm, systolic BP below 100 mmHg or symptomatic bradycardia occurs.', 'Pulse remains elevated; ECG review is scheduled today.'),
  ('f3000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000003', 'Amlodipine',         '5 mg',                   'Tablet',              'Oral',    'Once daily at 20:00',                   'Active', 'Essential hypertension', '2018-01-08', 'Blood pressure trend, oedema and postural symptoms.', 'Hold if systolic BP is below 100 mmHg or the patient is symptomatic.', 'No recorded allergy conflict; reconcile home supply before discharge.'),
  ('f3000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000002', 'e1000000-0000-4000-8000-000000000004', 'c1000000-0000-4000-8000-000000000001', 'Paracetamol',        '500 mg',                 'Tablet',              'Oral',    'Every 6 hours when required',           'PRN',    'Mild discomfort during admission', '2026-09-19', 'Pain score and total daily dose.', 'Do not exceed 4 g in 24 hours; hold if liver injury is suspected.', 'Pain score is mild; non-pharmacological comfort measures remain appropriate.'),
  ('f3000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Salbutamol inhaler', '100 micrograms per puff', 'Metered-dose inhaler', 'Inhaled', '2 puffs every 4-6 hours when required', 'PRN',    'Wheeze and bronchospasm', '2026-09-21', 'Respiratory rate, SpO2, tremor, tachycardia and response after administration.', 'Escalate before repeat dosing if worsening work of breathing or SpO2 falls below target.', 'Current SpO2 is borderline; repeat saturation is ordered.'),
  ('f3000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Paracetamol',        '500 mg',                 'Tablet',              'Oral',    'Every 6 hours when required',           'PRN',    'Fever and mild chest discomfort', '2026-09-21', 'Temperature trend, pain score and total daily dose.', 'Do not exceed 4 g in 24 hours; hold if liver injury is suspected.', 'Sulfonamide allergy does not conflict with the current medication list.'),
  ('f3000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000003', 'e1000000-0000-4000-8000-000000000006', 'c1000000-0000-4000-8000-000000000001', 'Loratadine',         '10 mg',                  'Tablet',              'Oral',    'Once daily when required',              'Held',   'Seasonal allergic rhinitis', '2024-04-14', 'Sedation, nasal symptoms and overlap with acute respiratory complaints.', 'Hold during acute assessment unless symptoms require treatment.', 'Held during inpatient respiratory observation to keep symptom assessment clear.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.medication_administration (id, tenant_id, medication_order_id, administered_at, administered_by_staff_id, dose_given, status, note) VALUES
  ('f4000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000001', '2026-09-21 04:05:00', 'c1000000-0000-4000-8000-000000000002', '75 mg',   'Given', NULL),
  ('f4000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000002', '2026-09-20 16:02:00', 'c1000000-0000-4000-8000-000000000002', '5 mg',    'Given', NULL),
  ('f4000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000003', '2026-09-21 05:10:00', 'c1000000-0000-4000-8000-000000000002', '500 mg',  'Given', 'Pain 5/10 before dose'),
  ('f4000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000004', '2026-09-21 05:00:00', 'c1000000-0000-4000-8000-000000000002', '2.5 mg',  'Given', 'Pulse 104 bpm before dose'),
  ('f4000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000005', '2026-09-20 16:14:00', 'c1000000-0000-4000-8000-000000000002', '5 mg',    'Given', NULL),
  ('f4000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000007', '2026-09-21 06:40:00', 'c1000000-0000-4000-8000-000000000002', '2 puffs', 'Given', 'Wheeze eased after 15 minutes'),
  ('f4000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'f3000000-0000-4000-8000-000000000008', '2026-09-21 04:30:00', 'c1000000-0000-4000-8000-000000000002', '500 mg',  'Given', 'Temperature 38.4 C before dose')
ON CONFLICT (id) DO NOTHING;

-- ---------- dental chart findings (no JSON: one row per surface) ----------
INSERT INTO public.tooth_finding (id, tenant_id, patient_id, encounter_id, tooth_number, dentition, tooth_state, recorded_by_staff_id) VALUES
  ('f5000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', NULL, '54', 'Primary',   'Caries',   'c1000000-0000-4000-8000-000000000001'),
  ('f5000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', NULL, '64', 'Primary',   'Restored', 'c1000000-0000-4000-8000-000000000001'),
  ('f5000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', NULL, '75', 'Primary',   'Caries',   'c1000000-0000-4000-8000-000000000001'),
  ('f5000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', NULL, '84', 'Primary',   'Sealant',  'c1000000-0000-4000-8000-000000000001'),
  ('f5000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', NULL, '16', 'Permanent', 'Sealant',  'c1000000-0000-4000-8000-000000000001'),
  ('f5000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', NULL, '36', 'Permanent', 'Erupting', 'c1000000-0000-4000-8000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tooth_surface_finding (id, tenant_id, tooth_finding_id, surface, finding) VALUES
  ('f6000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000001', 'O', 'Caries'),
  ('f6000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000001', 'D', 'Caries'),
  ('f6000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000002', 'O', 'Restored'),
  ('f6000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000003', 'O', 'Caries'),
  ('f6000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000003', 'M', 'Caries'),
  ('f6000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000004', 'O', 'Sealant'),
  ('f6000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'f5000000-0000-4000-8000-000000000005', 'O', 'Sealant')
ON CONFLICT (id) DO NOTHING;

-- ---------- reference cases (no arrays: one row per criterion) ----------
INSERT INTO public.reference_case (id, tenant_id, title, presentation, management, evidence, source_name, min_surfaces) VALUES
  ('f7000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'Multi-surface caries in a primary molar', 'Cavitated occlusal and proximal caries in a primary molar without spontaneous pain.', 'Selective caries removal with a stainless-steel crown or multi-surface restoration; fluoride varnish every 3-6 months.', 'AAPD Guideline on Restorative Dentistry', 'Built-in reference set', 2),
  ('f7000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'Newly erupted permanent first molars at caries risk', 'Erupting or recently erupted permanent first molars with deep fissures in a child with active caries elsewhere.', 'Resin-based pit and fissure sealants once isolation is possible; glass-ionomer sealant while erupting.', 'AAPD / ADA Sealant Guideline; Cochrane review', 'Built-in reference set', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.reference_case_criterion (id, tenant_id, reference_case_id, criterion_type, criterion_value) VALUES
  ('f8000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000001', 'ToothState',  'Caries'),
  ('f8000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000001', 'Surface',     'Caries'),
  ('f8000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000001', 'ToothGroup',  'Primary'),
  ('f8000000-0000-4000-8000-000000000004', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000002', 'ToothState',  'Erupting'),
  ('f8000000-0000-4000-8000-000000000005', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000002', 'ToothState',  'Sealant'),
  ('f8000000-0000-4000-8000-000000000006', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000002', 'ToothNumber', '16'),
  ('f8000000-0000-4000-8000-000000000007', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000002', 'ToothNumber', '26'),
  ('f8000000-0000-4000-8000-000000000008', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000002', 'ToothNumber', '36'),
  ('f8000000-0000-4000-8000-000000000009', 'a1000000-0000-4000-8000-000000000001', 'f7000000-0000-4000-8000-000000000002', 'ToothNumber', '46')
ON CONFLICT (id) DO NOTHING;

-- ---------- billing ----------
INSERT INTO public.invoice (id, tenant_id, facility_id, patient_id, encounter_id, invoice_no, status, issued_at, total_amount, patient_share) VALUES
  ('f9000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'd1000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'INV-2026-000118', 'Issued', '2026-09-21 06:00:00', 850.00, 118.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invoice_line (id, tenant_id, invoice_id, service_item_id, quantity, unit_price, line_total) VALUES
  ('fa000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'f9000000-0000-4000-8000-000000000001', 'c6000000-0000-4000-8000-000000000001', 1, 450.00, 450.00),
  ('fa000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'f9000000-0000-4000-8000-000000000001', 'c6000000-0000-4000-8000-000000000002', 1, 180.00, 180.00),
  ('fa000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'f9000000-0000-4000-8000-000000000001', 'c6000000-0000-4000-8000-000000000003', 1, 220.00, 220.00)
ON CONFLICT (id) DO NOTHING;

-- ---------- audit log (application-written) ----------
INSERT INTO public.audit_log (id, tenant_id, facility_id, entity_name, entity_id, action_type, field_name, old_value, new_value, changed_by, changed_at) VALUES
  ('fb000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'patient',   'd1000000-0000-4000-8000-000000000001', 'Create', NULL,          NULL,     'MM-92031', 'c2000000-0000-4000-8000-000000000003', '2026-09-15 05:00:00'),
  ('fb000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'encounter', 'e1000000-0000-4000-8000-000000000001', 'Create', NULL,          NULL,     'IP-2026-0915-008', 'c2000000-0000-4000-8000-000000000002', '2026-09-15 05:20:00'),
  ('fb000000-0000-4000-8000-000000000003', 'a1000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001', 'tooth_surface_finding', 'f6000000-0000-4000-8000-000000000002', 'Create', 'finding', NULL, 'Caries', 'c2000000-0000-4000-8000-000000000002', '2026-09-21 06:10:00')
ON CONFLICT (id) DO NOTHING;
