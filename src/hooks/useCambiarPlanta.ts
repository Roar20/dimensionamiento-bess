import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useDatosSFV } from "@/hooks/useDatosSFV";

/**
 * Fuente única de la lógica "Cambiar planta": resetea el estado en
 * memoria (sin persistencia que limpiar, modo stateless) y navega al
 * onboarding. Los demás hooks (configuracion-bess, parametros-ppa,
 * periodo-activo, parametros-financieros, precios-proxy) viven en
 * memoria atada a `datos` o se inicializan solos con defaults; al
 * resetear `datos`, cascadean a su estado inicial automáticamente.
 */
export function useCambiarPlanta() {
  const { limpiar } = useDatosSFV();
  const navigate = useNavigate();

  return useCallback(() => {
    limpiar();
    navigate("/");
  }, [limpiar, navigate]);
}
