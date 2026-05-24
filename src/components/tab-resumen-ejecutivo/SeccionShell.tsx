import type { ReactNode } from "react";

interface Props {
  titulo: string;
  pregunta?: boolean;
  children?: ReactNode;
}

/**
 * Encabezado estándar de sección del tab Resumen Ejecutivo. Si la
 * sección no tiene contenido propio todavía, muestra el "pendiente"
 * estable. Las secciones que ya tienen contenido lo inyectan vía
 * children.
 */
export function SeccionShell({ titulo, pregunta = false, children }: Props) {
  return (
    <section className="mb-10">
      <h3
        className={[
          "mb-3 text-[16px] font-medium text-[var(--color-text-primary)]",
          pregunta ? "tracking-[-0.005em]" : "",
        ].join(" ")}
      >
        {titulo}
      </h3>
      {children ?? <ContenidoPendiente />}
    </section>
  );
}

function ContenidoPendiente() {
  return (
    <div className="rounded-md border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-5">
      <p className="text-[12px] uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Sección pendiente
      </p>
      <p className="mt-1 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
        El contenido de esta sección se incorpora en próximas iteraciones del
        tab Resumen Ejecutivo, después del deck.
      </p>
    </div>
  );
}
