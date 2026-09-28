# MediMind EMR — SQL Server portability notes

The EMR schema (migrations `0006`–`0009`) is written in portable relational SQL so the database can move to Microsoft SQL Server with a mechanical translation. This file lists every PostgreSQL-specific item and how to translate it.

## Files

| File | Purpose |
|---|---|
| `drizzle/migrations/0006_emr_core_organisation_identity.sql` | Tenant, facility, department, staff, user accounts, roles, subscriptions, features, access helper functions |
| `drizzle/migrations/0007_emr_patient_scheduling_encounters.sql` | Patient, contacts, allergies, insurance, history, immunizations, appointments, encounters, SOAP notes, vitals, diagnoses |
| `drizzle/migrations/0008_emr_orders_medications_dental_billing_audit.sql` | Orders/results, medications, tooth/surface findings, dental images, AI summaries, reference cases, billing, audit log |
| `drizzle/migrations/0009_emr_indexes.sql` | B-tree indexes only |
| `database/seed/001_reference_data.sql` | Global roles, subscription plans, features |
| `database/seed/002_demo_data.sql` | Demo tenant, facility, staff, logins and three demo patients |
| `database/docs/data-dictionary.md` | Every table and column, with PostgreSQL and SQL Server types |
| `database/docs/er-diagram.md` | Mermaid ER diagrams generated from the live foreign keys |

Load order: migrations 0006 → 0009, then seed 001, then seed 002. Seeds use fixed UUIDs and `ON CONFLICT (id) DO NOTHING`, so they can be re-run safely.

## Naming

| PostgreSQL | SQL Server |
|---|---|
| `patient_history_entry` | `PatientHistoryEntry` |
| `onset_text` | `OnsetText` |
| `fk_encounter_patient` (constraint) | keep as-is, or `FK_Encounter_Patient` |

Every foreign key and unique constraint is explicitly named, so names can be translated one-to-one.

## Data types

| PostgreSQL | SQL Server | Notes |
|---|---|---|
| `UUID` | `UNIQUEIDENTIFIER` | |
| `gen_random_uuid()` default | `NEWID()` (or `NEWSEQUENTIALID()` for clustered keys) | Built into PostgreSQL 13+; no extension is installed |
| `VARCHAR(n)` | `NVARCHAR(n)` | All text columns have an explicit length; no unbounded `TEXT` |
| `NUMERIC(p,s)` | `DECIMAL(p,s)` | Money uses `NUMERIC(12,2)` |
| `INTEGER` | `INT` | |
| `BOOLEAN` | `BIT` | `TRUE`/`FALSE` → `1`/`0` in seeds |
| `DATE` | `DATE` | |
| `TIMESTAMP(3)` (UTC, no zone) | `DATETIME2(3)` | |
| `(now() AT TIME ZONE 'UTC')` default | `SYSUTCDATETIME()` | |

Not used anywhere in the new schema: arrays, JSON/JSONB, enums, `SERIAL`/identity, `TIMESTAMPTZ`, extensions, triggers, generated columns, partial indexes.

## Constraints

- **CHECK lists** are written as `col IN ('A','B')` in the migrations and translate unchanged. (PostgreSQL displays them internally as `= ANY (ARRAY[...])`; that is only its display form.)
- **Foreign keys** are all `NO ACTION`. SQL Server rejects multiple cascade paths, so none were used.
- **Soft deletion**: `is_active BIT NOT NULL DEFAULT 1` and `deleted_at DATETIME2(3) NULL`. Unique constraints include business keys only; if a soft-deleted code must be reusable, SQL Server can use a filtered unique index `WHERE IsActive = 1`.

## Audit columns

`created_by`, `created_at`, `updated_by`, `updated_at` are set by the application, not by triggers. `created_by` / `updated_by` hold `user_account.id`. `audit_log` is written by the application and is insert-only for app users.

## Identity separation

- `user_account.auth_user_id` stores the sign-in provider's user ID with **no foreign key** into the auth system. On SQL Server this becomes the external identity (e.g. Entra ID object ID).
- `staff_member` is the clinical person record (name, licence, profession) and is independent of logins.
- `user_account_role` links logins to `role`, optionally scoped to a facility.

## PostgreSQL-only access layer (do not port)

These exist only because the current app reads the database directly from the browser. They are not business logic:

- Row-level security policies on every table.
- `GRANT` statements to `authenticated` / `service_role`.
- Helper functions used by policies (migration 0006): `app_is_tenant_member`, `app_has_tenant_role`, `app_is_tenant_admin`, `app_can_write_clinical`, `app_can_write_front_desk`. They resolve the signed-in user via `auth.uid()` → `user_account.auth_user_id`.

On SQL Server, enforce the same rules either in the API layer or with SQL Server Row-Level Security (`CREATE SECURITY POLICY` with a predicate function on `TenantId`).

## Seed translation

- Replace `ON CONFLICT (id) DO NOTHING` with `IF NOT EXISTS (...)` or `MERGE`.
- Replace `TRUE`/`FALSE` with `1`/`0`.
- UUID string literals and `'YYYY-MM-DD HH:MM:SS'` timestamps work unchanged.
- Use `N'...'` prefixes if non-Latin text is added later.

## Relationship to the current screens

The existing screens still use the earlier tables (`profiles`, `user_roles`, `tooth_chart_entries`, `tooth_chart_audit`, `tooth_chart_summaries`, `tooth_chart_summary_versions`, `pedo_case_library`, `dental_images`). They were left untouched. Moving the screens onto the new tables is a separate step.
