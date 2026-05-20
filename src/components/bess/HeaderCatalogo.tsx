import type { ReactNode } from "react";

interface Props {
  titulo: string;
  chips: { icono: string; texto: string }[];
  /**
   * Slot final renderizado al final de la fila de chips. Pensado para
   * controles interactivos (p.ej. `<TipoCambioInput>`) que reemplazan
   * algún chip estático del header.
   */
  slotFinal?: ReactNode;
}

/**
 * @deprecated Reemplazado por `<ProjectContextHeader>` en PR #29.
 * Mantener este archivo como referencia histórica; eliminar en un futuro
 * PR de limpieza una vez que ningún consumidor lo importe.
 */
export function HeaderCatalogo({ titulo, chips, slotFinal }: Props) {
  return (
    <header className="mb-8">
      <h1 className="mb-1.5 text-2xl font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
        {titulo}
      </h1>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
        {chips.map((chip, idx) => (
          <span key={idx} className="inline-flex items-center gap-1.5">
            <i
              className={`ti ${chip.icono} text-[var(--color-text-tertiary)]`}
              aria-hidden="true"
            />
            {chip.texto}
          </span>
        ))}
        {slotFinal}
      </div>
    </header>
  );
}
