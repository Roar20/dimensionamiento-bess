import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { TooltipRecharts } from "@/components/tab-sfv/TooltipRecharts";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import type { PuntoDespachoPromedio } from "@/lib/tab-sfv-bess/despacho-diario-promedio";

interface Props {
  datos: readonly PuntoDespachoPromedio[];
  ventanaPunta: readonly [number, number];
}

const COLOR_SFV = "#F59E0B";
const COLOR_CARGA = "#4A7C59";
const COLOR_DESCARGA = "#7C3AED";
const COLOR_SOC = "#64748B";

export function GraficaDespacho({ datos, ventanaPunta }: Props) {
  const copy = COPY_M5.seccion3;
  const [puntaIni, puntaFin] = ventanaPunta;
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <ComposedChart
          data={[...datos]}
          margin={{ top: 20, right: 60, left: 10, bottom: 5 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
          <XAxis
            dataKey="hora"
            tickFormatter={(t) => `${t}h`}
            tick={{ fontSize: 11, fill: "#64748b" }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(v) => `${Math.round(Number(v))}`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(v) => `${v}%`}
          />
          <ReferenceArea
            yAxisId="left"
            x1={puntaIni}
            x2={puntaFin}
            fill="#3B82F6"
            fillOpacity={0.1}
            label={{
              value: copy.bandaPunta,
              position: "insideTop",
              fontSize: 10,
              fill: "#3B82F6",
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="carga_kw"
            name={copy.series.cargando}
            stroke={COLOR_CARGA}
            fill={COLOR_CARGA}
            fillOpacity={0.4}
            strokeWidth={1.5}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="descarga_kw"
            name={copy.series.descargando}
            stroke={COLOR_DESCARGA}
            fill={COLOR_DESCARGA}
            fillOpacity={0.4}
            strokeWidth={1.5}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="gen_kw"
            name={copy.series.generacion}
            stroke={COLOR_SFV}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="soc_pct"
            name={copy.series.soc}
            stroke={COLOR_SOC}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Tooltip
            content={
              <TooltipRecharts
                titulo={(h) => `Hora ${h}h`}
                formatear={(payload) =>
                  payload.map((p) => {
                    const isSoc = p.dataKey === "soc_pct";
                    const v = Number(p.value ?? 0);
                    return {
                      label: String(p.name ?? ""),
                      valor: isSoc
                        ? `${v.toFixed(0)}%`
                        : `${Math.round(v)} kW`,
                      color:
                        typeof p.color === "string" ? p.color : undefined,
                    };
                  })
                }
              />
            }
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
