import type { ReactNode } from "react";

/**
 * Shell mínimo: provee fondo de página. El header de contexto de proyecto
 * (título + metadata de planta + botón "Cambiar planta") vive en cada
 * tab vía `<ProjectContextHeader>`, fuente única de verdad (PR #29).
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-page)] text-[var(--color-text-primary)]">
      <main className="flex-1">{children}</main>
    </div>
  );
}
