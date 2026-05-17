import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { TooltipRecharts } from "@/components/tab-sfv/TooltipRecharts";
import { CATALOGO_HYPERSTRONG } from "@/lib/bess/catalogo-hyperstrong";

const COLOR_RECOMENDADO = "#4A7C59";
const COLOR_NEUTRO = "#94a3b8";

interface Props {
  titulo: string;
  descripcion: string;
  valores: readonly { equipoId: string; nombre: string; valor: number }[];
  unidad: string;
  formatear: (v: number) => string;
  equipoRecomendadoId: string | null;
}

export function GraficaComparativa({
  titulo,
  descripcion,
  valores,
  unidad,
  formatear,
  equipoRecomendadoId,
}: Props) {
  const datos = valores.map((v) => ({
    equipo: v.nombre,
    equipoId: v.equipoId,
    valor: v.valor,
  }));

  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <h4 className="text-sm font-semibold text-ink-primary">{titulo}</h4>
        <p className="text-xs text-ink-helper">{descripcion}</p>
        <div className="h-[200px] w-full pt-2">
          <ResponsiveContainer>
            <BarChart
              data={datos}
              margin={{ top: 10, right: 10, bottom: 5, left: 10 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis
                dataKey="equipo"
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={formatear}
              />
              <Tooltip
                content={
                  <TooltipRecharts
                    titulo={(eq) => String(eq ?? "")}
                    formatear={(payload) =>
                      payload.map((p) => ({
                        label: "Valor",
                        valor: `${formatear(Number(p.value ?? 0))} ${unidad}`,
                        color:
                          (p.payload as { equipoId?: string } | undefined)
                            ?.equipoId === equipoRecomendadoId
                            ? COLOR_RECOMENDADO
                            : COLOR_NEUTRO,
                      }))
                    }
                  />
                }
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                {datos.map((d) => (
                  <Cell
                    key={d.equipoId}
                    fill={
                      d.equipoId === equipoRecomendadoId
                        ? COLOR_RECOMENDADO
                        : COLOR_NEUTRO
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { CATALOGO_HYPERSTRONG };
