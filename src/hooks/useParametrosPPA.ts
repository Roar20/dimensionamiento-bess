import { useCallback, useEffect, useMemo, useState } from "react";

import type { DatosSFV } from "@/types/sfv";
import type { ParametrosPPA } from "@/types/bess";
import {
  VENTANA_HORA_PUNTA_CFE_DEFAULT,
  calcularPromedioMensualSFV,
} from "@/lib/core/bess";

// Stateless: parámetros PPA viven solo en memoria React.
// Sin persistencia en localStorage.

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
    setParams(defaults);
  }, [datos, defaults]);

  const actualizar = useCallback((parcial: Partial<ParametrosPPA>) => {
    setParams((prev) => {
      if (!prev) return prev;
      return { ...prev, ...parcial };
    });
  }, []);

  const resetearADefaults = useCallback(() => {
    if (!defaults) return;
    setParams(defaults);
  }, [defaults]);

  return {
    params,
    actualizar,
    resetearADefaults,
    promedioMensualSFV,
  };
}
