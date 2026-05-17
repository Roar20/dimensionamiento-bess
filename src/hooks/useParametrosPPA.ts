import { useCallback, useEffect, useMemo, useState } from "react";

import type { DatosSFV } from "@/types/sfv";
import type { ParametrosPPA } from "@/types/bess";
import {
  VENTANA_HORA_PUNTA_CFE_DEFAULT,
  calcularPromedioMensualSFV,
} from "@/lib/core/bess";

const STORAGE_KEY = "dimensionamiento-bess:parametros-ppa";

function leerPersistido(): ParametrosPPA | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ParametrosPPA;
    if (
      typeof parsed.compromiso_mensual_mwh !== "number" ||
      typeof parsed.capacidad_poi_kw !== "number" ||
      !Array.isArray(parsed.ventana_punta_cfe) ||
      parsed.ventana_punta_cfe.length !== 2
    ) {
      return null;
    }
    const [ini, fin] = parsed.ventana_punta_cfe;
    // Sanidad: 1 ≤ ini < fin ≤ 24. Si está corrupto, reinicia ventana al
    // default. Defiende contra estados persistidos previos a este fix.
    if (
      typeof ini !== "number" ||
      typeof fin !== "number" ||
      ini < 1 ||
      fin > 24 ||
      ini >= fin
    ) {
      return {
        ...parsed,
        ventana_punta_cfe: VENTANA_HORA_PUNTA_CFE_DEFAULT,
      };
    }
    return parsed;
  } catch {
    return null;
  }
}

function escribirPersistido(p: ParametrosPPA) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function limpiarParametrosPPAPersistidos() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useParametrosPPA(datos: DatosSFV | null) {
  const promedioMensualSFV = useMemo(
    () => (datos ? calcularPromedioMensualSFV(datos.registros) : 0),
    [datos]
  );

  const defaults = useMemo<ParametrosPPA | null>(() => {
    if (!datos) return null;
    return {
      compromiso_mensual_mwh: Number(promedioMensualSFV.toFixed(1)),
      ventana_punta_cfe: VENTANA_HORA_PUNTA_CFE_DEFAULT,
      capacidad_poi_kw: datos.config.capacidad_poi_kw,
    };
  }, [datos, promedioMensualSFV]);

  const [params, setParams] = useState<ParametrosPPA | null>(null);

  useEffect(() => {
    if (!datos || !defaults) {
      setParams(null);
      return;
    }
    const persistido = leerPersistido();
    setParams(persistido ?? defaults);
  }, [datos, defaults]);

  const actualizar = useCallback((parcial: Partial<ParametrosPPA>) => {
    setParams((prev) => {
      if (!prev) return prev;
      const nuevo: ParametrosPPA = { ...prev, ...parcial };
      escribirPersistido(nuevo);
      return nuevo;
    });
  }, []);

  const resetearADefaults = useCallback(() => {
    if (!defaults) return;
    setParams(defaults);
    escribirPersistido(defaults);
  }, [defaults]);

  return {
    params,
    actualizar,
    resetearADefaults,
    promedioMensualSFV,
  };
}
