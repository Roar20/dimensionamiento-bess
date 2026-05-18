import type { KPIsSimulacion } from "@/types/bess";
import type { PreciosProxy } from "@/hooks/usePreciosProxy";

export type IngresoAnual = {
  energia_mxn: number;
  cels_mxn: number;
  total_mxn: number;
};

/**
 * Ingreso anual estimado del par equipo+estrategia, en MXN.
 *
 * Componentes:
 *  - Energía: `descargado_total_mwh × precio_energia_mxn_mwh`.
 *  - CELs: `descargado_total_mwh × precio_cel_mxn`.
 *
 * `precios.potencia_firme_mxn_mw_mes` se captura en `usePreciosProxy`
 * pero NO se consume aquí. Integración en PR #20 (motor potencia firme),
 * cuando exista `calcularPotenciaFirme()` capaz de calcular kW
 * acreditables anuales bajo régimen CNE 2026.
 */
export function calcularIngresoAnual(
  kpis: KPIsSimulacion,
  precios: PreciosProxy
): IngresoAnual {
  const descargado = Math.max(0, kpis.descargado_total_mwh);
  const energia = descargado * precios.energia_mxn_mwh;
  const cels = descargado * precios.cel_mxn;
  return {
    energia_mxn: energia,
    cels_mxn: cels,
    total_mxn: energia + cels,
  };
}

export type CapexEquipo = {
  /** USD del datasheet × tipo de cambio. */
  capex_mxn: number;
  /** Costo por kWh nominal × tipo de cambio. */
  capex_mxn_por_kwh: number;
};

/**
 * Convierte precios USD del datasheet a MXN según el tipo de cambio
 * configurado en `useTipoCambio` (global del app).
 */
export function calcularCapex(
  precio_usd_unidad: number,
  precio_usd_kwh: number,
  tipo_cambio: number
): CapexEquipo {
  return {
    capex_mxn: precio_usd_unidad * tipo_cambio,
    capex_mxn_por_kwh: precio_usd_kwh * tipo_cambio,
  };
}

export type PaybackPreliminar = {
  /** años, o null si `ingreso_anual <= 0`. */
  payback_anios: number | null;
};

/**
 * Payback simple = CAPEX / ingreso anual. Sin descuento, sin OPEX, sin
 * SOH. Por eso "preliminar". El cálculo financiero riguroso vive en Tab
 * Financiero (P5).
 */
export function calcularPaybackPreliminar(
  capex_mxn: number,
  ingreso_anual_mxn: number
): PaybackPreliminar {
  if (ingreso_anual_mxn <= 0) return { payback_anios: null };
  return { payback_anios: capex_mxn / ingreso_anual_mxn };
}
