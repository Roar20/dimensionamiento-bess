import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import type { CategoriaEnergia } from "@/types/bess";

interface Props {
  /** Nombre del equipo principal (hoy "Cube Plus" hardcoded en TabSFVBess). */
  configNombre: string;
  /** Fracción de la energía elegible de la categoría capturada, en `[0, 1]`. */
  fraccionCapturada: number;
  /** Ciclos anuales redondeados. */
  ciclosAnuales: number;
  /** Categoría activa de energía candidata; define qué se está capturando. */
  categoria: CategoriaEnergia;
}

type Umbral = "alta" | "media" | "baja" | "nula";

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

/**
 * Hero ejecutivo del Tab SFV+BESS (D-SFV-06, versión interina con
 * titular y apoyo condicionales).
 *
 * `fraccion_capturada` se calcula sobre la energía elegible de la
 * categoría activa, no sobre la generación total — la misma config da
 * fracciones radicalmente distintas entre categorías. El hero responde
 * con copy condicional según el `pct` real, SIEMPRE nombrando la
 * categoría. Cuando la fracción es baja y los ciclos son altos, el
 * apoyo diagnostica el sizing: el BESS es el factor limitante.
 *
 * Reglas no negociables (verificadas por tests):
 *  - Titular y apoyo son funciones del umbral; no hay copy estático.
 *  - El titular SIEMPRE nombra la categoría (`{natural}`).
 *  - "factor limitante" SOLO aparece en apoyo baja.
 *  - "prácticamente toda" SOLO aparece en alta.
 *  - Cero menciones de "recomendada", "equilibrio", "trade-off",
 *    "extender la duración", "alternativa".
 */
export function HeroCapturaCiclosSFVBess({
  configNombre,
  fraccionCapturada,
  ciclosAnuales,
  categoria,
}: Props) {
  const COPY = COPY_SFV_BESS.heroCapturaCiclos;
  const pct = Math.round(fraccionCapturada * 100);
  const umbral: Umbral =
    pct >= 80 ? "alta" : pct >= 30 ? "media" : pct > 0 ? "baja" : "nula";
  const natural = COPY.nombreCategoriaNatural[categoria.tipo];
  const ciclosStr = FORMATO_ENTERO.format(ciclosAnuales);

  return (
    <section className="mb-8">
      <div className="rounded-lg border-[0.5px] border-[var(--color-border-medium)] bg-white px-5 py-4">
        <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
          <i
            className="ti ti-target-arrow text-[14px] leading-none"
            aria-hidden="true"
          />
          <span>{COPY.label}</span>
        </div>
        <h2 className="text-[15px] font-medium leading-snug text-[var(--color-text-primary)]">
          {COPY.titular[umbral](configNombre, natural)}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t-[0.5px] border-[var(--color-border-light)] pt-3 md:grid-cols-2">
          <MicroMetrica
            label={COPY.microAprovechamiento.label}
            valor={COPY.microAprovechamiento.valor(pct)}
          />
          <MicroMetrica
            label={COPY.microUtilizacion.label}
            valor={COPY.microUtilizacion.valor(ciclosStr)}
          />
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {COPY.apoyo[umbral]}
        </p>
      </div>
    </section>
  );
}

function MicroMetrica({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--color-text-tertiary)]">{label}</p>
      <p className="mt-0.5 text-[14px] font-medium text-[var(--color-text-secondary)] tabular-nums">
        {valor}
      </p>
    </div>
  );
}
