import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import {
  FileText,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Users,
  type LucideIcon,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WorkspaceShell, type ShellNavItem } from "@/components/workspace-shell";
import { getClinicianMenu } from "@/lib/workspace-menu.functions";
import clinicianAvatar from "@/assets/clinician-avatar.jpg";

export const Route = createFileRoute("/_authenticated/clinician")({
  component: ClinicianLayout,
});

const ICONS: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  users: Users,
  "message-square": MessageSquare,
  "file-text": FileText,
  "book-open": BookOpen,
};

function ClinicianLayout() {
  const navigate = useNavigate();
  const fetchMenu = useServerFn(getClinicianMenu);

  const { data, isLoading } = useQuery({
    queryKey: ["clinician-menu"],
    queryFn: () => fetchMenu(),
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

  const items: ShellNavItem[] = data.items.map((item) => ({
    to: item.to,
    label: item.label,
    icon: ICONS[item.icon] ?? LayoutDashboard,
    exact: item.exact,
  }));

  return (
    <WorkspaceShell
      section="Clinician"
      items={items}
      name={data.name}
      username={data.username}
      avatarSrc={clinicianAvatar}
      searchPlaceholder="Search patient records, labs, or ICD-10..."
      onSignOut={signOut}
    >
      <Outlet />
    </WorkspaceShell>
  );
}
