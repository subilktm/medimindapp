import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Loader2, Lock, ShieldCheck, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediMind — Secure clinician sign in" },
      {
        name: "description",
        content:
          "Sign in to MediMind, the AI-assisted electronic medical record for clinical teams. Username and password access with self-service password change.",
      },
      { property: "og:title", content: "MediMind — Secure clinician sign in" },
      {
        property: "og:description",
        content:
          "Sign in to MediMind, the AI-assisted electronic medical record for clinical teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "change" | "register";

const ROLES = [
  { value: "clinician", label: "Clinician" },
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "receptionist", label: "Receptionist" },
  { value: "admin", label: "Administrator" },
] as const;

const normalize = (username: string) =>
  username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");

const toEmail = (username: string) => `${normalize(username)}@medimind.local`;

// Short passwords (e.g. the default admin PIN) are padded before they reach the
// auth service, which enforces a six-character minimum.
const toSecret = (password: string) =>
  password.length >= 6 ? password : `${password}#MediMind`;

async function landingRoute() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return "/dashboard" as const;
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", auth.user.id);
  if (roles?.some((r) => r.role === "admin")) return "/admin" as const;
  if (roles?.some((r) => r.role === "receptionist")) return "/reception" as const;
  if (roles?.some((r) => r.role === "clinician" || r.role === "doctor" || r.role === "nurse"))
    return "/clinician" as const;
  return "/dashboard" as const;
}

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string>("doctor");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!normalize(username) || !password) {
      toast.error("Enter your username and password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password: toSecret(password),
    });
    if (error) {
      setBusy(false);
      toast.error("Incorrect username or password.");
      return;
    }
    const to = await landingRoute();
    setBusy(false);
    navigate({ to });
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 4) {
      toast.error("New password must be at least 4 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password: toSecret(password),
    });
    if (signInError) {
      setBusy(false);
      toast.error("Incorrect username or current password.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: toSecret(newPassword),
    });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    const to = await landingRoute();
    setBusy(false);
    toast.success("Password updated.");
    navigate({ to });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const uname = normalize(username);
    if (uname.length < 3) {
      toast.error("Choose a username with at least 3 characters.");
      return;
    }
    if (password.length < 4) {
      toast.error("Password must be at least 4 characters.");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: toEmail(uname),
      password: toSecret(password),
      options: { data: { username: uname, full_name: fullName } },
    });
    if (error || !data.user) {
      setBusy(false);
      toast.error(error?.message ?? "Could not create the account.");
      return;
    }
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, username: uname, full_name: fullName });
    if (profileError) {
      setBusy(false);
      toast.error(
        profileError.code === "23505"
          ? "That username is already taken."
          : profileError.message,
      );
      return;
    }
    await supabase
      .from("user_roles")
      .insert({ user_id: data.user.id, role: role as "doctor" });
    const to = await landingRoute();
    setBusy(false);
    toast.success("Account created.");
    navigate({ to });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-clinical p-12 text-primary-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur">
            <Activity className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">MediMind</span>
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight">
            An AI-assisted record that keeps up with the ward round.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-primary-foreground/80">
            Charting, orders and clinical summaries in one calm workspace — built for
            clinicians who would rather look at the patient than the screen.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs tracking-wide text-primary-foreground/75">
          <ShieldCheck className="size-4" />
          Encrypted access · audit-logged sessions
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <div className="flex items-center gap-2 text-foreground">
              <Activity className="size-5 text-primary" />
              <span className="font-display text-lg font-semibold tracking-tight">MediMind</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-panel lg:mt-0">
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              {mode === "signin" ? "Clinician access" : mode === "change" ? "Password change" : "New clinician"}
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-foreground">
              {mode === "signin"
                ? "Sign in to your workspace"
                : mode === "change"
                  ? "Change your password"
                  : "Create your account"}
            </h2>

            <form
              className="mt-7 space-y-5"
              onSubmit={
                mode === "signin"
                  ? handleSignIn
                  : mode === "change"
                    ? handleChangePassword
                    : handleRegister
              }
            >
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    autoComplete="username"
                    className="pl-9"
                    placeholder="j.mathew"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {mode === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      placeholder="Dr. Jane Mathew"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.value} value={r.value}>
                            {r.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">
                  {mode === "change" ? "Current password" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    className="pl-9"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {mode === "change" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 4 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                {mode === "signin"
                  ? "Sign in"
                  : mode === "change"
                    ? "Update password"
                    : "Create account"}
              </Button>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-sm">
              {mode === "signin" ? (
                <>
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => setMode("change")}
                  >
                    Change password
                  </button>
                  <button
                    type="button"
                    className="text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => setMode("register")}
                  >
                    New clinician? Create account
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setMode("signin")}
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Access is restricted to authorised clinical staff.
          </p>
        </div>
      </main>
    </div>
  );
}
