import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import { VENTANA_HORA_PUNTA_CFE_DEFAULT } from "@/lib/core/bess";
import { calcularDespachoDiarioPromedio } from "@/lib/tab-sfv-bess/despacho-diario-promedio";
import type {
  ConfiguracionBESS,
  ResultadoSimulacion,
} from "@/types/bess";

import { GraficaDespacho } from "./GraficaDespacho";

interface Props {
  simGreedy: ResultadoSimulacion | null;
  simArbitraje: ResultadoSimulacion | null;
  config: ConfiguracionBESS;
  /** Número de días distintos en el detalle (para mostrar en el subtítulo). */
  nDias: number;
  /** Si el periodo activo es de un solo día, mostramos su label en lugar de "promedio". */
  labelDiaUnico?: string;
}

export function Seccion3DespachoDiario({
  simGreedy,
  simArbitraje,
  config,
  nDias,
  labelDiaUnico,
}: Props) {
  const copy = COPY_M5.seccion3;
  if (!simGreedy || !simArbitraje) return null;

  const capUtil = config.e_kwh * config.dod;
  const datosGreedy = calcularDespachoDiarioPromedio(
    simGreedy.detalle_horario,
    capUtil
  );
  const datosArb = calcularDespachoDiarioPromedio(
    simArbitraje.detalle_horario,
    capUtil
  );

  const descripcion = labelDiaUnico
    ? copy.descripcionDia(labelDiaUnico)
    : copy.descripcion(nDias);

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={descripcion} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
              <h4 className="text-base font-semibold text-ink-primary">
                {copy.greedyTitulo}
              </h4>
            </div>
            <p className="text-xs text-ink-helper">{copy.greedyTexto}</p>
          </CardHeader>
          <CardContent>
            <GraficaDespacho
              datos={datosGreedy}
              ventanaPunta={VENTANA_HORA_PUNTA_CFE_DEFAULT}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 pb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-action" />
              <h4 className="text-base font-semibold text-ink-primary">
                {copy.arbitrajeTitulo}
              </h4>
            </div>
            <p className="text-xs text-ink-helper">{copy.arbitrajeTexto}</p>
          </CardHeader>
          <CardContent>
            <GraficaDespacho
              datos={datosArb}
              ventanaPunta={VENTANA_HORA_PUNTA_CFE_DEFAULT}
            />
          </CardContent>
        </Card>
      </div>

      <p className="text-sm italic text-ink-secondary">{copy.insight}</p>
    </section>
  );
}
