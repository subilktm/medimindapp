import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  CalendarCheck,
  ClipboardPlus,
  LayoutDashboard,
  Loader2,
  Receipt,
  Smile,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceShell, type ShellNavItem } from "@/components/workspace-shell";
import receptionAvatar from "@/assets/reception-avatar.jpg";

export const Route = createFileRoute("/_authenticated/reception")({
  component: ReceptionLayout,
});

const NAV: ShellNavItem[] = [
  { to: "/reception", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/reception/appointment", label: "Appointment", icon: CalendarCheck, exact: false },
  { to: "/reception/registration", label: "Registration", icon: UserPlus, exact: false },
  { to: "/reception/service-billing", label: "Service Billing", icon: Receipt, exact: false },
  { to: "/reception/walk-in", label: "Walk In Patient", icon: ClipboardPlus, exact: false },
  { to: "/reception/dental-care", label: "Pediatric Dental", icon: Smile, exact: false },
];

function ReceptionLayout() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["reception-guard"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return { allowed: false, name: "", username: "" };
      const [{ data: roles }, { data: profile }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", auth.user.id),
        supabase.from("profiles").select("full_name, username").eq("id", auth.user.id).maybeSingle(),
      ]);
      return {
        allowed: Boolean(roles?.some((r) => r.role === "receptionist" || r.role === "admin")),
        name: profile?.full_name ?? profile?.username ?? "",
        username: profile?.username ?? "reception",
      };
    },
  });

  useEffect(() => {
    if (!isLoading && data && !data.allowed) navigate({ to: "/dashboard" });
  }, [isLoading, data, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isLoading || !data?.allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <WorkspaceShell
      section="Front desk"
      items={NAV}
      name={data.name}
      username={data.username}
      avatarSrc={receptionAvatar}
      searchPlaceholder="Search patients, appointments, or bills..."
      onSignOut={signOut}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
