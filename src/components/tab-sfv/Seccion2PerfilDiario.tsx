import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  calcularPerfilHorario,
  detectarClipping,
  VENTANA_PUNTA_CFE,
} from "@/lib/core/sfv";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import { generarNarrativaSeccion2 } from "@/lib/tab-sfv/narrativa";
import type { PeriodoActivo } from "@/lib/tab-sfv/filtrar-por-periodo";
import type { ConfiguracionPlanta, RegistroHorario } from "@/types/sfv";

import { BloqueTecnico } from "./BloqueTecnico";
import { KPICard } from "./KPICard";
import { NarrativaIntro } from "./NarrativaIntro";

interface Props {
  registros: readonly RegistroHorario[];
  config: ConfiguracionPlanta;
  periodo: PeriodoActivo;
}

export function Seccion2PerfilDiario({ registros, config, periodo }: Props) {
  const copy = COPY_M2.seccion2;

  const { perfil, clipping } = useMemo(() => {
    if (registros.length === 0) {
      return { perfil: null, clipping: null };
    }
    return {
      perfil: calcularPerfilHorario(registros as RegistroHorario[]),
      clipping: detectarClipping(
        registros as RegistroHorario[],
        config.capacidad_poi_kw
      ),
    };
  }, [registros, config.capacidad_poi_kw]);

  if (!perfil || !clipping) return null;

  const datos = Array.from({ length: 24 }, (_, i) => {
    const h = i + 1;
    const e = perfil.perfil_por_hora[h];
    return {
      hora: h,
      promedio: e?.kW_promedio ?? 0,
      maximo: e?.kW_maximo ?? 0,
    };
  });

  const [puntaInicio, puntaFin] = VENTANA_PUNTA_CFE;

  return (
    <section className="space-y-5">
      <NarrativaIntro
        titulo={copy.titulo}
        texto={generarNarrativaSeccion2(perfil, periodo)}
      />

      <div className="rounded-card border border-brand-cardBorder bg-white p-4 shadow-card">
        <div className="h-[360px] w-full">
          <ResponsiveContainer>
            <ComposedChart
              data={datos}
              margin={{ top: 20, right: 30, bottom: 30, left: 10 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis
                dataKey="hora"
                tickFormatter={(t) => `${t}h`}
                tick={{ fontSize: 12, fill: "#64748b" }}
                label={{
                  value: copy.grafica.ejeXLabel,
                  position: "insideBottom",
                  offset: -10,
                  fontSize: 12,
                  fill: "#64748b",
                }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                label={{
                  value: copy.grafica.ejeYLabel,
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                  fill: "#64748b",
                }}
              />
              <Tooltip
                formatter={(v: number) => `${Math.round(v)} kW`}
                labelFormatter={(l) => `Hora ${l}h`}
                contentStyle={{
                  backgroundColor: "#1B3A52",
                  border: "none",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 12,
                }}
              />
              <ReferenceArea
                x1={puntaInicio}
                x2={puntaFin}
                fill="#3B82F6"
                fillOpacity={0.12}
                label={{
                  value: copy.grafica.bandaPunta,
                  position: "insideTop",
                  fontSize: 11,
                  fill: "#3B82F6",
                }}
              />
              <ReferenceLine
                y={config.capacidad_poi_kw}
                stroke="#1B3A52"
                strokeWidth={1.5}
                label={{
                  value: copy.grafica.referenciaPoi(config.capacidad_poi_kw),
                  position: "right",
                  fontSize: 11,
                  fill: "#1B3A52",
                }}
              />
              <Area
                type="monotone"
                dataKey="promedio"
                name={copy.grafica.seriePromedio}
                stroke="#4A7C59"
                fill="#4A7C59"
                fillOpacity={0.4}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="maximo"
                name={copy.grafica.serieMax}
                stroke="#D97706"
                strokeDasharray="4 4"
                dot={false}
                strokeWidth={1.5}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <KPICard
        label={copy.kpiEnergiaPunta.label}
        valor={`${perfil.pct_energia_en_punta.toFixed(1)}`}
        unidad="%"
        tooltip={copy.kpiEnergiaPunta.tooltip}
        destacado
      />

      <BloqueTecnico titulo={copy.tecnico.titulo}>
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-brand-cardBorder text-ink-helper">
                  <th className="px-2 py-1 text-left">
                    {copy.tecnico.tabla.hora}
                  </th>
                  <th className="px-2 py-1 text-right">
                    {copy.tecnico.tabla.promedio}
                  </th>
                  <th className="px-2 py-1 text-right">
                    {copy.tecnico.tabla.maximo}
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((d) => (
                  <tr key={d.hora} className="border-b border-slate-100">
                    <td className="px-2 py-1 text-ink-secondary">{d.hora}h</td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {d.promedio.toFixed(1)}
                    </td>
                    <td className="px-2 py-1 text-right tabular-nums">
                      {d.maximo.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-ink-secondary">
            {clipping.hay_clipping_real
              ? copy.tecnico.clipping.conClipping(
                  clipping.horas_en_clipping,
                  clipping.dias_con_clipping
                )
              : copy.tecnico.clipping.sinClipping}
          </p>
        </div>
      </BloqueTecnico>
    </section>
  );
}
