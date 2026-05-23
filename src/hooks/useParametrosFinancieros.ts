import { useCallback, useState } from "react";

import type { EquipoBess } from "@/data/catalogo-hyperstrong";

/**
 * Parámetros del Tab Análisis Financiero. Stateless: viven solo en
 * memoria React. Sin persistencia. Cualquier remount restablece los
 * defaults (proxy externo, pendientes de validación con MHG).
 */
export type ParametrosFinancieros = {
  equipo_id: EquipoBess["id"];
  numero_unidades: number;
  /** Override CAPEX en MXN. null → derivar del catálogo × tipo de cambio. */
  capex_override_mxn: number | null;
  opex_tasa_anual: number;
  wacc_pct: number;
  /** Factor multiplicativo sobre el perfil horario. [1.0, 2.0]. */
  factor_produccion: number;
  precio_energia_mxn_mwh: number;
  precio_cel_mxn: number;
  precio_potencia_firme_mxn_mw_mes: number;
  lmp_mxn_mwh: number;
  diferencial_lmp_pct: number;
  /**
   * Factor de credibilidad sobre la mediana de descargas en hora-punta para
   * el proxy de potencia firme. Default 0.40 (conservador, pendiente Lalo).
   * Rango razonable 0.20–1.00.
   */
  factor_credibilidad_pfirme: number;
};

export const PARAMETROS_FINANCIEROS_DEFAULT: ParametrosFinancieros = {
  equipo_id: "cube-plus",
  numero_unidades: 2,
  capex_override_mxn: null,
  opex_tasa_anual: 0.02,
  wacc_pct: 0.10,
  factor_produccion: 1.0,
  precio_energia_mxn_mwh: 1010.80,
  precio_cel_mxn: 190,
  precio_potencia_firme_mxn_mw_mes: 333_334,
  lmp_mxn_mwh: 360,
  diferencial_lmp_pct: 0.30,
  factor_credibilidad_pfirme: 0.40,
};

export function useParametrosFinancieros() {
  const [params, setParams] = useState<ParametrosFinancieros>(
    PARAMETROS_FINANCIEROS_DEFAULT
  );

  const actualizar = useCallback(
    (parcial: Partial<ParametrosFinancieros>) => {
      setParams((prev) => ({ ...prev, ...parcial }));
    },
    []
  );

  const resetear = useCallback(() => {
    setParams(PARAMETROS_FINANCIEROS_DEFAULT);
  }, []);

  return { params, actualizar, resetear };
}
