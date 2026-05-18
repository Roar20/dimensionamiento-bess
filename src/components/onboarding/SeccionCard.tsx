import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

interface Props {
  numero: string;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}

export function SeccionCard({ numero, titulo, descripcion, children }: Props) {
  return (
    <Card>
      <CardContent className="space-y-5 p-6 pt-6">
        <header className="flex items-baseline gap-3">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-helper tabular-nums">
            {numero.padStart(2, "0")}
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-medium text-ink-primary">{titulo}</h2>
            {descripcion ? (
              <p className="text-xs text-ink-helper">{descripcion}</p>
            ) : null}
          </div>
        </header>
        <div>{children}</div>
      </CardContent>
    </Card>
  );
}
