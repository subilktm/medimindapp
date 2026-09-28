import { Link } from "@tanstack/react-router";
import { LogOut, Search, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceAccount } from "@/components/workspace-account";

export type ShellNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  exact: boolean;
};

type WorkspaceShellProps = {
  section: string;
  items: ShellNavItem[];
  name: string;
  username: string;
  avatarSrc: string;
  searchPlaceholder: string;
  onSignOut: () => void;
  children: ReactNode;
};

export function WorkspaceShell({
  section,
  items,
  name,
  username,
  avatarSrc,
  searchPlaceholder,
  onSignOut,
  children,
}: WorkspaceShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border glass-panel md:flex">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="size-3.5 rotate-45 rounded-xs bg-primary-foreground" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-primary">
              MediMind
            </span>
          </div>
          <p className="mt-2 text-xs tracking-wide text-muted-foreground">{section}</p>
        </div>

        <nav className="flex-1 space-y-1 px-4">
          {items.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground transition-all hover:bg-secondary/50 hover:text-primary"
              activeProps={{ className: "bg-secondary text-primary font-semibold" }}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-6">
          <Button
            variant="outline"
            className="w-full justify-center bg-card/60 font-semibold"
            onClick={onSignOut}
          >
            <LogOut className="mr-2 size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-border px-5 glass-strong md:px-8">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search"
              placeholder={searchPlaceholder}
              className="rounded-xl border-border bg-card/60 pl-10 text-sm"
            />
          </div>
          <WorkspaceAccount name={name} username={username} avatarSrc={avatarSrc} />
        </header>

        <div className="flex-1 space-y-8 px-5 py-8 md:px-8">{children}</div>
      </main>
    </div>
  );
}
