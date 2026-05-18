interface Props {
  fuente: string;
  version?: string;
  fecha?: string;
}

export function FooterEstandar({
  fuente,
  version = "dimensionamiento-bess v0.1",
  fecha,
}: Props) {
  const derecha = fecha ? `${version} · ${fecha}` : version;
  return (
    <footer className="flex justify-between border-t border-[var(--color-border-light)] pt-4 text-[11px] text-[var(--color-text-tertiary)]">
      <span>{fuente}</span>
      <span>{derecha}</span>
    </footer>
  );
}
