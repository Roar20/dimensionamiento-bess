import { useCallback, useEffect, useState } from "react";

import type { EquipoBess } from "@/data/catalogo-hyperstrong";

const STORAGE_KEY = "dimensionamiento-bess:parametros-financieros";

/**
 * Parámetros del Tab Análisis Financiero. Capa local con overrides del Tab;
 * NO toca `usePreciosProxy` ni `PRECIOS_DEFAULT` (decisión confirmada por
 * el consultor para mantener aislamiento del Tab Financiero).
 *
 * Precios default reflejan validación marzo 2026 Estanzuela 2 (proxy para
 * Tequila pendiente confirmar con MHG).
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

function esValido(p: Partial<ParametrosFinancieros>): p is ParametrosFinancieros {
  return (
    typeof p.equipo_id === "string" &&
    typeof p.numero_unidades === "number" &&
    p.numero_unidades > 0 &&
    (p.capex_override_mxn === null || typeof p.capex_override_mxn === "number") &&
    typeof p.opex_tasa_anual === "number" &&
    typeof p.wacc_pct === "number" &&
    typeof p.factor_produccion === "number" &&
    p.factor_produccion >= 1 &&
    p.factor_produccion <= 2 &&
    typeof p.precio_energia_mxn_mwh === "number" &&
    typeof p.precio_cel_mxn === "number" &&
    typeof p.precio_potencia_firme_mxn_mw_mes === "number" &&
    typeof p.lmp_mxn_mwh === "number" &&
    typeof p.diferencial_lmp_pct === "number" &&
    typeof p.factor_credibilidad_pfirme === "number" &&
    p.factor_credibilidad_pfirme >= 0 &&
    p.factor_credibilidad_pfirme <= 1
  );
}

function leerPersistido(): ParametrosFinancieros | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ParametrosFinancieros>;
    if (!esValido(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function escribirPersistido(p: ParametrosFinancieros) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function limpiarParametrosFinancierosPersistidos() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useParametrosFinancieros() {
  const [params, setParams] = useState<ParametrosFinancieros>(
    () => leerPersistido() ?? PARAMETROS_FINANCIEROS_DEFAULT
  );

  useEffect(() => {
    escribirPersistido(params);
  }, [params]);

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
