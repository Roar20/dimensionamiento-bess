import { AlertTriangle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import type { ResultadoCompleto } from "@/types/bess";

interface Props {
  resultado: ResultadoCompleto | null;
}

const FMT_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function Seccion2AnatomiaCaptura({ resultado }: Props) {
  const copy = COPY_M5.seccion2;
  if (!resultado) return null;

  // Agrupar por categoría (tipo es único en las 4 default).
  const tipos = [
    "toda_energia",
    "fuera_hora_punta_cfe",
    "compromiso_ppa_mensual_mwh",
    "exceso_capacidad_cfe_kw",
  ] as const;

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

      <div className="space-y-4">
        {tipos.map((tipo) => {
          const sims = resultado.simulaciones.filter(
            (s) => s.categoria.tipo === tipo
          );
          if (sims.length === 0) return null;
          const greedy = sims.find((s) => s.estrategia === "greedy");
          const arb = sims.find((s) => s.estrategia === "arbitraje");
          if (!greedy || !arb) return null;
          const cat = greedy.categoria;
          const energiaTotal = greedy.kpis.energia_categoria_total_mwh;
          const sinCaptura = energiaTotal < 1;

          return (
            <Card key={tipo} className={sinCaptura ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <h4 className="text-sm font-semibold text-ink-primary">
                      {cat.etiqueta}
                    </h4>
                    <p className="mt-2 text-xs text-ink-helper">
                      {cat.descripcion}
                    </p>
                    <div className="mt-3 text-2xl font-bold tabular-nums text-ink-primary">
                      {FMT_ENTERO.format(energiaTotal)} MWh
                    </div>
                    <div className="text-xs text-ink-helper">
                      {copy.disponibles}
                    </div>
                  </div>

                  <ColumnaEstrategia
                    color="bg-amber-500"
                    titulo={copy.greedy}
                    capturado_mwh={greedy.kpis.cargado_total_mwh}
                    descripcion={copy.capturado(
                      greedy.kpis.fraccion_capturada * 100,
                      greedy.kpis.ciclos_periodo
                    )}
                    acentoTexto="text-amber-700"
                  />

                  <ColumnaEstrategia
                    color="bg-action"
                    titulo={copy.arbitraje}
                    capturado_mwh={arb.kpis.cargado_total_mwh}
                    descripcion={copy.capturadoArbitraje(
                      arb.kpis.fraccion_capturada * 100,
                      arb.kpis.ciclos_periodo,
                      arb.kpis.horas_descarga_en_punta
                    )}
                    acentoTexto="text-action"
                  />
                </div>

                {sinCaptura ? (
                  <div
                    role="alert"
                    className="mt-4 flex gap-3 rounded-md border-l-4 border-status-warning bg-amber-50 p-3 text-xs text-amber-900"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
                    <p>{copy.sinCaptura}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function ColumnaEstrategia({
  color,
  titulo,
  capturado_mwh,
  descripcion,
  acentoTexto,
}: {
  color: string;
  titulo: string;
  capturado_mwh: number;
  descripcion: string;
  acentoTexto: string;
}) {
  return (
    <div className="space-y-2 border-l border-brand-cardBorder pl-6">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
        <h5 className="text-sm font-medium text-ink-primary">{titulo}</h5>
      </div>
      <div className={`text-xl font-bold tabular-nums ${acentoTexto}`}>
        {FMT_ENTERO.format(capturado_mwh)} MWh
      </div>
      <div className="text-xs text-ink-secondary">{descripcion}</div>
    </div>
  );
}
