import { Check } from "lucide-react";

type AdminSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

export function AdminSection({ eyebrow, title, description, points }: AdminSectionProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl bg-clinical p-6 text-primary-foreground shadow-panel">
        <div className="relative z-10">
          <span className="rounded bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
            {eyebrow}
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">{description}</p>
        </div>
        <span className="pointer-events-none absolute -top-8 -right-8 size-48 rounded-full bg-primary-foreground/10 blur-3xl" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card/70 p-6">
        <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Planned for this section
        </p>
        <ul className="mt-4 space-y-3">
          {points.map((point) => (
            <li key={point} className="flex gap-3 text-sm text-foreground/80">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
