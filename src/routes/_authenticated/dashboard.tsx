import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Clinical Workspace | MediMind" },
      { name: "description", content: "Your MediMind workspace: patient records, notes and AI-assisted clinical summaries." },
      { property: "og:title", content: "Clinical Workspace | MediMind" },
      { property: "og:description", content: "Your MediMind workspace: patient records, notes and AI-assisted clinical summaries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("username, full_name").eq("id", uid).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
      ]);
      return { profile, roles: roles?.map((r) => r.role) ?? [] };
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-foreground">MediMind</p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Clinical workspace</p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Welcome{data?.profile?.full_name ? `, ${data.profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as {data?.profile?.username ?? "clinician"}
          {data?.roles?.length ? ` · ${data.roles.join(", ")}` : ""}
        </p>
        <div className="mt-10 rounded-xl border border-border bg-card p-8 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Patient records, encounters and AI clinical summaries will appear here as we build them out.
          </p>
        </div>
      </main>
    </div>
  );
}
