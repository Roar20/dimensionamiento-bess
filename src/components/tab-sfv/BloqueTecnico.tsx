import { type ReactNode } from "react";

import { useViewMode } from "@/context/ViewModeContext";

interface Props {
  titulo: string;
  children: ReactNode;
}

export function BloqueTecnico({ titulo, children }: Props) {
  const { mode } = useViewMode();
  if (mode !== "tecnico") return null;

  return (
    <details className="mt-6 rounded-card border border-brand-cardBorder bg-slate-50">
      <summary className="cursor-pointer px-4 py-2 text-sm font-medium text-ink-secondary">
        {titulo}
      </summary>
      <div className="border-t border-brand-cardBorder px-4 py-3 text-sm text-ink-secondary">
        {children}
      </div>
    </details>
  );
}
