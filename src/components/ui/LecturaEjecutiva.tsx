interface Props {
  texto: string;
  label?: string;
}

/**
 * Banda "Lectura ejecutiva" del sistema de diseño P1.
 * - Border-left 3px primary, fondo primary-light.
 * - Label en versalitas 10px peso 600 letter-spacing 0.6px.
 * - Texto principal 14px line-height 1.55.
 */
export function LecturaEjecutiva({
  texto,
  label = "Lectura ejecutiva",
}: Props) {
  return (
    <section
      role="note"
      className="mb-8 rounded-r-md border-l-[3px] border-l-[var(--color-primary)] bg-[var(--color-primary-light)] px-[18px] py-3.5"
    >
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.6px] text-[var(--color-primary-dark)]">
        {label}
      </p>
      <p className="text-sm leading-[1.55] text-[var(--color-text-primary)]">
        {texto}
      </p>
    </section>
  );
}
