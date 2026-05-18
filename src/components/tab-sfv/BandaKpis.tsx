import { KpiCard } from "@/components/ui/KpiCard";

interface Props {
  generacionAnualMwh: number;
  factorCapacidadPct: number;
  poiKw: number;
  horasConGeneracion: number;
  horasCalendarioTotales: number;
  potenciaPromedioKw: number;
  pctDelPoi: number;
  diasOperativos: number;
}

const FORMATO_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function BandaKpis({
  generacionAnualMwh,
  factorCapacidadPct,
  poiKw,
  horasConGeneracion,
  horasCalendarioTotales,
  potenciaPromedioKw,
  pctDelPoi,
  diasOperativos,
}: Props) {
  const pctCalendario =
    horasCalendarioTotales > 0
      ? (horasConGeneracion / horasCalendarioTotales) * 100
      : 0;

  return (
    <>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Indicadores del recurso
      </p>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          variant="primary"
          label="Generación anual"
          value={FORMATO_1DEC.format(generacionAnualMwh)}
          unit="MWh"
          sub={`${FORMATO_ENTERO.format(diasOperativos)} días operativos`}
          tooltip="Energía total entregada al POI durante el periodo. Suma de cincominutales reales × Δt."
        />
        <KpiCard
          variant="primary"
          label="Factor de capacidad"
          value={FORMATO_1DEC.format(factorCapacidadPct)}
          unit="%"
          sub={`sobre POI ${FORMATO_ENTERO.format(poiKw)} kW`}
          tooltip="Generación anual ÷ (POI × 8,760 h). Convención utility scale (DOE / IRENA) para medir aprovechamiento del punto de interconexión."
        />
        <KpiCard
          label="Horas con generación"
          value={FORMATO_ENTERO.format(horasConGeneracion)}
          unit="h/año"
          sub={`${FORMATO_1DEC.format(pctCalendario)}% del calendario`}
          tooltip="Total de horas del año con generación instantánea ≥ 50 kW. Define la ventana operativa diurna."
        />
        <KpiCard
          label="Potencia promedio"
          value={FORMATO_ENTERO.format(potenciaPromedioKw)}
          unit="kW"
          sub={`${FORMATO_1DEC.format(pctDelPoi)}% del POI`}
          tooltip="Potencia promedio durante horas con generación ≥ 50 kW. Indica el régimen típico de operación."
        />
      </div>
    </>
  );
}
