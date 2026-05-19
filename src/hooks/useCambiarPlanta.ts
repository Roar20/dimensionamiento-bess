import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useDatosSFV } from "@/hooks/useDatosSFV";
import { limpiarPeriodoActivoPersistido } from "@/hooks/usePeriodoActivo";
import { limpiarParametrosPPAPersistidos } from "@/hooks/useParametrosPPA";
import { limpiarConfiguracionBESSPersistida } from "@/hooks/useConfiguracionBESS";
import { limpiarParametrosFinancierosPersistidos } from "@/hooks/useParametrosFinancieros";

/**
 * Fuente única de la lógica "Cambiar planta": limpia los datos
 * persistidos (SFV + periodo + PPA + BESS + financieros) y navega al
 * onboarding.
 */
export function useCambiarPlanta() {
  const { limpiar } = useDatosSFV();
  const navigate = useNavigate();

  return useCallback(() => {
    limpiar();
    limpiarPeriodoActivoPersistido();
    limpiarParametrosPPAPersistidos();
    limpiarConfiguracionBESSPersistida();
    limpiarParametrosFinancierosPersistidos();
    navigate("/");
  }, [limpiar, navigate]);
}
