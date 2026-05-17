import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { useDatosSFV } from "@/hooks/useDatosSFV";
import { limpiarPeriodoActivoPersistido } from "@/hooks/usePeriodoActivo";
import { limpiarParametrosPPAPersistidos } from "@/hooks/useParametrosPPA";
import { limpiarConfiguracionBESSPersistida } from "@/hooks/useConfiguracionBESS";
import { AppHeader } from "@/components/shell/AppHeader";
import { EncabezadoContextual } from "@/components/shell/EncabezadoContextual";

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
    <div className="flex min-h-screen flex-col bg-brand-page text-ink-secondary">
      <AppHeader hayDatos={!!datos} />
      {datos ? (
        <EncabezadoContextual datos={datos} onCambiar={handleCambiar} />
      ) : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}
