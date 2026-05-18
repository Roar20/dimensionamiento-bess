import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { useDatosSFV } from "@/hooks/useDatosSFV";
import { useCambiarPlanta } from "@/hooks/useCambiarPlanta";
import { EncabezadoContextual } from "@/components/shell/EncabezadoContextual";

const RUTAS_CON_ENCABEZADO_CONTEXTUAL = new Set(["/bess"]);

/**
 * Shell mínimo: provee fondo de página y el banner contextual de planta
 * cuando hay datos y la ruta lo requiere. La tab nav ya no vive aquí —
 * cada página la renderiza inline con `<TabNav>` siguiendo los mockups
 * P0. Las rutas con `HeaderDossier` propio (`/sfv`, `/sfv-bess`)
 * NO renderizan EncabezadoContextual para evitar duplicación.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { datos } = useDatosSFV();
  const handleCambiar = useCambiarPlanta();
  const { pathname } = useLocation();
  const mostrarEncabezado =
    !!datos && RUTAS_CON_ENCABEZADO_CONTEXTUAL.has(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      {mostrarEncabezado ? (
        <EncabezadoContextual datos={datos} onCambiar={handleCambiar} />
      ) : null}
      <main className="flex-1">{children}</main>
    </div>
  );
}
