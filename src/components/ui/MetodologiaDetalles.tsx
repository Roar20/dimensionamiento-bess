import type { ReactNode } from "react";

interface Props {
  titulo?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/**
 * Bloque colapsable de metodología/supuestos. Siempre visible (no depende
 * de modo cliente/técnico). Triangle indicator a la izquierda, mismo CSS
 * de los mockups.
 */
export function MetodologiaDetalles({
  titulo = "Metodología y supuestos",
  children,
  defaultOpen = false,
}: Props) {
  return (
    <details
      open={defaultOpen}
      className="mb-4 border-t border-[var(--color-border-light)] pt-1 text-[13px]"
    >
      <summary className="metodologia-summary flex cursor-pointer items-center gap-2 py-3 font-medium text-[var(--color-text-secondary)]">
        <span className="metodologia-indicator inline-block h-0 w-0 border-y-[5px] border-l-[7px] border-y-transparent border-l-[var(--color-text-tertiary)] transition-transform" />
        {titulo}
      </summary>
      <div className="px-4 py-1 pb-3 leading-[1.7] text-[var(--color-text-secondary)]">
        {children}
      </div>
      <style>{`
        details > summary::-webkit-details-marker { display: none; }
        details > summary { list-style: none; }
        details[open] > summary .metodologia-indicator { transform: rotate(90deg); }
      `}</style>
    </details>
  );
}
