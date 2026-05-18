import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dimensionamiento-bess:tipo-cambio";
const DEFAULT_TC = 20;

/** Estricto: 0 < value < 100, máximo 2 decimales, número finito. */
export function validarTipoCambio(value: number): boolean {
  if (!Number.isFinite(value)) return false;
  if (value <= 0 || value >= 100) return false;
  // Rechaza > 2 decimales (e.g. 19.555).
  const escalado = value * 100;
  return Math.abs(escalado - Math.round(escalado)) < 1e-9;
}

function leerPersistido(): number | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return validarTipoCambio(n) ? n : null;
  } catch {
    return null;
  }
}

function escribirPersistido(value: number) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

export function limpiarTipoCambioPersistido() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

type Result = {
  tipoCambio: number;
  /**
   * Intenta actualizar el TC. Devuelve `true` si fue aceptado y persistido,
   * `false` si la validación falló y el valor previo se mantiene.
   */
  setTipoCambio: (next: number) => boolean;
};

export function useTipoCambio(): Result {
  const [tipoCambio, setTipoCambioState] = useState<number>(() => {
    const persistido = leerPersistido();
    return persistido ?? DEFAULT_TC;
  });

  useEffect(() => {
    escribirPersistido(tipoCambio);
  }, [tipoCambio]);

  const setTipoCambio = useCallback((next: number): boolean => {
    if (!validarTipoCambio(next)) return false;
    setTipoCambioState(next);
    return true;
  }, []);

  return { tipoCambio, setTipoCambio };
}
