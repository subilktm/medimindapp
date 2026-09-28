-- =====================================================================
-- MediMind portable EMR schema — Migration 1: organisation + identity
-- Portable design: UUID PKs, VARCHAR/NUMERIC/BOOLEAN/DATE/TIMESTAMP only,
-- UTC timestamps, soft delete (is_active + deleted_at), audit columns,
-- named explicit foreign keys, no arrays / JSONB / enums / extensions / triggers.
-- =====================================================================

-- ---------- tenant ----------
CREATE TABLE public.tenant (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL,
  name VARCHAR(200) NOT NULL,
  country_code VARCHAR(2) NOT NULL DEFAULT 'AE',
  time_zone VARCHAR(64) NOT NULL DEFAULT 'Asia/Dubai',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_tenant PRIMARY KEY (id),
  CONSTRAINT uq_tenant_code UNIQUE (code)
);

-- ---------- facility ----------
CREATE TABLE public.facility (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(200) NOT NULL,
  license_no VARCHAR(60) NULL,
  address VARCHAR(400) NULL,
  phone VARCHAR(40) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_facility PRIMARY KEY (id),
  CONSTRAINT uq_facility_tenant_code UNIQUE (tenant_id, code),
  CONSTRAINT fk_facility_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id)
);

-- ---------- department ----------
CREATE TABLE public.department (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(200) NOT NULL,
  specialty VARCHAR(100) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_department PRIMARY KEY (id),
  CONSTRAINT uq_department_facility_code UNIQUE (facility_id, code),
  CONSTRAINT fk_department_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_department_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id)
);

-- ---------- staff_member (clinical / workforce person record) ----------
CREATE TABLE public.staff_member (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  facility_id UUID NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(40) NULL,
  profession VARCHAR(30) NOT NULL DEFAULT 'Other',
  specialty VARCHAR(100) NULL,
  license_no VARCHAR(60) NULL,
  email VARCHAR(200) NULL,
  phone VARCHAR(40) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_staff_member PRIMARY KEY (id),
  CONSTRAINT ck_staff_member_profession CHECK (profession IN ('Physician','Dentist','Nurse','Administrator','FrontDesk','Other')),
  CONSTRAINT fk_staff_member_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_staff_member_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id)
);

-- ---------- user_account (sign-in reference, separate from staff_member) ----------
CREATE TABLE public.user_account (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  auth_user_id UUID NOT NULL,
  username VARCHAR(100) NOT NULL,
  staff_member_id UUID NULL,
  last_login_at TIMESTAMP(3) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_user_account PRIMARY KEY (id),
  CONSTRAINT uq_user_account_auth_user UNIQUE (auth_user_id),
  CONSTRAINT uq_user_account_tenant_username UNIQUE (tenant_id, username),
  CONSTRAINT fk_user_account_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_user_account_staff_member FOREIGN KEY (staff_member_id) REFERENCES public.staff_member(id),
  CONSTRAINT fk_user_account_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_user_account_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- audit FKs for tables created before user_account
ALTER TABLE public.tenant ADD CONSTRAINT fk_tenant_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id);
ALTER TABLE public.tenant ADD CONSTRAINT fk_tenant_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id);
ALTER TABLE public.facility ADD CONSTRAINT fk_facility_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id);
ALTER TABLE public.facility ADD CONSTRAINT fk_facility_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id);
ALTER TABLE public.department ADD CONSTRAINT fk_department_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id);
ALTER TABLE public.department ADD CONSTRAINT fk_department_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id);
ALTER TABLE public.staff_member ADD CONSTRAINT fk_staff_member_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id);
ALTER TABLE public.staff_member ADD CONSTRAINT fk_staff_member_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id);

-- ---------- role (global reference) ----------
CREATE TABLE public.role (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(400) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_role PRIMARY KEY (id),
  CONSTRAINT uq_role_code UNIQUE (code),
  CONSTRAINT fk_role_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_role_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- user_account_role ----------
CREATE TABLE public.user_account_role (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_account_id UUID NOT NULL,
  role_id UUID NOT NULL,
  facility_id UUID NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_user_account_role PRIMARY KEY (id),
  CONSTRAINT uq_user_account_role UNIQUE (user_account_id, role_id, facility_id),
  CONSTRAINT fk_user_account_role_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_user_account_role_user_account FOREIGN KEY (user_account_id) REFERENCES public.user_account(id),
  CONSTRAINT fk_user_account_role_role FOREIGN KEY (role_id) REFERENCES public.role(id),
  CONSTRAINT fk_user_account_role_facility FOREIGN KEY (facility_id) REFERENCES public.facility(id),
  CONSTRAINT fk_user_account_role_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_user_account_role_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- subscription_plan (global reference) ----------
CREATE TABLE public.subscription_plan (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code VARCHAR(40) NOT NULL,
  name VARCHAR(100) NOT NULL,
  monthly_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency_code VARCHAR(3) NOT NULL DEFAULT 'AED',
  max_facilities INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_subscription_plan PRIMARY KEY (id),
  CONSTRAINT uq_subscription_plan_code UNIQUE (code),
  CONSTRAINT fk_subscription_plan_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_subscription_plan_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- tenant_subscription ----------
CREATE TABLE public.tenant_subscription (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  subscription_plan_id UUID NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_tenant_subscription PRIMARY KEY (id),
  CONSTRAINT ck_tenant_subscription_status CHECK (status IN ('Trial','Active','Suspended','Cancelled')),
  CONSTRAINT fk_tenant_subscription_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_tenant_subscription_plan FOREIGN KEY (subscription_plan_id) REFERENCES public.subscription_plan(id),
  CONSTRAINT fk_tenant_subscription_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_tenant_subscription_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- feature (global reference) ----------
CREATE TABLE public.feature (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  code VARCHAR(60) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(400) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_feature PRIMARY KEY (id),
  CONSTRAINT uq_feature_code UNIQUE (code),
  CONSTRAINT fk_feature_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_feature_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- tenant_feature ----------
CREATE TABLE public.tenant_feature (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  feature_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMP(3) NULL,
  created_by UUID NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  updated_by UUID NULL,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT (now() AT TIME ZONE 'UTC'),
  CONSTRAINT pk_tenant_feature PRIMARY KEY (id),
  CONSTRAINT uq_tenant_feature UNIQUE (tenant_id, feature_id),
  CONSTRAINT fk_tenant_feature_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenant(id),
  CONSTRAINT fk_tenant_feature_feature FOREIGN KEY (feature_id) REFERENCES public.feature(id),
  CONSTRAINT fk_tenant_feature_created_by FOREIGN KEY (created_by) REFERENCES public.user_account(id),
  CONSTRAINT fk_tenant_feature_updated_by FOREIGN KEY (updated_by) REFERENCES public.user_account(id)
);

-- ---------- access helper functions (read-only; PostgreSQL access layer only) ----------
CREATE OR REPLACE FUNCTION public.app_is_tenant_member(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_account ua
    WHERE ua.auth_user_id = auth.uid() AND ua.tenant_id = _tenant_id
      AND ua.is_active = TRUE AND ua.deleted_at IS NULL
  )
$$;

CREATE OR REPLACE FUNCTION public.app_has_tenant_role(_tenant_id UUID, _role_code VARCHAR)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_account ua
    JOIN public.user_account_role uar ON uar.user_account_id = ua.id AND uar.is_active = TRUE AND uar.deleted_at IS NULL
    JOIN public.role r ON r.id = uar.role_id AND r.is_active = TRUE
    WHERE ua.auth_user_id = auth.uid() AND ua.tenant_id = _tenant_id
      AND ua.is_active = TRUE AND ua.deleted_at IS NULL AND r.code = _role_code
  )
$$;

CREATE OR REPLACE FUNCTION public.app_is_tenant_admin(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.app_has_tenant_role(_tenant_id, 'admin')
$$;

CREATE OR REPLACE FUNCTION public.app_can_write_clinical(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.app_has_tenant_role(_tenant_id, 'admin')
      OR public.app_has_tenant_role(_tenant_id, 'clinician')
      OR public.app_has_tenant_role(_tenant_id, 'doctor')
      OR public.app_has_tenant_role(_tenant_id, 'nurse')
$$;

CREATE OR REPLACE FUNCTION public.app_can_write_front_desk(_tenant_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.app_can_write_clinical(_tenant_id)
      OR public.app_has_tenant_role(_tenant_id, 'receptionist')
$$;

REVOKE EXECUTE ON FUNCTION public.app_is_tenant_member(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.app_has_tenant_role(UUID, VARCHAR) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.app_is_tenant_admin(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.app_can_write_clinical(UUID) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.app_can_write_front_desk(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.app_is_tenant_member(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.app_has_tenant_role(UUID, VARCHAR) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.app_is_tenant_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.app_can_write_clinical(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.app_can_write_front_desk(UUID) TO authenticated, service_role;

-- ---------- grants (no DELETE: soft delete only) ----------
GRANT SELECT ON public.role, public.subscription_plan, public.feature TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tenant, public.facility, public.department, public.staff_member,
  public.user_account, public.user_account_role, public.tenant_subscription, public.tenant_feature TO authenticated;
GRANT ALL ON public.tenant, public.facility, public.department, public.staff_member, public.user_account,
  public.role, public.user_account_role, public.subscription_plan, public.tenant_subscription,
  public.feature, public.tenant_feature TO service_role;

-- ---------- row-level security ----------
ALTER TABLE public.tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.department ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_member ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_account ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_account_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_feature ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_select ON public.tenant FOR SELECT TO authenticated USING (public.app_is_tenant_member(id));
CREATE POLICY tenant_update ON public.tenant FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(id)) WITH CHECK (public.app_is_tenant_admin(id));

CREATE POLICY facility_select ON public.facility FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY facility_insert ON public.facility FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY facility_update ON public.facility FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

CREATE POLICY department_select ON public.department FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY department_insert ON public.department FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY department_update ON public.department FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

CREATE POLICY staff_member_select ON public.staff_member FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY staff_member_insert ON public.staff_member FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY staff_member_update ON public.staff_member FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

CREATE POLICY user_account_select ON public.user_account FOR SELECT TO authenticated USING (auth_user_id = auth.uid() OR public.app_is_tenant_member(tenant_id));
CREATE POLICY user_account_insert ON public.user_account FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY user_account_update ON public.user_account FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

CREATE POLICY role_select ON public.role FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY subscription_plan_select ON public.subscription_plan FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY feature_select ON public.feature FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY user_account_role_select ON public.user_account_role FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY user_account_role_insert ON public.user_account_role FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY user_account_role_update ON public.user_account_role FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

CREATE POLICY tenant_subscription_select ON public.tenant_subscription FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY tenant_subscription_insert ON public.tenant_subscription FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY tenant_subscription_update ON public.tenant_subscription FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));

CREATE POLICY tenant_feature_select ON public.tenant_feature FOR SELECT TO authenticated USING (public.app_is_tenant_member(tenant_id));
CREATE POLICY tenant_feature_insert ON public.tenant_feature FOR INSERT TO authenticated WITH CHECK (public.app_is_tenant_admin(tenant_id));
CREATE POLICY tenant_feature_update ON public.tenant_feature FOR UPDATE TO authenticated USING (public.app_is_tenant_admin(tenant_id)) WITH CHECK (public.app_is_tenant_admin(tenant_id));
