/** Lightweight renderer for the model's markdown summary (headings, bullets, bold). */
export function SummaryText({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.split("\n");
  return (
    <div className={`space-y-1 text-xs leading-relaxed ${className}`}>
      {lines.map((raw, index) => {
        const line = raw.trim();
        if (!line) return <div key={index} className="h-1" />;
        const heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
          return (
            <p key={index} className="pt-1 font-display text-xs font-extrabold text-primary">
              {inline(heading[1] ?? "")}
            </p>
          );
        }
        const bullet = line.match(/^[-*]\s+(.*)$/);
        if (bullet) {
          return (
            <p key={index} className="flex gap-1.5 text-foreground">
              <span className="text-primary">•</span>
              <span>{inline(bullet[1] ?? "")}</span>
            </p>
          );
        }
        return (
          <p key={index} className="text-foreground">
            {inline(line)}
          </p>
        );
      })}
    </div>
  );
}

function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-bold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}
