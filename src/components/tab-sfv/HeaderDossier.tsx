import { useCambiarPlanta } from "@/hooks/useCambiarPlanta";

/**
 * @deprecated Reemplazado por `<ProjectContextHeader>` en PR #29 (header
 * de proyecto unificado para los 4 tabs). Mantener este archivo como
 * referencia histórica del patrón; eliminar en un futuro PR de limpieza
 * una vez que ningún consumidor lo importe.
 */
interface Props {
  nombrePlanta: string | null;
  anio: number;
  totalRegistros: number;
  poiKw: number;
  zonaLmp: string | null;
  /**
   * Prefijo del título. Default: "Análisis de la curva de generación del
   * SFV". Tab SFV+BESS lo sobrescribe a "Análisis del SFV + BESS".
   */
  tituloBase?: string;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function HeaderDossier({
  nombrePlanta,
  anio,
  totalRegistros,
  poiKw,
  zonaLmp,
  tituloBase = "Análisis de la curva de generación del SFV",
}: Props) {
  const cambiarPlanta = useCambiarPlanta();
  const titulo = nombrePlanta ? `${tituloBase} — ${nombrePlanta}` : tituloBase;

  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="mb-1.5 text-2xl font-medium tracking-[-0.01em] text-[var(--color-text-primary)]">
          {titulo}
          {!nombrePlanta ? (
            <span className="ml-2 text-base text-[var(--color-text-tertiary)]">
              · Sin planta configurada
            </span>
          ) : null}
        </h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
          <Chip icono="ti-calendar" texto={`Año base ${anio}`} />
          <Chip
            icono="ti-database"
            texto={`${FORMATO_ENTERO.format(totalRegistros)} registros horarios`}
          />
          <Chip icono="ti-bolt" texto={`POI ${FORMATO_ENTERO.format(poiKw)} kW`} />
          {zonaLmp ? (
            <Chip icono="ti-map-pin" texto={`Zona LMP ${zonaLmp}`} />
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={cambiarPlanta}
        className="shrink-0 text-[12px] text-[var(--color-text-secondary)] underline-offset-4 transition-colors hover:text-[var(--color-text-primary)] hover:underline"
      >
        Cambiar planta
      </button>
    </header>
  );
}

function Chip({ icono, texto }: { icono: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i
        className={`ti ${icono} text-[var(--color-text-tertiary)]`}
        aria-hidden="true"
      />
      {texto}
    </span>
  );
}
