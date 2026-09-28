-- =====================================================================
-- MediMind portable EMR schema — Migration 2: patient, scheduling, encounters
-- =====================================================================

-- ---------- patient ----------
CREATE TABLE public.patient (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  mrn VARCHAR(40) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  sex VARCHAR(10) NOT NULL,
  blood_group VARCHAR(5) NULL,
  national_id VARCHAR(40) NULL,
  mobile VARCHAR(40) NULL,
  email VARCHAR(200) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_patient PRIMARY KEY (id),
  CONSTRAINT uq_patient_tenant_mrn UNIQUE (tenant_id, mrn),
  CONSTRAINT ck_patient_sex CHECK (sex IN ('Female','Male','Other','Unknown')),
  CONSTRAINT fk_patient_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_patient_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_patient_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_patient_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- patient_contact ----------
CREATE TABLE public.patient_contact (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  contact_type VARCHAR(20) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  relationship VARCHAR(60) NULL,
  phone VARCHAR(40) NULL,
  national_id VARCHAR(40) NULL,
  is_legal_guardian BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_patient_contact PRIMARY KEY (id),
  CONSTRAINT ck_patient_contact_type CHECK (contact_type IN ('Guardian','Emergency','NextOfKin')),
  CONSTRAINT fk_patient_contact_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_patient_contact_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_patient_contact_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_patient_contact_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- patient_allergy ----------
CREATE TABLE public.patient_allergy (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  allergen VARCHAR(200) NOT NULL,
  reaction VARCHAR(400) NULL,
  severity VARCHAR(10) NOT NULL DEFAULT 'Mild',
  recorded_on DATE NULL,
  recorded_by_staff_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_patient_allergy PRIMARY KEY (id),
  CONSTRAINT ck_patient_allergy_severity CHECK (severity IN ('None','Mild','Moderate','Severe')),
  CONSTRAINT fk_patient_allergy_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_patient_allergy_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_patient_allergy_recorded_by FOREIGN KEY (recorded_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_patient_allergy_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_patient_allergy_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- patient_insurance ----------
CREATE TABLE public.patient_insurance (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  payer_name VARCHAR(200) NOT NULL,
  policy_no VARCHAR(60) NOT NULL,
  member_no VARCHAR(60) NULL,
  eligibility_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  valid_from DATE NULL,
  valid_to DATE NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_patient_insurance PRIMARY KEY (id),
  CONSTRAINT ck_patient_insurance_eligibility CHECK (eligibility_status IN ('Pending','Verified','Rejected','Expired')),
  CONSTRAINT fk_patient_insurance_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_patient_insurance_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_patient_insurance_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_patient_insurance_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- patient_history_entry ----------
CREATE TABLE public.patient_history_entry (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  category VARCHAR(20) NOT NULL,
  description VARCHAR(400) NOT NULL,
  relation VARCHAR(60) NULL,
  onset_text VARCHAR(60) NULL,
  status VARCHAR(20) NULL,
  facility_name VARCHAR(200) NULL,
  notes VARCHAR(2000) NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_patient_history_entry PRIMARY KEY (id),
  CONSTRAINT ck_patient_history_entry_category CHECK (category IN ('PastMedical','Surgical','Family','Social','Screening')),
  CONSTRAINT ck_patient_history_entry_status CHECK (status IS NULL OR status IN ('Ongoing','Controlled','Resolved')),
  CONSTRAINT fk_patient_history_entry_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_patient_history_entry_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_patient_history_entry_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_patient_history_entry_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- patient_immunization ----------
CREATE TABLE public.patient_immunization (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  vaccine VARCHAR(200) NOT NULL,
  administered_on DATE NULL,
  administered_text VARCHAR(60) NULL,
  dose_no INTEGER NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'UpToDate',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_patient_immunization PRIMARY KEY (id),
  CONSTRAINT ck_patient_immunization_status CHECK (status IN ('UpToDate','Due','CompletedSeries')),
  CONSTRAINT fk_patient_immunization_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_patient_immunization_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_patient_immunization_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_patient_immunization_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- appointment ----------
CREATE TABLE public.appointment (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  department_id UUID NULL,
  patient_id UUID NOT NULL,
  staff_member_id UUID NULL,
  scheduled_start TIMESTAMP(3) NOT NULL,
  scheduled_end TIMESTAMP(3) NOT NULL,
  reason VARCHAR(400) NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_appointment PRIMARY KEY (id),
  CONSTRAINT ck_appointment_status CHECK (status IN ('Scheduled','Confirmed','CheckedIn','Completed','Cancelled','NoShow')),
  CONSTRAINT ck_appointment_time CHECK (scheduled_end > scheduled_start),
  CONSTRAINT fk_appointment_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_appointment_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_appointment_department FOREIGN KEY (department_id) REFERENCES public.department(id),
  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_appointment_staff_member FOREIGN KEY (staff_member_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_appointment_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_appointment_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- encounter ----------
CREATE TABLE public.encounter (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  department_id UUID NULL,
  patient_id UUID NOT NULL,
  attending_staff_id UUID NULL,
  appointment_id UUID NULL,
  encounter_no VARCHAR(40) NOT NULL,
  encounter_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  admitted_at TIMESTAMP(3) NOT NULL,
  discharged_at TIMESTAMP(3) NULL,
  room VARCHAR(20) NULL,
  chief_complaint VARCHAR(400) NULL,
  summary VARCHAR(2000) NULL,
  disposition VARCHAR(400) NULL,
  follow_up VARCHAR(400) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_encounter PRIMARY KEY (id),
  CONSTRAINT uq_encounter_tenant_no UNIQUE (tenant_id, encounter_no),
  CONSTRAINT ck_encounter_type CHECK (encounter_type IN ('Inpatient','Outpatient','Emergency','Dental')),
  CONSTRAINT ck_encounter_status CHECK (status IN ('Active','Completed','Discharged','Cancelled')),
  CONSTRAINT fk_encounter_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_encounter_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_encounter_department FOREIGN KEY (department_id) REFERENCES public.department(id),
  CONSTRAINT fk_encounter_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_encounter_attending_staff FOREIGN KEY (attending_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_encounter_appointment FOREIGN KEY (appointment_id) REFERENCES public.appointment(id),
  CONSTRAINT fk_encounter_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_encounter_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- clinical_note (SOAP stored as separate columns) ----------
CREATE TABLE public.clinical_note (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  encounter_id UUID NOT NULL,
  author_staff_id UUID NULL,
  note_type VARCHAR(20) NOT NULL DEFAULT 'SOAP',
  subjective VARCHAR(4000) NULL,
  objective VARCHAR(4000) NULL,
  assessment VARCHAR(4000) NULL,
  plan_of_care VARCHAR(4000) NULL,
  signed_at TIMESTAMP(3) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_clinical_note PRIMARY KEY (id),
  CONSTRAINT ck_clinical_note_type CHECK (note_type IN ('SOAP','Progress','Nursing','Discharge','Dental')),
  CONSTRAINT fk_clinical_note_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_clinical_note_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_clinical_note_author FOREIGN KEY (author_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_clinical_note_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_clinical_note_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- vital_sign_set ----------
CREATE TABLE public.vital_sign_set (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  recorded_at TIMESTAMP(3) NOT NULL,
  recorded_by_staff_id UUID NULL,
  systolic_mmhg INTEGER NULL,
  diastolic_mmhg INTEGER NULL,
  pulse_bpm INTEGER NULL,
  temperature_c NUMERIC(4,1) NULL,
  spo2_percent INTEGER NULL,
  respiratory_rate INTEGER NULL,
  pain_score INTEGER NULL,
  weight_kg NUMERIC(5,1) NULL,
  height_cm NUMERIC(5,1) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_vital_sign_set PRIMARY KEY (id),
  CONSTRAINT ck_vital_sign_set_pain CHECK (pain_score IS NULL OR (pain_score >= 0 AND pain_score <= 10)),
  CONSTRAINT ck_vital_sign_set_spo2 CHECK (spo2_percent IS NULL OR (spo2_percent >= 0 AND spo2_percent <= 100)),
  CONSTRAINT fk_vital_sign_set_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_vital_sign_set_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_vital_sign_set_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_vital_sign_set_recorded_by FOREIGN KEY (recorded_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_vital_sign_set_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_vital_sign_set_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- diagnosis ----------
CREATE TABLE public.diagnosis (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  encounter_id UUID NULL,
  icd10_code VARCHAR(10) NOT NULL,
  description VARCHAR(400) NOT NULL,
  diagnosis_type VARCHAR(20) NOT NULL DEFAULT 'Secondary',
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  onset_date DATE NULL,
  resolved_date DATE NULL,
  recorded_by_staff_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_diagnosis PRIMARY KEY (id),
  CONSTRAINT ck_diagnosis_type CHECK (diagnosis_type IN ('Primary','Secondary','Admitting','Discharge')),
  CONSTRAINT ck_diagnosis_status CHECK (status IN ('Active','Resolved')),
  CONSTRAINT fk_diagnosis_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_diagnosis_patient FOREIGN KEY (patient_id) REFERENCES public.patient(id),
  CONSTRAINT fk_diagnosis_encounter FOREIGN KEY (encounter_id) REFERENCES public.encounter(id),
  CONSTRAINT fk_diagnosis_recorded_by FOREIGN KEY (recorded_by_staff_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_diagnosis_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_diagnosis_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- grants (no DELETE: soft delete only) ----------
GRANT SELECT, INSERT, UPDATE ON public.patient, public.patient_contact, public.patient_allergy, public.patient_insurance,
  public.patient_history_entry, public.patient_immunization, public.appointment, public.encounter,
  public.clinical_note, public.vital_sign_set, public.diagnosis TO authenticated;
GRANT ALL ON public.patient, public.patient_contact, public.patient_allergy, public.patient_insurance,
  public.patient_history_entry, public.patient_immunization, public.appointment, public.encounter,
  public.clinical_note, public.vital_sign_set, public.diagnosis TO service_role;

-- ---------- row-level security ----------
ALTER TABLE public.patient ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_history_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_immunization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_sign_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis ENABLE ROW LEVEL SECURITY;

-- front-desk writable
CREATE POLICY patient_select ON public.patient FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY patient_insert ON public.patient FOR INSERT TO authenticated WITH CHECK (public.app_can_write_front_desk(tenant_id));
CREATE POLICY patient_update ON public.patient FOR UPDATE TO authenticated USING (public.app_can_write_front_desk(tenant_id)) WITH CHECK (public.app_can_write_front_desk(tenant_id));

CREATE POLICY patient_contact_select ON public.patient_contact FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY patient_contact_insert ON public.patient_contact FOR INSERT TO authenticated WITH CHECK (public.app_can_write_front_desk(tenant_id));
CREATE POLICY patient_contact_update ON public.patient_contact FOR UPDATE TO authenticated USING (public.app_can_write_front_desk(tenant_id)) WITH CHECK (public.app_can_write_front_desk(tenant_id));

CREATE POLICY patient_insurance_select ON public.patient_insurance FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY patient_insurance_insert ON public.patient_insurance FOR INSERT TO authenticated WITH CHECK (public.app_can_write_front_desk(tenant_id));
CREATE POLICY patient_insurance_update ON public.patient_insurance FOR UPDATE TO authenticated USING (public.app_can_write_front_desk(tenant_id)) WITH CHECK (public.app_can_write_front_desk(tenant_id));

CREATE POLICY appointment_select ON public.appointment FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY appointment_insert ON public.appointment FOR INSERT TO authenticated WITH CHECK (public.app_can_write_front_desk(tenant_id));
CREATE POLICY appointment_update ON public.appointment FOR UPDATE TO authenticated USING (public.app_can_write_front_desk(tenant_id)) WITH CHECK (public.app_can_write_front_desk(tenant_id));

-- clinical writable
CREATE POLICY patient_allergy_select ON public.patient_allergy FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY patient_allergy_insert ON public.patient_allergy FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY patient_allergy_update ON public.patient_allergy FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY patient_history_entry_select ON public.patient_history_entry FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY patient_history_entry_insert ON public.patient_history_entry FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY patient_history_entry_update ON public.patient_history_entry FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY patient_immunization_select ON public.patient_immunization FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY patient_immunization_insert ON public.patient_immunization FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY patient_immunization_update ON public.patient_immunization FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY encounter_select ON public.encounter FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY encounter_insert ON public.encounter FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY encounter_update ON public.encounter FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY clinical_note_select ON public.clinical_note FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY clinical_note_insert ON public.clinical_note FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY clinical_note_update ON public.clinical_note FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY vital_sign_set_select ON public.vital_sign_set FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY vital_sign_set_insert ON public.vital_sign_set FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY vital_sign_set_update ON public.vital_sign_set FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));

CREATE POLICY diagnosis_select ON public.diagnosis FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY diagnosis_insert ON public.diagnosis FOR INSERT TO authenticated WITH CHECK (public.app_can_write_clinical(tenant_id));
CREATE POLICY diagnosis_update ON public.diagnosis FOR UPDATE TO authenticated USING (public.app_can_write_clinical(tenant_id)) WITH CHECK (public.app_can_write_clinical(tenant_id));
