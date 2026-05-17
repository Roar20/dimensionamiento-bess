import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import { CATALOGO_HYPERSTRONG } from "@/lib/bess/catalogo-hyperstrong";
import { generarNarrativaRecomendacion } from "@/lib/bess/narrativa-recomendacion";
import type { RecomendacionEquipo } from "@/lib/bess/recomendacion";
import type {
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";

import { CardEquipo } from "./CardEquipo";

interface Props {
  recomendacion: RecomendacionEquipo | null;
  seleccion: SeleccionCategoria;
  resumenes: readonly ResumenCategoria[];
  poi_kw: number | null;
  onVerFicha: (id: string) => void;
}

export function Seccion2Catalogo({
  recomendacion,
  seleccion,
  resumenes,
  poi_kw,
  onVerFicha,
}: Props) {
  const copy = COPY_M3.seccion2;
  const recomendadoId = recomendacion?.equipo_recomendado.id ?? null;

  const intro =
    recomendacion && poi_kw !== null
      ? generarNarrativaRecomendacion(
          seleccion,
          resumenes,
          recomendacion.equipo_recomendado,
          poi_kw
        )
      : copy.sinPlanta;

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={intro} />

      <div className="grid gap-6 pt-3 md:grid-cols-3">
        {CATALOGO_HYPERSTRONG.map((equipo) => (
          <CardEquipo
            key={equipo.id}
            equipo={equipo}
            esRecomendado={equipo.id === recomendadoId}
            onVerFicha={onVerFicha}
          />
        ))}
      </div>
    </section>
  );
}
