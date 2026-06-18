type YearHeaderProps = { year: number };

export function YearHeader({ year }: YearHeaderProps) {
  const label = year === 0 ? "Date unknown" : String(year);
  const headingId = year === 0 ? "year-unknown-heading" : `year-${year}-heading`;
  return (
    <h2
      id={headingId}
      className="sticky top-0 z-10 flex scroll-mt-28 items-center gap-4 py-4 text-3xl font-black tabular-nums tracking-[0.02em] text-[#f6f4ef] backdrop-blur-[2px] sm:scroll-mt-32 sm:text-4xl md:scroll-mt-40 md:text-5xl"
      style={{
        background: "linear-gradient(180deg, #0c0c0e 70%, rgba(12,12,14,0))",
      }}
    >
      <span>{label}</span>
      <span
        className="h-0.5 flex-1 rounded-full"
        style={{ background: "var(--gold)", opacity: 0.5 }}
        aria-hidden
      />
    </h2>
  );
}
