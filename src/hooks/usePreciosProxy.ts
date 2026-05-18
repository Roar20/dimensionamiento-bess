import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dimensionamiento-bess:precios-proxy";

/**
 * Precios proxy de mercado capturados en Tab SFV+BESS. Default = Estanzuela 2
 * (proxy mientras se confirma con Soluciones MHG el precio para Tequila).
 *
 * `potencia_firme_mxn_mw_mes` se persiste y se captura inline pero NO se usa
 * todavía en `economia-preliminar.ts`. Integración real en PR #20 (motor
 * potencia firme).
 */
export type PreciosProxy = {
  energia_mxn_mwh: number;
  potencia_firme_mxn_mw_mes: number;
  cel_mxn: number;
};

export const PRECIOS_DEFAULT: PreciosProxy = {
  energia_mxn_mwh: 1010.8,
  potencia_firme_mxn_mw_mes: 18000,
  cel_mxn: 285,
};

export type PrecioKey = keyof PreciosProxy;

function validarValor(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

function leerPersistido(): PreciosProxy | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PreciosProxy>;
    const fields: PrecioKey[] = [
      "energia_mxn_mwh",
      "potencia_firme_mxn_mw_mes",
      "cel_mxn",
    ];
    for (const k of fields) {
      const v = parsed[k];
      if (typeof v !== "number" || !validarValor(v)) return null;
    }
    return parsed as PreciosProxy;
  } catch {
    return null;
  }
}

function escribirPersistido(p: PreciosProxy) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function limpiarPreciosProxyPersistidos() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

type Result = {
  precios: PreciosProxy;
  /**
   * Setea un campo individual. Devuelve `true` si fue aceptado y persistido,
   * `false` si la validación falló y el valor previo se mantiene.
   */
  setPrecio: (key: PrecioKey, next: number) => boolean;
  /** Resetea a los defaults (Estanzuela 2). */
  reset: () => void;
  esProxy: boolean;
};

export function usePreciosProxy(): Result {
  const [precios, setPreciosState] = useState<PreciosProxy>(() => {
    return leerPersistido() ?? PRECIOS_DEFAULT;
  });

  useEffect(() => {
    escribirPersistido(precios);
  }, [precios]);

  const setPrecio = useCallback((key: PrecioKey, next: number): boolean => {
    if (!validarValor(next)) return false;
    setPreciosState((prev) => ({ ...prev, [key]: next }));
    return true;
  }, []);

  const reset = useCallback(() => {
    setPreciosState(PRECIOS_DEFAULT);
  }, []);

  const esProxy =
    precios.energia_mxn_mwh === PRECIOS_DEFAULT.energia_mxn_mwh &&
    precios.potencia_firme_mxn_mw_mes ===
      PRECIOS_DEFAULT.potencia_firme_mxn_mw_mes &&
    precios.cel_mxn === PRECIOS_DEFAULT.cel_mxn;

  return { precios, setPrecio, reset, esProxy };
}
