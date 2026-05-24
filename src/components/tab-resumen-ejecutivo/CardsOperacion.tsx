import type { KPIsSimulacion } from "@/types/bess";
import { COPY_RESUMEN_EJECUTIVO } from "@/lib/copy/resumen-ejecutivo";

interface Props {
  libre: KPIsSimulacion | null;
  restringida: KPIsSimulacion | null;
}

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

/**
 * Cards read-only "operación libre / restringida a punta" para el tab
 * Resumen Ejecutivo. Equivalente narrativo del `SeccionComparativaEstrategias`
 * del tab SFV+BESS, pero sin interactividad y con vocabulario ejecutivo.
 * Greedy → "operación libre"; Arbitraje → "operación restringida a punta".
 */
export function CardsOperacion({ libre, restringida }: Props) {
  const copy = COPY_RESUMEN_EJECUTIVO.cardsOperacion;
  if (!libre || !restringida) {
    return (
      <div className="rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          {copy.sinDatos}
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-3 text-[13px] leading-[1.55] text-[var(--color-text-secondary)]">
        {copy.contexto}
      </p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CardOperacion
          titulo={copy.libre.titulo}
          descripcion={copy.libre.descripcion}
          kpis={libre}
        />
        <CardOperacion
          titulo={copy.restringida.titulo}
          descripcion={copy.restringida.descripcion}
          kpis={restringida}
        />
      </div>
    </div>
  );
}

function CardOperacion({
  titulo,
  descripcion,
  kpis,
}: {
  titulo: string;
  descripcion: string;
  kpis: KPIsSimulacion;
}) {
  const labels = COPY_RESUMEN_EJECUTIVO.cardsOperacion.labels;
  return (
    <div className="flex flex-col items-stretch rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white p-5 text-left">
      <header className="mb-4">
        <h4 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {titulo}
        </h4>
        <p className="mt-0.5 text-[12px] leading-[1.5] text-[var(--color-text-secondary)]">
          {descripcion}
        </p>
      </header>
      <dl className="grid grid-cols-3 gap-3 text-[12px]">
        <MetricaMini
          label={labels.captura}
          valor={`${FORMATO_1DEC.format(kpis.descargado_total_mwh)} MWh`}
        />
        <MetricaMini
          label={labels.ciclos}
          valor={FORMATO_ENTERO.format(kpis.ciclos_periodo)}
        />
        <MetricaMini
          label={labels.fraccion}
          valor={`${FORMATO_1DEC.format(kpis.fraccion_capturada * 100)}%`}
        />
      </dl>
    </div>
  );
}

function MetricaMini({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="mb-0.5 text-[10px] uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        {label}
      </dt>
      <dd className="text-[15px] font-medium tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </dd>
    </div>
  );
}
