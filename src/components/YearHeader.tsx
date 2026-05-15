type YearHeaderProps = { year: number };

export function YearHeader({ year }: YearHeaderProps) {
  const label = year === 0 ? "Date unknown" : String(year);
  const headingId = year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
  return (
    <h2
      id={headingId}
      className="scroll-mt-20 sticky top-0 z-10 border-b border-[color-mix(in_oklab,var(--foreground)_12%,transparent)] bg-[var(--background)]/95 py-6 text-3xl font-bold tabular-nums uppercase tracking-[0.12em] text-[color-mix(in_oklab,var(--foreground)_55%,transparent)] backdrop-blur-sm supports-[backdrop-filter]:bg-[var(--background)]/80 sm:text-4xl md:text-5xl md:tracking-[0.14em]"
    >
      {label}
    </h2>
  );
}
