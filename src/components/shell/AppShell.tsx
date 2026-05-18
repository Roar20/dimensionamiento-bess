import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useDatosSFV } from "@/hooks/useDatosSFV";
import { limpiarPeriodoActivoPersistido } from "@/hooks/usePeriodoActivo";
import { limpiarParametrosPPAPersistidos } from "@/hooks/useParametrosPPA";
import { limpiarConfiguracionBESSPersistida } from "@/hooks/useConfiguracionBESS";
import { EncabezadoContextual } from "@/components/shell/EncabezadoContextual";

/**
 * Shell mínimo: provee fondo de página y el banner contextual de planta
 * cuando hay datos. La tab nav ya no vive aquí — cada página la renderiza
 * inline con `<TabNav>` siguiendo los mockups P0.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { datos, limpiar } = useDatosSFV();
  const navigate = useNavigate();

  const handleCambiar = () => {
    limpiar();
    limpiarPeriodoActivoPersistido();
    limpiarParametrosPPAPersistidos();
    limpiarConfiguracionBESSPersistida();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {datos ? (
        <EncabezadoContextual datos={datos} onCambiar={handleCambiar} />
      ) : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}
