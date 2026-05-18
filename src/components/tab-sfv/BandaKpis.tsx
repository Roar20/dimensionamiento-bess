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
  anio: number;
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
  anio,
}: Props) {
  const pctCalendario =
    horasCalendarioTotales > 0
      ? (horasConGeneracion / horasCalendarioTotales) * 100
      : 0;

  const genStr = FORMATO_1DEC.format(generacionAnualMwh);
  const poiStr = FORMATO_ENTERO.format(poiKw);
  const horasCalStr = FORMATO_ENTERO.format(horasCalendarioTotales);

  return (
    <>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Indicadores del recurso
      </p>
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          variant="primary"
          label="Generación anual"
          value={genStr}
          unit="MWh"
          sub={`${FORMATO_ENTERO.format(diasOperativos)} días operativos`}
          tooltip={`Energía entregada al POI durante el año calendario ${anio}. Suma de ${horasCalStr} registros horarios validados contra Excel de Soluciones MHG.`}
        />
        <KpiCard
          variant="primary"
          label="Factor de capacidad"
          value={FORMATO_1DEC.format(factorCapacidadPct)}
          unit="%"
          sub={`sobre POI ${poiStr} kW`}
          tooltip={`Energía anual ÷ (potencia POI × 8,760 h). ${genStr} MWh ÷ (${poiStr} kW × 8,760 h). Convención utility scale DOE/IRENA.`}
        />
        <KpiCard
          label="Horas con generación"
          value={FORMATO_ENTERO.format(horasConGeneracion)}
          unit="h/año"
          sub={`${FORMATO_1DEC.format(pctCalendario)}% del calendario`}
          tooltip="Horas del año donde la generación instantánea es ≥ 50 kW (10% del POI). Excluye amaneceres y atardeceres con generación marginal."
        />
        <KpiCard
          label="Potencia promedio"
          value={FORMATO_ENTERO.format(potenciaPromedioKw)}
          unit="kW"
          sub={`${FORMATO_1DEC.format(pctDelPoi)}% del POI`}
          tooltip="Promedio de generación durante horas activas (≥ 50 kW), no promedio anual. Mide la intensidad cuando el SFV está produciendo."
        />
      </div>
    </>
  );
}
