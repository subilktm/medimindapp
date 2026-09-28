import { Bell } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type WorkspaceAccountProps = {
  name: string;
  username: string;
  avatarSrc: string;
};

function getNameParts(name: string, username: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const fallback = username.trim() || "Staff Member";

  if (parts.length === 0) return { firstName: fallback, lastName: "" };
  const firstName = parts[0] ?? fallback;
  if (parts.length === 1) return { firstName, lastName: "" };

  return {
    firstName,
    lastName: parts.slice(1).join(" "),
  };
}

export function WorkspaceAccount({ name, username, avatarSrc }: WorkspaceAccountProps) {
  const { firstName, lastName } = getNameParts(name, username);
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative shrink-0 text-muted-foreground"
        aria-label="Notifications, 1 unread"
        title="Notifications"
        onClick={() => toast("No new clinical alerts", { description: "You have one unread system update." })}
      >
        <Bell className="size-4" />
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive ring-2 ring-card" />
      </Button>

      <Avatar className="size-10 border border-border">
        <AvatarImage
          src={avatarSrc}
          alt={`${firstName} ${lastName}`.trim()}
          loading="lazy"
          width={512}
          height={512}
        />
        <AvatarFallback className="text-xs font-semibold text-primary">{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-foreground">{firstName}</p>
        {lastName ? <p className="truncate text-sm text-muted-foreground">{lastName}</p> : null}
      </div>
    </div>
  );
}