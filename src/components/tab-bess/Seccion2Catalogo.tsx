import { AlertTriangle } from "lucide-react";

import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import { CATALOGO_HYPERSTRONG } from "@/lib/bess/catalogo-hyperstrong";
import type { RecomendacionEquipo } from "@/lib/bess/recomendacion";

import { CardEquipo } from "./CardEquipo";

interface Props {
  recomendacion: RecomendacionEquipo | null;
  onVerFicha: (id: string) => void;
}

export function Seccion2Catalogo({ recomendacion, onVerFicha }: Props) {
  const copy = COPY_M3.seccion2;
  const recomendadoId = recomendacion?.equipo_recomendado?.id ?? null;
  const sinRecomendacion =
    recomendacion !== null && recomendacion.equipo_recomendado === null;
  const intro = recomendacion ? recomendacion.razon : copy.sinPlanta;

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={intro} />

      {recomendacion?.alerta ? (
        <div
          role="alert"
          className="flex gap-3 rounded-card border-l-4 border-status-warning bg-amber-50 p-4 text-sm text-amber-900"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-status-warning"
            aria-hidden="true"
          />
          <p>{recomendacion.alerta}</p>
        </div>
      ) : null}

      <div className="grid gap-6 pt-3 md:grid-cols-3">
        {CATALOGO_HYPERSTRONG.map((equipo) => (
          <CardEquipo
            key={equipo.id}
            equipo={equipo}
            esRecomendado={equipo.id === recomendadoId}
            descartado={sinRecomendacion}
            onVerFicha={onVerFicha}
          />
        ))}
      </div>
    </section>
  );
}
