import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import {
  CATALOGO_HYPERSTRONG,
  costoPorKwh,
  densidadEnergetica,
} from "@/lib/bess/catalogo-hyperstrong";

import { GraficaComparativa } from "./GraficaComparativa";

interface Props {
  equipoRecomendadoId: string | null;
}

const FMT_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function Seccion4GraficasComparativas({
  equipoRecomendadoId,
}: Props) {
  const copy = COPY_M3.seccion4;

  const base = CATALOGO_HYPERSTRONG.map((e) => ({
    equipoId: e.id,
    nombre: e.nombre_corto,
  }));

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

      <div className="grid gap-4 md:grid-cols-2">
        <GraficaComparativa
          titulo={copy.graficas.potencia.titulo}
          descripcion={copy.graficas.potencia.descripcion}
          valores={base.map((b, i) => ({
            ...b,
            valor: CATALOGO_HYPERSTRONG[i]!.kw_ac,
          }))}
          unidad="kW"
          formatear={(v) => FMT_ENTERO.format(v)}
          equipoRecomendadoId={equipoRecomendadoId}
        />
        <GraficaComparativa
          titulo={copy.graficas.energia.titulo}
          descripcion={copy.graficas.energia.descripcion}
          valores={base.map((b, i) => ({
            ...b,
            valor: CATALOGO_HYPERSTRONG[i]!.kwh,
          }))}
          unidad="kWh"
          formatear={(v) => FMT_ENTERO.format(v)}
          equipoRecomendadoId={equipoRecomendadoId}
        />
        <GraficaComparativa
          titulo={copy.graficas.densidad.titulo}
          descripcion={copy.graficas.densidad.descripcion}
          valores={base.map((b, i) => ({
            ...b,
            valor: densidadEnergetica(CATALOGO_HYPERSTRONG[i]!),
          }))}
          unidad="kWh/m²"
          formatear={(v) => FMT_ENTERO.format(v)}
          equipoRecomendadoId={equipoRecomendadoId}
        />
        <GraficaComparativa
          titulo={copy.graficas.costo.titulo}
          descripcion={copy.graficas.costo.descripcion}
          valores={base.map((b, i) => ({
            ...b,
            valor: costoPorKwh(CATALOGO_HYPERSTRONG[i]!),
          }))}
          unidad="USD/kWh"
          formatear={(v) => `$${FMT_ENTERO.format(v)}`}
          equipoRecomendadoId={equipoRecomendadoId}
        />
      </div>
    </section>
  );
}
