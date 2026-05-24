import type { CopyPlantaCurada } from "@/lib/copy/resumen-ejecutivo";

interface Props {
  /** Copy curado de la planta activa, o `null` si no hay curaduría. */
  curado: CopyPlantaCurada | null;
}

const TITULO = "Recomendación preliminar";

/**
 * Sección "Recomendación preliminar". La palabra "preliminar" hace
 * trabajo epistemológico: aún no es la recomendación definitiva, vive
 * en cláusulas condicionales. Si la planta no está curada, degrada a
 * estado vacío honesto — no inventar recomendación.
 */
export function SeccionRecomendacionPreliminar({ curado }: Props) {
  return (
    <section className="mb-10">
      <h3 className="mb-3 text-[16px] font-medium text-[var(--color-text-primary)]">
        {TITULO}
      </h3>
      {curado ? (
        <article className="rounded-md border-[0.5px] border-l-[3px] border-l-[var(--color-primary)] border-[var(--color-border-light)] bg-white p-5">
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.5px] text-[var(--color-primary-dark)]">
            {curado.recomendacionPreliminar.kicker}
          </p>
          <h4 className="mb-3 text-[18px] font-medium leading-[1.3] text-[var(--color-text-primary)]">
            {curado.recomendacionPreliminar.titulo}
          </h4>
          <ul className="flex flex-col gap-1.5 text-[13px] leading-[1.55] text-[var(--color-text-primary)]">
            {curado.recomendacionPreliminar.bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="select-none text-[var(--color-text-tertiary)]">
                  •
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          {curado.recomendacionPreliminar.nota ? (
            <p className="mt-3 text-[12px] italic leading-[1.55] text-[var(--color-text-tertiary)]">
              {curado.recomendacionPreliminar.nota}
            </p>
          ) : null}
        </article>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-4">
          <p className="text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
            Recomendación ejecutiva en preparación. La recomendación es una
            afirmación con consecuencias y se publica solo cuando hay
            sustento curado para sostenerla.
          </p>
        </div>
      )}
    </section>
  );
}
