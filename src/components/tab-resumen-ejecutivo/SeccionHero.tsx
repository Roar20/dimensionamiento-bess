import type { CopyPlantaCurada } from "@/lib/copy/resumen-ejecutivo";
import { COPY_RESUMEN_EJECUTIVO } from "@/lib/copy/resumen-ejecutivo";

interface Props {
  /** Copy curado de la planta activa, o `null` si la planta no está curada. */
  curado: CopyPlantaCurada | null;
  /** Nombre humano para usar en el fallback. */
  nombrePlanta: string;
}

/**
 * Hero del tab Resumen Ejecutivo. Sin encabezado de sección por diseño:
 * es la afirmación grande que abre la narrativa. Lee del mapa de copy
 * curado. Si la planta no está curada, degrada a estado "vacío honesto"
 * (no renderiza copy de otra planta ni inventa).
 */
export function SeccionHero({ curado, nombrePlanta }: Props) {
  if (curado) {
    return (
      <section className="mb-10">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
          {curado.hero.kicker}
        </p>
        <h2 className="text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-[var(--color-text-primary)]">
          {curado.hero.titulo}
        </h2>
        {curado.hero.apoyo ? (
          <p className="mt-3 max-w-[680px] text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
            {curado.hero.apoyo}
          </p>
        ) : null}
        {curado.supuestoBase ? (
          <p className="mt-4 inline-flex max-w-[680px] items-baseline gap-2 rounded-md border-[0.5px] border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-3 py-2 text-[12px] leading-[1.5] text-[var(--color-text-secondary)]">
            <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
              Supuesto base
            </span>
            <span aria-hidden className="text-[var(--color-text-tertiary)]">·</span>
            <span>{curado.supuestoBase}</span>
          </p>
        ) : null}
      </section>
    );
  }
  const fallback = COPY_RESUMEN_EJECUTIVO.fallbackPlantaNoCurada;
  return (
    <section className="mb-10">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {fallback.kicker}
      </p>
      <h2 className="text-[22px] font-medium leading-[1.3] tracking-[-0.01em] text-[var(--color-text-primary)]">
        {fallback.titulo}{" "}
        <span className="text-[var(--color-text-secondary)]">
          ({nombrePlanta})
        </span>
      </h2>
      <p className="mt-3 max-w-[680px] text-[14px] leading-[1.55] text-[var(--color-text-secondary)]">
        {fallback.cuerpo}
      </p>
    </section>
  );
}
