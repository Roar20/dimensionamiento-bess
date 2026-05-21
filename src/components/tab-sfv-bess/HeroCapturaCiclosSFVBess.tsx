import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  /** Nombre del equipo principal a interpretar (hoy hardcoded a "Cube Plus" en TabSFVBess). */
  configNombre: string;
  /** Fracción de excedentes capturados en `[0, 1]`. Viene de `activa.kpis.fraccion_capturada`. */
  fraccionCapturada: number;
  /** Ciclos anuales redondeados. Viene de `Math.round(activa.kpis.ciclos_periodo)`. */
  ciclosAnuales: number;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

/**
 * Hero ejecutivo del Tab SFV+BESS (D-SFV-06, versión interina).
 *
 * Síntesis del motor para la configuración principal actual: el BESS
 * captura prácticamente toda la energía disponible manteniendo alta
 * utilización anual. La conclusión es DESCRIPTIVA, no comparativa —
 * cuando el motor incorpore barrido de configuraciones, este hero
 * evoluciona a la forma trade-off ("punto de equilibrio entre
 * alternativas"). Hoy se limita a lo que el motor sabe afirmar
 * honestamente.
 *
 * Reglas no negociables (verificadas por tests):
 *  - NO menciona "configuración recomendada", "la mejor", "trade-off",
 *    "punto de equilibrio", "extender la duración", "alternativa".
 *  - El titular NO lleva el valor porcentual absoluto; el dato vive en
 *    las micro-métricas.
 *  - Las cifras se reciben por props, cero hardcoding.
 */
export function HeroCapturaCiclosSFVBess({
  configNombre,
  fraccionCapturada,
  ciclosAnuales,
}: Props) {
  const COPY = COPY_SFV_BESS.heroCapturaCiclos;
  const pctAprovechamiento = Math.round(fraccionCapturada * 100);
  const ciclosStr = FORMATO_ENTERO.format(ciclosAnuales);

  return (
    <section className="mb-8">
      <div className="rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white px-5 py-4">
        <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
          <i
            className="ti ti-target-arrow text-[14px] leading-none"
            aria-hidden="true"
          />
          <span>{COPY.label}</span>
        </div>
        <h2 className="text-[15px] font-medium leading-snug text-[var(--color-text-primary)]">
          {COPY.titular(configNombre)}
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t-[0.5px] border-[var(--color-border-light)] pt-3 md:grid-cols-2">
          <MicroMetrica
            label={COPY.microAprovechamiento.label}
            valor={COPY.microAprovechamiento.valor(pctAprovechamiento)}
          />
          <MicroMetrica
            label={COPY.microUtilizacion.label}
            valor={COPY.microUtilizacion.valor(ciclosStr)}
          />
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
          {COPY.apoyo}
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
