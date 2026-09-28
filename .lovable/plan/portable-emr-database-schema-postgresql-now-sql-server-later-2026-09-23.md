# Portable EMR database schema (PostgreSQL now, SQL Server later)

The project is already connected to Lovable Cloud (PostgreSQL). This plan adds a new, portable schema next to the existing tables. The existing tables and all screens stay exactly as they are. Nothing is applied until you approve.

## Design conventions

- **Naming:** `snake_case` in PostgreSQL (for example `tenant_id`, `is_active`, `deleted_at`). The data dictionary maps each name to PascalCase for SQL Server (`TenantId`, `IsActive`, `DeletedAt`). PascalCase inside PostgreSQL would mean quoting every identifier in every query. If you want PascalCase in PostgreSQL anyway, say so and I'll switch.
- **Keys:** every table has `id UUID` as its primary key, defaulting to `gen_random_uuid()`. That function is built into PostgreSQL 13+, so no extension is needed. SQL Server equivalent: `UNIQUEIDENTIFIER DEFAULT NEWID()`.
- **Standard columns on every table:** `is_active`, `deleted_at`, `created_by`, `created_at`, `updated_by`, `updated_at`.
  - Deletion is soft only: no hard deletes, and no DELETE permission is granted.
- **Tenancy:** `tenant_id` appears on every business table. `facility_id` appears wherever data belongs to a site: departments, staff assignments, appointments, encounters, orders and invoices.
- **Timestamps:** stored in UTC as `TIMESTAMP(3)` with default `(now() AT TIME ZONE 'UTC')`. SQL Server: `DATETIME2(3) DEFAULT SYSUTCDATETIME()`.
- **Portable types only:** `UUID`, `VARCHAR(n)`, `INTEGER`, `NUMERIC(p,s)`, `BOOLEAN`, `DATE`, `TIMESTAMP`.
  - No arrays, JSONB, PostgreSQL enums or extensions.
  - Status values use `CHECK (... IN (...))` constraints, which SQL Server supports.
- **Foreign keys:** every relationship has a named foreign key (`fk_<table>_<ref>`). Common lookups get named indexes.
- **No triggers:** the app sets audit columns and handles all workflows.

## Type mapping (PostgreSQL to SQL Server)

```text
UUID          -> UNIQUEIDENTIFIER
VARCHAR(n)    -> NVARCHAR(n)
VARCHAR(4000) -> NVARCHAR(4000)   (long notes; no TEXT type)
BOOLEAN       -> BIT
INTEGER       -> INT
NUMERIC(p,s)  -> DECIMAL(p,s)
DATE          -> DATE
TIMESTAMP(3)  -> DATETIME2(3)     (UTC)
```

## Proposed tables (31)

### Organisation and subscription
- `tenant`: code, name, country, time_zone.
- `facility`: tenant, code, name, license_no, address, phone.
- `department`: tenant, facility, code, name, specialty.
- `subscription_plan`: code, name, monthly_price, max_facilities, max_users.
- `tenant_subscription`: tenant, plan, starts_on, ends_on, status.
- `feature`: code, name, description.
- `tenant_feature`: tenant, feature, is_enabled.

### Identity (sign-in kept separate from clinical staff records)
- `user_account`: tenant, auth_user_id (unique login reference, no foreign key into the sign-in system), username, staff_member (nullable foreign key), last_login_at.
- `staff_member`: the clinical person. Tenant, primary facility, first_name, last_name, title, profession, specialty, license_no, email, phone.
- `role`: code (admin, clinician, doctor, nurse, receptionist), name.
- `user_account_role`: user_account, role, facility (nullable, for facility-scoped roles).

### Patient
- `patient`: tenant, registered facility, mrn (unique per tenant), first_name, last_name, date_of_birth, sex, blood_group, national_id, mobile, email.
- `patient_contact`: patient, contact_type (Guardian/Emergency/NextOfKin), full_name, relationship, phone, national_id, is_legal_guardian.
- `patient_allergy`: patient, allergen, reaction, severity, recorded_on, recorded_by_staff.
- `patient_insurance`: patient, payer_name, policy_no, member_no, eligibility_status, valid_from, valid_to.
- `patient_history_entry`: patient, category (PastMedical/Surgical/Family/Social/Screening), description, relation, onset_text, status, facility_name, notes.
- `patient_immunization`: patient, vaccine, administered_on, dose_no, status.

### Scheduling and encounters
- `appointment`: tenant, facility, department, patient, staff_member, scheduled_start/end (UTC), reason, status.
- `encounter`: tenant, facility, department, patient, attending_staff, appointment (nullable), encounter_no, encounter_type, status, admitted_at, discharged_at, room, chief_complaint, disposition, follow_up.
- `clinical_note`: encounter, author_staff, note_type, subjective, objective, assessment, plan (separate columns, not JSON), signed_at.
- `vital_sign_set`: encounter, patient, recorded_at, recorded_by, systolic, diastolic, pulse, temperature_c, spo2, respiratory_rate, pain_score, weight_kg, height_cm.
- `diagnosis`: patient, encounter (nullable), icd10_code, description, diagnosis_type, status, onset_date, resolved_date, recorded_by_staff.

### Orders and medications
- `clinical_order`: tenant, facility, patient, encounter, ordered_by_staff, order_type (Lab/Imaging/Procedure), name, priority, status, ordered_at.
- `order_result`: clinical_order, result_name, value, unit, reference_range, abnormal_flag, resulted_at, verified_by_staff.
- `medication_order`: patient, encounter, prescriber_staff, drug_name, strength, dose_form, route, frequency, status, indication, start_date, end_date, monitoring, hold_criteria, safety_note.
- `medication_administration`: medication_order, administered_at, administered_by_staff, dose_given, status, note.

### Dental (portable replacements for the current array and JSON-based tables)
- `tooth_finding`: patient, encounter (nullable), tooth_number (FDI), dentition (Primary/Permanent), tooth_state, recorded_by_staff.
- `tooth_surface_finding`: tooth_finding, surface (O/M/D/B/L), finding (Caries/Restored/Sealant/Fracture/Missing). This replaces the JSONB `surfaces` column.
- `dental_image`: patient, tooth_number, image_type, storage_path, file_name, note.
- `ai_summary`: patient, version_no, summary_text, headline, model, case_source, status (Pending/Approved/Rejected), generated_by, reviewed_by, reviewed_at, review_note.
- `reference_case` + `reference_case_criterion`: title, presentation, management, evidence, source_name. Each criterion row is one criterion_type (ToothState/Surface/ToothNumber/ToothGroup) and value. This replaces the array columns.

### Billing and audit
- `service_item`: tenant, code, name, category, unit_price.
- `invoice`: tenant, facility, patient, encounter, invoice_no, status, issued_at, total_amount, patient_share.
- `invoice_line`: invoice, service_item, quantity, unit_price, line_total.
- `audit_log`: tenant, entity_name, entity_id, action, field_name, old_value, new_value, changed_by, changed_at. Written by the app, not by triggers.

## Relationships (summary)

```text
tenant 1-* facility 1-* department
tenant 1-* user_account *-1 staff_member ; user_account *-* role
tenant 1-* patient 1-* {contact, allergy, insurance, history_entry, immunization}
patient 1-* appointment 1-0..1 encounter
encounter 1-* {clinical_note, vital_sign_set, diagnosis, clinical_order, medication_order}
clinical_order 1-* order_result ; medication_order 1-* medication_administration
patient 1-* tooth_finding 1-* tooth_surface_finding ; patient 1-* ai_summary
reference_case 1-* reference_case_criterion
invoice 1-* invoice_line *-1 service_item
```

## Access rules (PostgreSQL-only layer, not ported)

- Two read-only helper functions (not triggers):
  - `app_is_tenant_member(tenant_id)`
  - `app_has_tenant_role(tenant_id, role_code)`
- Row-level security is on for every table, and each table gets explicit grants in the same migration.
- Staff can read their own tenant's rows.
- Clinical roles write clinical tables. Front desk writes patients, contacts, appointments and billing. Admin manages organisation, subscription and features.

## Files to generate

- **Four versioned migrations**, applied in order:
  1. Organisation + identity + helper functions
  2. Patient + scheduling + encounters
  3. Orders, medications, dental, billing, audit
  4. Indexes
- **Seed files** (loaded as data, not as migrations):
  - `database/seed/001_reference_data.sql`: roles, plans, features, service items.
  - `database/seed/002_demo_data.sql`: demo tenant and facility; Dr. Lena Hart, Nurse Maria, Dr. Nabil Rahman, Front Desk and Admin, linked to the existing logins; and the three current patients (Emma, Marcus, Elena) with their encounters, diagnoses, medications, allergies, history and dental findings.
- **Documentation:**
  - `database/docs/data-dictionary.md`: every table and column, with its type, nullability, SQL Server name and SQL Server type.
  - `database/docs/er-diagram.md`: a full ER diagram, readable on GitHub.
  - `database/docs/sqlserver-notes.md`: default functions, UUID and time handling, and what to drop (row-level security).

## Not changed

- No screens, components or existing tables are modified.
- The app keeps working on its current data. Switching screens to the new tables is a separate, later step.
