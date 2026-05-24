import type { CopyPlantaCurada } from "@/lib/copy/resumen-ejecutivo";

interface Props {
  /** Copy curado de la planta activa, o `null` si no hay curaduría. */
  curado: CopyPlantaCurada | null;
}

const TITULO = "¿Qué está pasando hoy?";

/**
 * Sección "¿Qué está pasando hoy?" — estado observable de la planta.
 * Solo renderiza copy curado; sin curaduría muestra una nota de
 * pendiente honesta para no inventar diagnóstico.
 */
export function SeccionQuePasaHoy({ curado }: Props) {
  return (
    <section className="mb-10">
      <h3 className="mb-3 text-[16px] font-medium text-[var(--color-text-primary)]">
        {TITULO}
      </h3>
      {curado ? (
        <div className="flex flex-col gap-2">
          {curado.quePasaHoy.parrafos.map((p, i) => (
            <p
              key={i}
              className="max-w-[680px] text-[14px] leading-[1.6] text-[var(--color-text-primary)]"
            >
              {p}
            </p>
          ))}
        </div>
      ) : (
        <PendientePorCuradoria />
      )}
    </section>
  );
}

function PendientePorCuradoria() {
  return (
    <div className="rounded-md border border-dashed border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-4">
      <p className="text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
        Diagnóstico observable pendiente de curaduría para esta planta. Las
        cifras del estado de la planta están disponibles en los tabs SFV y
        SFV+BESS.
      </p>
    </div>
  );
}
