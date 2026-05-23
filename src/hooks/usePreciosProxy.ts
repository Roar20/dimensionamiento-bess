import { useCallback, useState } from "react";

/**
 * Precios proxy de mercado capturados en Tab SFV+BESS. Default = proxy
 * externo (pendiente de confirmar con Soluciones MHG el precio para la
 * planta cargada).
 *
 * Stateless: viven solo en memoria React. Sin persistencia.
 *
 * `potencia_firme_mxn_mw_mes` se captura inline pero NO se usa todavía en
 * `economia-preliminar.ts`. Integración real en PR del motor potencia firme.
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

type Result = {
  precios: PreciosProxy;
  /**
   * Setea un campo individual. Devuelve `true` si fue aceptado, `false`
   * si la validación falló y el valor previo se mantiene.
   */
  setPrecio: (key: PrecioKey, next: number) => boolean;
  /** Resetea a los defaults (proxy externo). */
  reset: () => void;
  esProxy: boolean;
};

export function usePreciosProxy(): Result {
  const [precios, setPreciosState] = useState<PreciosProxy>(PRECIOS_DEFAULT);

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
