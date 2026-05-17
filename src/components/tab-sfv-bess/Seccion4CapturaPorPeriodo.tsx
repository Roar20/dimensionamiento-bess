import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { TooltipRecharts } from "@/components/tab-sfv/TooltipRecharts";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import { agregarCapturaPorPeriodo } from "@/lib/tab-sfv-bess/agregar-por-periodo";
import type { Granularidad } from "@/lib/tab-sfv/filtrar-por-periodo";
import type { ResultadoSimulacion } from "@/types/bess";

interface Props {
  simArbitraje: ResultadoSimulacion | null;
  granularidad: Granularidad;
}

const COLOR_CARGA = "#4A7C59";
const COLOR_DESCARGA = "#7C3AED";
const COLOR_REF = "#94a3b8";

export function Seccion4CapturaPorPeriodo({
  simArbitraje,
  granularidad,
}: Props) {
  const copy = COPY_M5.seccion4;

  const datos = useMemo(() => {
    if (!simArbitraje) return [];
    return agregarCapturaPorPeriodo(
      simArbitraje.detalle_horario,
      granularidad
    );
  }, [simArbitraje, granularidad]);

  if (!simArbitraje || datos.length === 0) return null;

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

      <Card>
        <CardContent className="p-5">
          <div className="h-[320px] w-full">
            <ResponsiveContainer>
              <ComposedChart
                data={datos}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={Math.max(0, Math.floor(datos.length / 24))}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  tickFormatter={(v) => `${Math.round(Number(v))}`}
                />
                <Tooltip
                  content={
                    <TooltipRecharts
                      titulo={(l) => String(l ?? "")}
                      formatear={(payload) =>
                        payload.map((p) => ({
                          label: String(p.name ?? ""),
                          valor: `${Number(p.value ?? 0).toFixed(1)} MWh`,
                          color:
                            typeof p.color === "string" ? p.color : undefined,
                        }))
                      }
                    />
                  }
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar
                  dataKey="cargado_mwh"
                  name={copy.series.cargado}
                  fill={COLOR_CARGA}
                  radius={[3, 3, 0, 0]}
                />
                <Bar
                  dataKey="descargado_mwh"
                  name={copy.series.descargado}
                  fill={COLOR_DESCARGA}
                  radius={[3, 3, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="energia_categoria_mwh"
                  name={copy.series.energiaCategoria}
                  stroke={COLOR_REF}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
