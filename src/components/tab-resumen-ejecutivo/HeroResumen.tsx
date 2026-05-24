interface Props {
  nombrePlanta: string;
}

/**
 * Apertura del tab Resumen Ejecutivo. Sin encabezado de sección por
 * diseño: es la afirmación grande que abre la narrativa. El texto se
 * personaliza por planta en cuanto se conecten los veredictos
 * sintéticos por planta (D-PROYECTO-08); por ahora es un placeholder
 * estable que comunica el propósito del tab.
 */
export function HeroResumen({ nombrePlanta }: Props) {
  return (
    <section className="mb-10">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Resumen para junta
      </p>
      <h2 className="text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-[var(--color-text-primary)]">
        Lectura ejecutiva del caso{" "}
        <span className="text-[var(--color-primary-dark)]">{nombrePlanta}</span>{" "}
        — del dato al criterio.
      </h2>
      <p className="mt-3 max-w-[680px] text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
        Este tab compila lo que un tomador de decisión necesita ver en una
        sola pasada: qué está pasando hoy, qué cambia con almacenamiento,
        qué se recomienda y bajo qué supuestos. La afirmación de apertura
        por planta se incorpora en próximas iteraciones.
      </p>
    </section>
  );
}
