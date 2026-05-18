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
        <header className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-header text-sm font-medium text-brand-headerFg tabular-nums">
            {numero}
          </span>
          <div className="space-y-1">
            <h2 className="text-base font-medium text-ink-primary">
              {titulo}
            </h2>
            {descripcion ? (
              <p className="text-sm text-ink-helper">{descripcion}</p>
            ) : null}
          </div>
        </header>
        <div>{children}</div>
      </CardContent>
    </Card>
  );
}
