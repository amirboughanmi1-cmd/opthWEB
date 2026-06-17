/** Compact page header banner — consistent title block across inner pages. */
export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="border-b border-outline-variant bg-surface-gray">
      <div className="container-max py-16 text-center">
        {eyebrow && (
          <p className="mb-3 font-mono text-label-caps uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[40px] font-bold leading-tight text-primary-container md:text-display-md">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-on-surface-variant">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
