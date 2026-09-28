import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MenuItem = {
  to: string;
  label: string;
  icon: string;
  exact: boolean;
};

export type WorkspaceMenu = {
  allowed: boolean;
  name: string;
  username: string;
  items: MenuItem[];
};

const CLINICIAN_MENU: MenuItem[] = [
  { to: "/clinician", label: "Overview", icon: "layout-dashboard", exact: true },
  { to: "/clinician/patients", label: "Patient List", icon: "users", exact: false },
  { to: "/clinician/tasks", label: "Tasks & Messages", icon: "message-square", exact: false },
  { to: "/clinician/reports", label: "Reports", icon: "file-text", exact: false },
  { to: "/clinician/case-library", label: "Case Library", icon: "book-open", exact: false },
];

/**
 * Menu source of truth for the clinician workspace. The client renders whatever
 * this endpoint returns, so menu changes never need a UI edit.
 */
export const getClinicianMenu = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WorkspaceMenu> => {
    const [{ data: roles }, { data: profile }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", context.userId)
        .maybeSingle(),
    ]);

    const allowed = Boolean(
      roles?.some((r) => r.role === "clinician" || r.role === "doctor" || r.role === "nurse"),
    );

    return {
      allowed,
      name: profile?.full_name ?? profile?.username ?? "",
      username: profile?.username ?? "clinician",
      items: allowed ? CLINICIAN_MENU : [],
    };
  });
