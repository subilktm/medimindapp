import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Boxes,
  Building2,
  CreditCard,
  Database,
  LayoutDashboard,
  Loader2,
  Rocket,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceShell, type ShellNavItem } from "@/components/workspace-shell";
import adminAvatar from "@/assets/admin-avatar.jpg";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

const NAV: ShellNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/tenant", label: "Tenant", icon: Building2, exact: false },
  { to: "/admin/subscription", label: "Subscription", icon: CreditCard, exact: false },
  { to: "/admin/features", label: "Features", icon: Boxes, exact: false },
  { to: "/admin/deployment", label: "Deployment", icon: Rocket, exact: false },
  { to: "/admin/db-mapping", label: "DB mapping", icon: Database, exact: false },
];

function AdminLayout() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-guard"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { isAdmin: false, name: "", username: "" };
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", auth.user.id),
        supabase.from("profiles").select("full_name, username").eq("id", auth.user.id).maybeSingle(),
      ]);
      return {
        isAdmin: Boolean(roles?.some((r) => r.role === "admin")),
        name: profile?.full_name ?? profile?.username ?? "",
        username: profile?.username ?? "admin",
      };
    },
  });

  useEffect(() => {
    if (!isLoading && data && !data.isAdmin) navigate({ to: "/dashboard" });
  }, [isLoading, data, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isLoading || !data?.isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <WorkspaceShell
      section="Administration"
      items={NAV}
      name={data.name}
      username={data.username}
      avatarSrc={adminAvatar}
      searchPlaceholder="Search tenants, features, or deployments..."
      onSignOut={signOut}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
