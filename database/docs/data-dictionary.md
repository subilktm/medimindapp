# MediMind EMR — Data dictionary

Generated from the live database schema (migrations 0006–0009). PostgreSQL names are snake_case; the SQL Server name is the PascalCase form (e.g. `patient_history_entry.onset_text` → `PatientHistoryEntry.OnsetText`).

**Standard columns on every table** (not repeated below): `created_by` UUID NULL, `created_at` TIMESTAMP(3) NOT NULL (UTC), `updated_by` UUID NULL, `updated_at` TIMESTAMP(3) NULL, `is_active` BOOLEAN NOT NULL DEFAULT TRUE, `deleted_at` TIMESTAMP(3) NULL. `created_by` / `updated_by` hold `user_account.id`. Rows are soft-deleted by setting `is_active = FALSE` and `deleted_at`; no hard DELETE is granted to app users.

All timestamps are stored in UTC without time zone. The tenant's display zone is `tenant.time_zone`.

Legacy tables used by the current screens (`profiles`, `user_roles`, `tooth_chart_*`, `pedo_case_library`, `dental_images`) are unchanged and not documented here.

## Contents

- **Organisation & tenancy**: [`tenant`](#tenant), [`facility`](#facility), [`department`](#department)
- **Identity & access**: [`staff_member`](#staff_member), [`user_account`](#user_account), [`role`](#role), [`user_account_role`](#user_account_role)
- **Subscription & features**: [`subscription_plan`](#subscription_plan), [`tenant_subscription`](#tenant_subscription), [`feature`](#feature), [`tenant_feature`](#tenant_feature)
- **Patient**: [`patient`](#patient), [`patient_contact`](#patient_contact), [`patient_allergy`](#patient_allergy), [`patient_insurance`](#patient_insurance), [`patient_history_entry`](#patient_history_entry), [`patient_immunization`](#patient_immunization)
- **Scheduling & encounters**: [`appointment`](#appointment), [`encounter`](#encounter), [`clinical_note`](#clinical_note), [`vital_sign_set`](#vital_sign_set), [`diagnosis`](#diagnosis)
- **Orders & results**: [`clinical_order`](#clinical_order), [`order_result`](#order_result)
- **Medications**: [`medication_order`](#medication_order), [`medication_administration`](#medication_administration)
- **Dental & AI**: [`tooth_finding`](#tooth_finding), [`tooth_surface_finding`](#tooth_surface_finding), [`dental_image`](#dental_image), [`ai_summary`](#ai_summary), [`reference_case`](#reference_case), [`reference_case_criterion`](#reference_case_criterion)
- **Billing**: [`service_item`](#service_item), [`invoice`](#invoice), [`invoice_line`](#invoice_line)
- **Audit**: [`audit_log`](#audit_log)

## Organisation & tenancy

### tenant

SQL Server: `Tenant`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `code` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `country_code` | VARCHAR(2) | NVARCHAR(2) | No | 'AE' |  |
| `time_zone` | VARCHAR(64) | NVARCHAR(64) | No | 'Asia/Dubai' |  |

- Unique: `UNIQUE (code)`

### facility

SQL Server: `Facility`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `code` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `license_no` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `address` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `phone` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |

- Unique: `UNIQUE (tenant_id, code)`

### department

SQL Server: `Department`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | No |  | `facility.id` |
| `code` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `specialty` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |

- Unique: `UNIQUE (facility_id, code)`

## Identity & access

### staff_member

SQL Server: `StaffMember`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `facility.id` |
| `first_name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `last_name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `title` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `profession` | VARCHAR(30) | NVARCHAR(30) | No | 'Other' |  |
| `specialty` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |
| `license_no` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `email` | VARCHAR(200) | NVARCHAR(200) | Yes |  |  |
| `phone` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |

- Check: `CHECK (((profession) = ANY (IN ('Physician', 'Dentist', 'Nurse', 'Administrator', 'FrontDesk', 'Other' )[ )))`

### user_account

SQL Server: `UserAccount`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `auth_user_id` | UUID | UNIQUEIDENTIFIER | No |  |  |
| `username` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `staff_member_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `last_login_at` | TIMESTAMP(3) | DATETIME2(3) | Yes |  |  |

- Unique: `UNIQUE (auth_user_id)`
- Unique: `UNIQUE (tenant_id, username)`

### role

SQL Server: `Role`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `code` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `description` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |

- Unique: `UNIQUE (code)`

### user_account_role

SQL Server: `UserAccountRole`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `user_account_id` | UUID | UNIQUEIDENTIFIER | No |  | `user_account.id` |
| `role_id` | UUID | UNIQUEIDENTIFIER | No |  | `role.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `facility.id` |

- Unique: `UNIQUE (user_account_id, role_id, facility_id)`

## Subscription & features

### subscription_plan

SQL Server: `SubscriptionPlan`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `code` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `monthly_price` | NUMERIC(12,2) | DECIMAL(12,2) | No | 0 |  |
| `currency_code` | VARCHAR(3) | NVARCHAR(3) | No | 'AED' |  |
| `max_facilities` | INTEGER | INT | No | 1 |  |
| `max_users` | INTEGER | INT | No | 10 |  |

- Unique: `UNIQUE (code)`

### tenant_subscription

SQL Server: `TenantSubscription`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `subscription_plan_id` | UUID | UNIQUEIDENTIFIER | No |  | `subscription_plan.id` |
| `starts_on` | DATE | DATE | No |  |  |
| `ends_on` | DATE | DATE | Yes |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Active' |  |

- Check: `CHECK (((status) = ANY (IN ('Trial', 'Active', 'Suspended', 'Cancelled' )[ )))`

### feature

SQL Server: `Feature`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `code` | VARCHAR(60) | NVARCHAR(60) | No |  |  |
| `name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `description` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |

- Unique: `UNIQUE (code)`

### tenant_feature

SQL Server: `TenantFeature`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `feature_id` | UUID | UNIQUEIDENTIFIER | No |  | `feature.id` |
| `is_enabled` | BOOLEAN | BIT | No | true |  |

- Unique: `UNIQUE (tenant_id, feature_id)`

## Patient

### patient

SQL Server: `Patient`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | No |  | `facility.id` |
| `mrn` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `first_name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `last_name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `date_of_birth` | DATE | DATE | No |  |  |
| `sex` | VARCHAR(10) | NVARCHAR(10) | No |  |  |
| `blood_group` | VARCHAR(5) | NVARCHAR(5) | Yes |  |  |
| `national_id` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `mobile` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `email` | VARCHAR(200) | NVARCHAR(200) | Yes |  |  |

- Unique: `UNIQUE (tenant_id, mrn)`
- Check: `CHECK (((sex) = ANY (IN ('Female', 'Male', 'Other', 'Unknown' )[ )))`

### patient_contact

SQL Server: `PatientContact`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `contact_type` | VARCHAR(20) | NVARCHAR(20) | No |  |  |
| `full_name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `relationship` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `phone` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `national_id` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `is_legal_guardian` | BOOLEAN | BIT | No | false |  |

- Check: `CHECK (((contact_type) = ANY (IN ('Guardian', 'Emergency', 'NextOfKin' )[ )))`

### patient_allergy

SQL Server: `PatientAllergy`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `allergen` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `reaction` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `severity` | VARCHAR(10) | NVARCHAR(10) | No | 'Mild' |  |
| `recorded_on` | DATE | DATE | Yes |  |  |
| `recorded_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |

- Check: `CHECK (((severity) = ANY (IN ('None', 'Mild', 'Moderate', 'Severe' )[ )))`

### patient_insurance

SQL Server: `PatientInsurance`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `payer_name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `policy_no` | VARCHAR(60) | NVARCHAR(60) | No |  |  |
| `member_no` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `eligibility_status` | VARCHAR(20) | NVARCHAR(20) | No | 'Pending' |  |
| `valid_from` | DATE | DATE | Yes |  |  |
| `valid_to` | DATE | DATE | Yes |  |  |

- Check: `CHECK (((eligibility_status) = ANY (IN ('Pending', 'Verified', 'Rejected', 'Expired' )[ )))`

### patient_history_entry

SQL Server: `PatientHistoryEntry`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `category` | VARCHAR(20) | NVARCHAR(20) | No |  |  |
| `description` | VARCHAR(400) | NVARCHAR(400) | No |  |  |
| `relation` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `onset_text` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | Yes |  |  |
| `facility_name` | VARCHAR(200) | NVARCHAR(200) | Yes |  |  |
| `notes` | VARCHAR(2000) | NVARCHAR(2000) | Yes |  |  |
| `is_flagged` | BOOLEAN | BIT | No | false |  |

- Check: `CHECK (((category) = ANY (IN ('PastMedical', 'Surgical', 'Family', 'Social', 'Screening' )[ )))`
- Check: `CHECK (((status IS NULL) OR ((status) = ANY (IN ('Ongoing', 'Controlled', 'Resolved' )[ ))))`

### patient_immunization

SQL Server: `PatientImmunization`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `vaccine` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `administered_on` | DATE | DATE | Yes |  |  |
| `administered_text` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `dose_no` | INTEGER | INT | Yes |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'UpToDate' |  |

- Check: `CHECK (((status) = ANY (IN ('UpToDate', 'Due', 'CompletedSeries' )[ )))`

## Scheduling & encounters

### appointment

SQL Server: `Appointment`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | No |  | `facility.id` |
| `department_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `department.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `staff_member_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `scheduled_start` | TIMESTAMP(3) | DATETIME2(3) | No |  |  |
| `scheduled_end` | TIMESTAMP(3) | DATETIME2(3) | No |  |  |
| `reason` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Scheduled' |  |

- Check: `CHECK (((status) = ANY (IN ('Scheduled', 'Confirmed', 'CheckedIn', 'Completed', 'Cancelled', 'NoShow' )[ )))`
- Check: `CHECK ((scheduled_end > scheduled_start))`

### encounter

SQL Server: `Encounter`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | No |  | `facility.id` |
| `department_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `department.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `attending_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `appointment_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `appointment.id` |
| `encounter_no` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `encounter_type` | VARCHAR(20) | NVARCHAR(20) | No |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Active' |  |
| `admitted_at` | TIMESTAMP(3) | DATETIME2(3) | No |  |  |
| `discharged_at` | TIMESTAMP(3) | DATETIME2(3) | Yes |  |  |
| `room` | VARCHAR(20) | NVARCHAR(20) | Yes |  |  |
| `chief_complaint` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `summary` | VARCHAR(2000) | NVARCHAR(2000) | Yes |  |  |
| `disposition` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `follow_up` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |

- Unique: `UNIQUE (tenant_id, encounter_no)`
- Check: `CHECK (((encounter_type) = ANY (IN ('Inpatient', 'Outpatient', 'Emergency', 'Dental' )[ )))`
- Check: `CHECK (((status) = ANY (IN ('Active', 'Completed', 'Discharged', 'Cancelled' )[ )))`

### clinical_note

SQL Server: `ClinicalNote`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | No |  | `encounter.id` |
| `author_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `note_type` | VARCHAR(20) | NVARCHAR(20) | No | 'SOAP' |  |
| `subjective` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `objective` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `assessment` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `plan_of_care` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `signed_at` | TIMESTAMP(3) | DATETIME2(3) | Yes |  |  |

- Check: `CHECK (((note_type) = ANY (IN ('SOAP', 'Progress', 'Nursing', 'Discharge', 'Dental' )[ )))`

### vital_sign_set

SQL Server: `VitalSignSet`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `recorded_at` | TIMESTAMP(3) | DATETIME2(3) | No |  |  |
| `recorded_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `systolic_mmhg` | INTEGER | INT | Yes |  |  |
| `diastolic_mmhg` | INTEGER | INT | Yes |  |  |
| `pulse_bpm` | INTEGER | INT | Yes |  |  |
| `temperature_c` | NUMERIC(4,1) | DECIMAL(4,1) | Yes |  |  |
| `spo2_percent` | INTEGER | INT | Yes |  |  |
| `respiratory_rate` | INTEGER | INT | Yes |  |  |
| `pain_score` | INTEGER | INT | Yes |  |  |
| `weight_kg` | NUMERIC(5,1) | DECIMAL(5,1) | Yes |  |  |
| `height_cm` | NUMERIC(5,1) | DECIMAL(5,1) | Yes |  |  |

- Check: `CHECK (((pain_score IS NULL) OR ((pain_score >= 0) AND (pain_score <= 10))))`
- Check: `CHECK (((spo2_percent IS NULL) OR ((spo2_percent >= 0) AND (spo2_percent <= 100))))`

### diagnosis

SQL Server: `Diagnosis`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `icd10_code` | VARCHAR(10) | NVARCHAR(10) | No |  |  |
| `description` | VARCHAR(400) | NVARCHAR(400) | No |  |  |
| `diagnosis_type` | VARCHAR(20) | NVARCHAR(20) | No | 'Secondary' |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Active' |  |
| `onset_date` | DATE | DATE | Yes |  |  |
| `resolved_date` | DATE | DATE | Yes |  |  |
| `recorded_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |

- Check: `CHECK (((diagnosis_type) = ANY (IN ('Primary', 'Secondary', 'Admitting', 'Discharge' )[ )))`
- Check: `CHECK (((status) = ANY (IN ('Active', 'Resolved' )[ )))`

## Orders & results

### clinical_order

SQL Server: `ClinicalOrder`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | No |  | `facility.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `ordered_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `order_type` | VARCHAR(20) | NVARCHAR(20) | No |  |  |
| `name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `priority` | VARCHAR(20) | NVARCHAR(20) | No | 'Routine' |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Ordered' |  |
| `ordered_at` | TIMESTAMP(3) | DATETIME2(3) | No | UTC now → SYSUTCDATETIME() |  |

- Check: `CHECK (((order_type) = ANY (IN ('Lab', 'Imaging', 'Procedure', 'Referral' )[ )))`
- Check: `CHECK (((priority) = ANY (IN ('Routine', 'Urgent', 'Stat' )[ )))`
- Check: `CHECK (((status) = ANY (IN ('Ordered', 'Pending', 'Completed', 'Cancelled' )[ )))`

### order_result

SQL Server: `OrderResult`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `clinical_order_id` | UUID | UNIQUEIDENTIFIER | No |  | `clinical_order.id` |
| `result_name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `result_value` | VARCHAR(200) | NVARCHAR(200) | Yes |  |  |
| `unit` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `reference_range` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |
| `abnormal_flag` | VARCHAR(10) | NVARCHAR(10) | Yes |  |  |
| `resulted_at` | TIMESTAMP(3) | DATETIME2(3) | Yes |  |  |
| `verified_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |

- Check: `CHECK (((abnormal_flag IS NULL) OR ((abnormal_flag) = ANY (IN ('Normal', 'Low', 'High', 'Critical' )[ ))))`

## Medications

### medication_order

SQL Server: `MedicationOrder`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `prescriber_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `drug_name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `strength` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `dose_form` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `route` | VARCHAR(40) | NVARCHAR(40) | Yes |  |  |
| `frequency` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Active' |  |
| `indication` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `start_date` | DATE | DATE | Yes |  |  |
| `end_date` | DATE | DATE | Yes |  |  |
| `monitoring` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |
| `hold_criteria` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |
| `safety_note` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |

- Check: `CHECK (((status) = ANY (IN ('Active', 'PRN', 'Held', 'Completed', 'Cancelled' )[ )))`

### medication_administration

SQL Server: `MedicationAdministration`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `medication_order_id` | UUID | UNIQUEIDENTIFIER | No |  | `medication_order.id` |
| `administered_at` | TIMESTAMP(3) | DATETIME2(3) | No |  |  |
| `administered_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `dose_given` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Given' |  |
| `note` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |

- Check: `CHECK (((status) = ANY (IN ('Given', 'Held', 'Refused', 'Missed' )[ )))`

## Dental & AI

### tooth_finding

SQL Server: `ToothFinding`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `tooth_number` | VARCHAR(2) | NVARCHAR(2) | No |  |  |
| `dentition` | VARCHAR(10) | NVARCHAR(10) | No |  |  |
| `tooth_state` | VARCHAR(20) | NVARCHAR(20) | No | 'Sound' |  |
| `recorded_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |

- Check: `CHECK (((dentition) = ANY (IN ('Primary', 'Permanent' )[ )))`
- Check: `CHECK (((tooth_state) = ANY (IN ('Sound', 'Caries', 'Restored', 'Sealant', 'Pulp', 'Crown', 'Missing', 'Erupting', 'Trauma' )[ )))`

### tooth_surface_finding

SQL Server: `ToothSurfaceFinding`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `tooth_finding_id` | UUID | UNIQUEIDENTIFIER | No |  | `tooth_finding.id` |
| `surface` | VARCHAR(1) | NVARCHAR(1) | No |  |  |
| `finding` | VARCHAR(20) | NVARCHAR(20) | No |  |  |

- Unique: `UNIQUE (tooth_finding_id, surface)`
- Check: `CHECK (((surface) = ANY (IN ('O', 'M', 'D', 'B', 'L' )[ )))`
- Check: `CHECK (((finding) = ANY (IN ('Caries', 'Restored', 'Sealant', 'Fracture', 'Missing' )[ )))`

### dental_image

SQL Server: `DentalImage`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `tooth_number` | VARCHAR(2) | NVARCHAR(2) | Yes |  |  |
| `image_type` | VARCHAR(30) | NVARCHAR(30) | No |  |  |
| `storage_path` | VARCHAR(500) | NVARCHAR(500) | No |  |  |
| `file_name` | VARCHAR(255) | NVARCHAR(255) | No |  |  |
| `content_type` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |
| `note` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |

- Check: `CHECK (((image_type) = ANY (IN ('PeriapicalXray', 'BitewingXray', 'PanoramicXray', 'IntraoralPhoto', 'ExtraoralPhoto' )[ )))`

### ai_summary

SQL Server: `AiSummary`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `version_no` | INTEGER | INT | No | 1 |  |
| `summary_type` | VARCHAR(30) | NVARCHAR(30) | No | 'PediatricDental' |  |
| `headline` | VARCHAR(400) | NVARCHAR(400) | Yes |  |  |
| `summary_text` | VARCHAR(8000) | NVARCHAR(8000) | No |  |  |
| `model` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |
| `case_source` | VARCHAR(20) | NVARCHAR(20) | No | 'BuiltIn' |  |
| `case_count` | INTEGER | INT | No | 0 |  |
| `finding_count` | INTEGER | INT | No | 0 |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Pending' |  |
| `generated_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `generated_at` | TIMESTAMP(3) | DATETIME2(3) | No | UTC now → SYSUTCDATETIME() |  |
| `reviewed_by_staff_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `staff_member.id` |
| `reviewed_at` | TIMESTAMP(3) | DATETIME2(3) | Yes |  |  |
| `review_note` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |

- Unique: `UNIQUE (patient_id, summary_type, version_no)`
- Check: `CHECK (((status) = ANY (IN ('Pending', 'Approved', 'Rejected' )[ )))`
- Check: `CHECK (((case_source) = ANY (IN ('BuiltIn', 'Clinic' )[ )))`

### reference_case

SQL Server: `ReferenceCase`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `title` | VARCHAR(300) | NVARCHAR(300) | No |  |  |
| `presentation` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `management` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `evidence` | VARCHAR(1000) | NVARCHAR(1000) | Yes |  |  |
| `source_name` | VARCHAR(200) | NVARCHAR(200) | Yes |  |  |
| `min_surfaces` | INTEGER | INT | No | 0 |  |

### reference_case_criterion

SQL Server: `ReferenceCaseCriterion`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `reference_case_id` | UUID | UNIQUEIDENTIFIER | No |  | `reference_case.id` |
| `criterion_type` | VARCHAR(20) | NVARCHAR(20) | No |  |  |
| `criterion_value` | VARCHAR(40) | NVARCHAR(40) | No |  |  |

- Unique: `UNIQUE (reference_case_id, criterion_type, criterion_value)`
- Check: `CHECK (((criterion_type) = ANY (IN ('ToothState', 'Surface', 'ToothNumber', 'ToothGroup' )[ )))`

## Billing

### service_item

SQL Server: `ServiceItem`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `code` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `name` | VARCHAR(200) | NVARCHAR(200) | No |  |  |
| `category` | VARCHAR(60) | NVARCHAR(60) | Yes |  |  |
| `unit_price` | NUMERIC(12,2) | DECIMAL(12,2) | No | 0 |  |
| `currency_code` | VARCHAR(3) | NVARCHAR(3) | No | 'AED' |  |

- Unique: `UNIQUE (tenant_id, code)`

### invoice

SQL Server: `Invoice`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | No |  | `facility.id` |
| `patient_id` | UUID | UNIQUEIDENTIFIER | No |  | `patient.id` |
| `encounter_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `encounter.id` |
| `invoice_no` | VARCHAR(40) | NVARCHAR(40) | No |  |  |
| `status` | VARCHAR(20) | NVARCHAR(20) | No | 'Draft' |  |
| `issued_at` | TIMESTAMP(3) | DATETIME2(3) | Yes |  |  |
| `total_amount` | NUMERIC(12,2) | DECIMAL(12,2) | No | 0 |  |
| `patient_share` | NUMERIC(12,2) | DECIMAL(12,2) | No | 0 |  |
| `currency_code` | VARCHAR(3) | NVARCHAR(3) | No | 'AED' |  |

- Unique: `UNIQUE (tenant_id, invoice_no)`
- Check: `CHECK (((status) = ANY (IN ('Draft', 'Issued', 'PartiallyPaid', 'Paid', 'Cancelled' )[ )))`

### invoice_line

SQL Server: `InvoiceLine`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `invoice_id` | UUID | UNIQUEIDENTIFIER | No |  | `invoice.id` |
| `service_item_id` | UUID | UNIQUEIDENTIFIER | No |  | `service_item.id` |
| `quantity` | INTEGER | INT | No | 1 |  |
| `unit_price` | NUMERIC(12,2) | DECIMAL(12,2) | No | 0 |  |
| `line_total` | NUMERIC(12,2) | DECIMAL(12,2) | No | 0 |  |

- Check: `CHECK ((quantity > 0))`

## Audit

### audit_log

SQL Server: `AuditLog`

| Column | PostgreSQL | SQL Server | Null | Default | References |
|---|---|---|---|---|---|
| `id` | UUID | UNIQUEIDENTIFIER | No | gen_random_uuid() → NEWID() | PK |
| `tenant_id` | UUID | UNIQUEIDENTIFIER | No |  | `tenant.id` |
| `facility_id` | UUID | UNIQUEIDENTIFIER | Yes |  | `facility.id` |
| `entity_name` | VARCHAR(100) | NVARCHAR(100) | No |  |  |
| `entity_id` | UUID | UNIQUEIDENTIFIER | No |  |  |
| `action_type` | VARCHAR(20) | NVARCHAR(20) | No |  |  |
| `field_name` | VARCHAR(100) | NVARCHAR(100) | Yes |  |  |
| `old_value` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `new_value` | VARCHAR(4000) | NVARCHAR(4000) | Yes |  |  |
| `changed_by` | UUID | UNIQUEIDENTIFIER | Yes |  | `user_account.id` |
| `changed_at` | TIMESTAMP(3) | DATETIME2(3) | No | UTC now → SYSUTCDATETIME() |  |

- Check: `CHECK (((action_type) = ANY (IN ('Create', 'Update', 'SoftDelete', 'Restore', 'Approve', 'Reject', 'View' )[ )))`
