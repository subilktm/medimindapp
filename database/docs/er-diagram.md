# MediMind EMR — Entity relationship diagram

Generated from the live foreign keys. Audit/soft-delete columns are omitted for readability; every table also has `created_by`, `created_at`, `updated_by`, `updated_at`, `is_active`, `deleted_at`.

## Overview (all tables, relationships only)

```mermaid
erDiagram
    staff_member ||--o{ ai_summary : "generated_by_staff_id"
    patient ||--o{ ai_summary : "patient_id"
    staff_member ||--o{ ai_summary : "reviewed_by_staff_id"
    department ||--o{ appointment : "department_id"
    patient ||--o{ appointment : "patient_id"
    staff_member ||--o{ appointment : "staff_member_id"
    user_account ||--o{ audit_log : "changed_by"
    staff_member ||--o{ clinical_note : "author_staff_id"
    encounter ||--o{ clinical_note : "encounter_id"
    encounter ||--o{ clinical_order : "encounter_id"
    staff_member ||--o{ clinical_order : "ordered_by_staff_id"
    patient ||--o{ clinical_order : "patient_id"
    encounter ||--o{ dental_image : "encounter_id"
    patient ||--o{ dental_image : "patient_id"
    facility ||--o{ department : "facility_id"
    tenant ||--o{ department : "tenant_id"
    encounter ||--o{ diagnosis : "encounter_id"
    patient ||--o{ diagnosis : "patient_id"
    staff_member ||--o{ diagnosis : "recorded_by_staff_id"
    appointment ||--o{ encounter : "appointment_id"
    staff_member ||--o{ encounter : "attending_staff_id"
    department ||--o{ encounter : "department_id"
    patient ||--o{ encounter : "patient_id"
    tenant ||--o{ facility : "tenant_id"
    encounter ||--o{ invoice : "encounter_id"
    patient ||--o{ invoice : "patient_id"
    invoice ||--o{ invoice_line : "invoice_id"
    service_item ||--o{ invoice_line : "service_item_id"
    staff_member ||--o{ medication_administration : "administered_by_staff_id"
    medication_order ||--o{ medication_administration : "medication_order_id"
    encounter ||--o{ medication_order : "encounter_id"
    patient ||--o{ medication_order : "patient_id"
    staff_member ||--o{ medication_order : "prescriber_staff_id"
    clinical_order ||--o{ order_result : "clinical_order_id"
    staff_member ||--o{ order_result : "verified_by_staff_id"
    patient ||--o{ patient_allergy : "patient_id"
    staff_member ||--o{ patient_allergy : "recorded_by_staff_id"
    patient ||--o{ patient_contact : "patient_id"
    patient ||--o{ patient_history_entry : "patient_id"
    patient ||--o{ patient_immunization : "patient_id"
    patient ||--o{ patient_insurance : "patient_id"
    reference_case ||--o{ reference_case_criterion : "reference_case_id"
    feature ||--o{ tenant_feature : "feature_id"
    subscription_plan ||--o{ tenant_subscription : "subscription_plan_id"
    encounter ||--o{ tooth_finding : "encounter_id"
    patient ||--o{ tooth_finding : "patient_id"
    staff_member ||--o{ tooth_finding : "recorded_by_staff_id"
    tooth_finding ||--o{ tooth_surface_finding : "tooth_finding_id"
    staff_member ||--o{ user_account : "staff_member_id"
    role ||--o{ user_account_role : "role_id"
    user_account ||--o{ user_account_role : "user_account_id"
    encounter ||--o{ vital_sign_set : "encounter_id"
    patient ||--o{ vital_sign_set : "patient_id"
    staff_member ||--o{ vital_sign_set : "recorded_by_staff_id"
```

## Organisation, identity & subscription

```mermaid
erDiagram
    facility ||--o{ department : "facility_id"
    tenant ||--o{ department : "tenant_id"
    tenant ||--o{ facility : "tenant_id"
    facility ||--o{ staff_member : "facility_id"
    tenant ||--o{ staff_member : "tenant_id"
    feature ||--o{ tenant_feature : "feature_id"
    tenant ||--o{ tenant_feature : "tenant_id"
    subscription_plan ||--o{ tenant_subscription : "subscription_plan_id"
    tenant ||--o{ tenant_subscription : "tenant_id"
    staff_member ||--o{ user_account : "staff_member_id"
    tenant ||--o{ user_account : "tenant_id"
    facility ||--o{ user_account_role : "facility_id"
    role ||--o{ user_account_role : "role_id"
    tenant ||--o{ user_account_role : "tenant_id"
    user_account ||--o{ user_account_role : "user_account_id"
    tenant {
        uuid id PK
        varchar code
        varchar name
        varchar country_code
        varchar time_zone
    }
    facility {
        uuid id PK
        uuid tenant_id FK
        varchar code
        varchar name
        varchar license_no
        varchar address
        varchar phone
    }
    department {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar code
        varchar name
        varchar specialty
    }
    staff_member {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar first_name
        varchar last_name
        varchar title
        varchar profession
        varchar specialty
        varchar license_no
        varchar email
        varchar phone
    }
    user_account {
        uuid id PK
        uuid tenant_id FK
        uuid auth_user_id
        varchar username
        uuid staff_member_id FK
        timestamp last_login_at
    }
    role {
        uuid id PK
        varchar code
        varchar name
        varchar description
    }
    user_account_role {
        uuid id PK
        uuid tenant_id FK
        uuid user_account_id FK
        uuid role_id FK
        uuid facility_id FK
    }
    subscription_plan {
        uuid id PK
        varchar code
        varchar name
        numeric monthly_price
        varchar currency_code
        integer max_facilities
        integer max_users
    }
    tenant_subscription {
        uuid id PK
        uuid tenant_id FK
        uuid subscription_plan_id FK
        date starts_on
        date ends_on
        varchar status
    }
    feature {
        uuid id PK
        varchar code
        varchar name
        varchar description
    }
    tenant_feature {
        uuid id PK
        uuid tenant_id FK
        uuid feature_id FK
        boolean is_enabled
    }
```

## Patient, scheduling & encounters

```mermaid
erDiagram
    department ||--o{ appointment : "department_id"
    facility ||--o{ appointment : "facility_id"
    patient ||--o{ appointment : "patient_id"
    staff_member ||--o{ appointment : "staff_member_id"
    tenant ||--o{ appointment : "tenant_id"
    staff_member ||--o{ clinical_note : "author_staff_id"
    encounter ||--o{ clinical_note : "encounter_id"
    tenant ||--o{ clinical_note : "tenant_id"
    facility ||--o{ department : "facility_id"
    tenant ||--o{ department : "tenant_id"
    encounter ||--o{ diagnosis : "encounter_id"
    patient ||--o{ diagnosis : "patient_id"
    staff_member ||--o{ diagnosis : "recorded_by_staff_id"
    tenant ||--o{ diagnosis : "tenant_id"
    appointment ||--o{ encounter : "appointment_id"
    staff_member ||--o{ encounter : "attending_staff_id"
    department ||--o{ encounter : "department_id"
    facility ||--o{ encounter : "facility_id"
    patient ||--o{ encounter : "patient_id"
    tenant ||--o{ encounter : "tenant_id"
    tenant ||--o{ facility : "tenant_id"
    facility ||--o{ patient : "facility_id"
    tenant ||--o{ patient : "tenant_id"
    patient ||--o{ patient_allergy : "patient_id"
    staff_member ||--o{ patient_allergy : "recorded_by_staff_id"
    tenant ||--o{ patient_allergy : "tenant_id"
    patient ||--o{ patient_contact : "patient_id"
    tenant ||--o{ patient_contact : "tenant_id"
    patient ||--o{ patient_history_entry : "patient_id"
    tenant ||--o{ patient_history_entry : "tenant_id"
    patient ||--o{ patient_immunization : "patient_id"
    tenant ||--o{ patient_immunization : "tenant_id"
    patient ||--o{ patient_insurance : "patient_id"
    tenant ||--o{ patient_insurance : "tenant_id"
    facility ||--o{ staff_member : "facility_id"
    tenant ||--o{ staff_member : "tenant_id"
    encounter ||--o{ vital_sign_set : "encounter_id"
    patient ||--o{ vital_sign_set : "patient_id"
    staff_member ||--o{ vital_sign_set : "recorded_by_staff_id"
    tenant ||--o{ vital_sign_set : "tenant_id"
    tenant {
        uuid id PK
        varchar code
        varchar name
        varchar country_code
        varchar time_zone
    }
    facility {
        uuid id PK
        uuid tenant_id FK
        varchar code
        varchar name
        varchar license_no
        varchar address
        varchar phone
    }
    department {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar code
        varchar name
        varchar specialty
    }
    staff_member {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar first_name
        varchar last_name
        varchar title
        varchar profession
        varchar specialty
        varchar license_no
        varchar email
        varchar phone
    }
    patient {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar mrn
        varchar first_name
        varchar last_name
        date date_of_birth
        varchar sex
        varchar blood_group
        varchar national_id
        varchar mobile
        varchar email
    }
    patient_contact {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        varchar contact_type
        varchar full_name
        varchar relationship
        varchar phone
        varchar national_id
        boolean is_legal_guardian
    }
    patient_allergy {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        varchar allergen
        varchar reaction
        varchar severity
        date recorded_on
        uuid recorded_by_staff_id FK
    }
    patient_insurance {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        varchar payer_name
        varchar policy_no
        varchar member_no
        varchar eligibility_status
        date valid_from
        date valid_to
    }
    patient_history_entry {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        varchar category
        varchar description
        varchar relation
        varchar onset_text
        varchar status
        varchar facility_name
        varchar notes
        boolean is_flagged
    }
    patient_immunization {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        varchar vaccine
        date administered_on
        varchar administered_text
        integer dose_no
        varchar status
    }
    appointment {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        uuid department_id FK
        uuid patient_id FK
        uuid staff_member_id FK
        timestamp scheduled_start
        timestamp scheduled_end
        varchar reason
        varchar status
    }
    encounter {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        uuid department_id FK
        uuid patient_id FK
        uuid attending_staff_id FK
        uuid appointment_id FK
        varchar encounter_no
        varchar encounter_type
        varchar status
        timestamp admitted_at
        timestamp discharged_at
        varchar room
        varchar chief_complaint
        varchar summary
        varchar disposition
        varchar follow_up
    }
    clinical_note {
        uuid id PK
        uuid tenant_id FK
        uuid encounter_id FK
        uuid author_staff_id FK
        varchar note_type
        varchar subjective
        varchar objective
        varchar assessment
        varchar plan_of_care
        timestamp signed_at
    }
    vital_sign_set {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        uuid encounter_id FK
        timestamp recorded_at
        uuid recorded_by_staff_id FK
        integer systolic_mmhg
        integer diastolic_mmhg
        integer pulse_bpm
        numeric temperature_c
        integer spo2_percent
        integer respiratory_rate
        integer pain_score
        numeric weight_kg
        numeric height_cm
    }
    diagnosis {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        uuid encounter_id FK
        varchar icd10_code
        varchar description
        varchar diagnosis_type
        varchar status
        date onset_date
        date resolved_date
        uuid recorded_by_staff_id FK
    }
```

## Orders, medications, dental, AI & billing

```mermaid
erDiagram
    staff_member ||--o{ ai_summary : "generated_by_staff_id"
    patient ||--o{ ai_summary : "patient_id"
    staff_member ||--o{ ai_summary : "reviewed_by_staff_id"
    encounter ||--o{ clinical_order : "encounter_id"
    staff_member ||--o{ clinical_order : "ordered_by_staff_id"
    patient ||--o{ clinical_order : "patient_id"
    encounter ||--o{ dental_image : "encounter_id"
    patient ||--o{ dental_image : "patient_id"
    staff_member ||--o{ encounter : "attending_staff_id"
    patient ||--o{ encounter : "patient_id"
    encounter ||--o{ invoice : "encounter_id"
    patient ||--o{ invoice : "patient_id"
    invoice ||--o{ invoice_line : "invoice_id"
    service_item ||--o{ invoice_line : "service_item_id"
    staff_member ||--o{ medication_administration : "administered_by_staff_id"
    medication_order ||--o{ medication_administration : "medication_order_id"
    encounter ||--o{ medication_order : "encounter_id"
    patient ||--o{ medication_order : "patient_id"
    staff_member ||--o{ medication_order : "prescriber_staff_id"
    clinical_order ||--o{ order_result : "clinical_order_id"
    staff_member ||--o{ order_result : "verified_by_staff_id"
    reference_case ||--o{ reference_case_criterion : "reference_case_id"
    encounter ||--o{ tooth_finding : "encounter_id"
    patient ||--o{ tooth_finding : "patient_id"
    staff_member ||--o{ tooth_finding : "recorded_by_staff_id"
    tooth_finding ||--o{ tooth_surface_finding : "tooth_finding_id"
    patient {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar mrn
        varchar first_name
        varchar last_name
        date date_of_birth
        varchar sex
        varchar blood_group
        varchar national_id
        varchar mobile
        varchar email
    }
    encounter {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        uuid department_id FK
        uuid patient_id FK
        uuid attending_staff_id FK
        uuid appointment_id FK
        varchar encounter_no
        varchar encounter_type
        varchar status
        timestamp admitted_at
        timestamp discharged_at
        varchar room
        varchar chief_complaint
        varchar summary
        varchar disposition
        varchar follow_up
    }
    staff_member {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        varchar first_name
        varchar last_name
        varchar title
        varchar profession
        varchar specialty
        varchar license_no
        varchar email
        varchar phone
    }
    clinical_order {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        uuid patient_id FK
        uuid encounter_id FK
        uuid ordered_by_staff_id FK
        varchar order_type
        varchar name
        varchar priority
        varchar status
        timestamp ordered_at
    }
    order_result {
        uuid id PK
        uuid tenant_id FK
        uuid clinical_order_id FK
        varchar result_name
        varchar result_value
        varchar unit
        varchar reference_range
        varchar abnormal_flag
        timestamp resulted_at
        uuid verified_by_staff_id FK
    }
    medication_order {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        uuid encounter_id FK
        uuid prescriber_staff_id FK
        varchar drug_name
        varchar strength
        varchar dose_form
        varchar route
        varchar frequency
        varchar status
        varchar indication
        date start_date
        date end_date
        varchar monitoring
        varchar hold_criteria
        varchar safety_note
    }
    medication_administration {
        uuid id PK
        uuid tenant_id FK
        uuid medication_order_id FK
        timestamp administered_at
        uuid administered_by_staff_id FK
        varchar dose_given
        varchar status
        varchar note
    }
    tooth_finding {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        uuid encounter_id FK
        varchar tooth_number
        varchar dentition
        varchar tooth_state
        uuid recorded_by_staff_id FK
    }
    tooth_surface_finding {
        uuid id PK
        uuid tenant_id FK
        uuid tooth_finding_id FK
        varchar surface
        varchar finding
    }
    dental_image {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        uuid encounter_id FK
        varchar tooth_number
        varchar image_type
        varchar storage_path
        varchar file_name
        varchar content_type
        varchar note
    }
    ai_summary {
        uuid id PK
        uuid tenant_id FK
        uuid patient_id FK
        integer version_no
        varchar summary_type
        varchar headline
        varchar summary_text
        varchar model
        varchar case_source
        integer case_count
        integer finding_count
        varchar status
        uuid generated_by_staff_id FK
        timestamp generated_at
        uuid reviewed_by_staff_id FK
        timestamp reviewed_at
        varchar review_note
    }
    reference_case {
        uuid id PK
        uuid tenant_id FK
        varchar title
        varchar presentation
        varchar management
        varchar evidence
        varchar source_name
        integer min_surfaces
    }
    reference_case_criterion {
        uuid id PK
        uuid tenant_id FK
        uuid reference_case_id FK
        varchar criterion_type
        varchar criterion_value
    }
    service_item {
        uuid id PK
        uuid tenant_id FK
        varchar code
        varchar name
        varchar category
        numeric unit_price
        varchar currency_code
    }
    invoice {
        uuid id PK
        uuid tenant_id FK
        uuid facility_id FK
        uuid patient_id FK
        uuid encounter_id FK
        varchar invoice_no
        varchar status
        timestamp issued_at
        numeric total_amount
        numeric patient_share
        varchar currency_code
    }
    invoice_line {
        uuid id PK
        uuid tenant_id FK
        uuid invoice_id FK
        uuid service_item_id FK
        integer quantity
        numeric unit_price
        numeric line_total
    }
```

## Tenancy rule

Every table except the global catalogues (`role`, `subscription_plan`, `feature`) carries `tenant_id → tenant.id`. Tables that belong to a site also carry `facility_id → facility.id`. Tenant links are drawn in the overview only where they are the sole parent.
