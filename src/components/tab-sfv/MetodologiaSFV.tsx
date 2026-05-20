import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

interface Props {
  totalRegistros: number;
  nombrePlanta: string | null;
  anio: number;
  poiKw: number;
}

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function MetodologiaSFV({
  totalRegistros,
  nombrePlanta,
  anio,
  poiKw,
}: Props) {
  const planta = nombrePlanta ?? "la planta";
  return (
    <MetodologiaDetalles>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Fuente de datos:
        </strong>{" "}
        {FORMATO_ENTERO.format(totalRegistros)} registros horarios del SFV{" "}
        {planta} correspondientes al año calendario {anio}, provistos por
        Soluciones MHG.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Horas con generación:
        </strong>{" "}
        Una hora se considera activa cuando la potencia promedio horaria
        supera 50 kW. Las horas con generación menor a este umbral sí
        contribuyen al total anual de energía, pero no al conteo de horas
        activas.
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Cálculo de excedente:
        </strong>{" "}
        energía generada por encima del techo de inyección al POI (
        {FORMATO_ENTERO.format(poiKw)} kW), agregada por hora como{" "}
        max(0, gen_h − POI_kWh).
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Factor de capacidad:
        </strong>{" "}
        generación anual entregada al POI ÷ (POI × 8,760 h). Convención utility
        scale (DOE / IRENA).
      </p>
      <p className="mb-2">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Alcance del análisis:
        </strong>{" "}
        caracterización del recurso existente bajo régimen CNE 2026 (CRE
        A/113/2024 abrogado el 7-mar-2025; ver{" "}
        <code className="text-[12px]">docs/REFERENCIAS_REGULATORIAS.md</code>).
        No incluye modificación de capacidad instalada ni escalado de
        generación.
      </p>
    </MetodologiaDetalles>
  );
}
