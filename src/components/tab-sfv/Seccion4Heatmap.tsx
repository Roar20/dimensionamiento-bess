import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { caracterizarVariabilidad } from "@/lib/core/sfv";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import { generarNarrativaSeccion4 } from "@/lib/tab-sfv/narrativa";
import {
  nombreMes,
  type PeriodoActivo,
} from "@/lib/tab-sfv/filtrar-por-periodo";
import type { RegistroHorario } from "@/types/sfv";

import { BloqueTecnico } from "./BloqueTecnico";
import { NarrativaIntro } from "./NarrativaIntro";
import { TooltipRecharts } from "./TooltipRecharts";

interface Props {
  registros: readonly RegistroHorario[];
  periodo: PeriodoActivo;
}

/** Escala YlOrRd interpolada linealmente entre 5 paradas. */
function interpolarYlOrRd(t: number): string {
  const stops: Array<[number, [number, number, number]]> = [
    [0.0, [255, 255, 204]],
    [0.25, [254, 217, 118]],
    [0.5, [253, 141, 60]],
    [0.75, [227, 26, 28]],
    [1.0, [128, 0, 38]],
  ];
  const tt = Math.max(0, Math.min(1, t));
  for (let i = 0; i < stops.length - 1; i += 1) {
    const [t0, c0] = stops[i]!;
    const [t1, c1] = stops[i + 1]!;
    if (tt >= t0 && tt <= t1) {
      const frac = t1 === t0 ? 0 : (tt - t0) / (t1 - t0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * frac);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * frac);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * frac);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return "rgb(128, 0, 38)";
}

export function Seccion4Heatmap({ registros, periodo }: Props) {
  if (periodo.granularidad === "diario") {
    return <CurvaDelDia registros={registros} periodo={periodo} />;
  }
  return <HeatmapMensual registros={registros} periodo={periodo} />;
}

function HeatmapMensual({ registros, periodo }: Props) {
  const copy = COPY_M2.seccion4;

  const variab = useMemo(() => {
    if (registros.length === 0) return null;
    return caracterizarVariabilidad(registros as RegistroHorario[]);
  }, [registros]);

  const mesesDisponibles = useMemo(() => {
    if (!variab) return [];
    const meses = new Set<string>();
    Object.keys(variab.heatmap).forEach((mmdd) => {
      meses.add(mmdd.slice(0, 2));
    });
    return [...meses].sort();
  }, [variab]);

  const mesInicial =
    periodo.granularidad === "mensual"
      ? String(periodo.fechaInicio.getMonth() + 1).padStart(2, "0")
      : (mesesDisponibles[0] ?? "01");

  const [mesActivo, setMesActivo] = useState<string>(mesInicial);

  if (!variab) return null;

  const claves = Object.keys(variab.heatmap)
    .filter((k) => k.startsWith(mesActivo))
    .sort();
  const filas = claves.map((k) => variab.heatmap[k]!);
  const maxKw = filas.length === 0 ? 0 : Math.max(...filas.flat(), 1);

  const cellSize = 16;
  const margin = { top: 20, right: 60, bottom: 30, left: 50 };
  const width = margin.left + claves.length * cellSize + margin.right;
  const height = margin.top + 24 * cellSize + margin.bottom;

  const mesLabel = `${nombreMes(Number(mesActivo) - 1)} ${periodo.fechaInicio.getFullYear()}`;

  return (
    <section className="space-y-5">
      <NarrativaIntro
        titulo={copy.titulo}
        texto={generarNarrativaSeccion4(mesLabel)}
      />

      {mesesDisponibles.length > 1 ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-helper">{copy.selectorMes}</span>
          <Select value={mesActivo} onValueChange={setMesActivo}>
            <SelectTrigger className="min-w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mesesDisponibles.map((m) => (
                <SelectItem key={m} value={m}>
                  {nombreMes(Number(m) - 1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="rounded-card border border-brand-cardBorder bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-start gap-4">
          <div className="overflow-x-auto">
            <svg width={width} height={height} role="img" aria-label={`Heatmap de ${mesLabel}`}>
              {Array.from({ length: 24 }, (_, h) => (
                <text
                  key={`y-${h}`}
                  x={margin.left - 8}
                  y={margin.top + h * cellSize + 12}
                  textAnchor="end"
                  fontSize="10"
                  fill="#64748b"
                >
                  {h + 1}h
                </text>
              ))}
              {claves.map((mmdd, i) => (
                <text
                  key={`x-${mmdd}`}
                  x={margin.left + i * cellSize + cellSize / 2}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#64748b"
                >
                  {mmdd.slice(3)}
                </text>
              ))}
              {claves.flatMap((mmdd, i) =>
                (variab.heatmap[mmdd] ?? new Array(24).fill(0)).map((kw, h) => (
                  <rect
                    key={`${mmdd}-${h}`}
                    x={margin.left + i * cellSize}
                    y={margin.top + h * cellSize}
                    width={cellSize - 1}
                    height={cellSize - 1}
                    fill={interpolarYlOrRd(maxKw > 0 ? kw / maxKw : 0)}
                  >
                    <title>{`Día ${mmdd.slice(3)}, hora ${h + 1}h: ${kw.toFixed(1)} kW`}</title>
                  </rect>
                ))
              )}
            </svg>
          </div>
          <Leyenda maxKw={maxKw} />
        </div>
      </div>

      <BloqueTecnico titulo={copy.tecnico.titulo} tooltip={copy.tecnico.tooltip}>
        <div className="max-h-[300px] overflow-auto">
          <table className="w-full border-collapse text-[10px]">
            <thead className="sticky top-0 bg-slate-50">
              <tr>
                <th className="px-2 py-1 text-left text-ink-helper">Hora</th>
                {claves.map((k) => (
                  <th key={k} className="px-1 py-1 text-right text-ink-helper">
                    {k.slice(3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 24 }, (_, h) => (
                <tr key={h} className="border-b border-slate-100">
                  <td className="px-2 py-1 text-ink-secondary">{h + 1}h</td>
                  {claves.map((k) => (
                    <td
                      key={`${k}-${h}`}
                      className="px-1 py-1 text-right tabular-nums"
                    >
                      {(variab.heatmap[k]?.[h] ?? 0).toFixed(0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BloqueTecnico>
    </section>
  );
}

function Leyenda({ maxKw }: { maxKw: number }) {
  const copy = COPY_M2.seccion4;
  const pasos = 6;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-ink-helper">{copy.leyendaMax(maxKw)}</span>
      <div className="flex flex-col">
        {Array.from({ length: pasos }, (_, i) => {
          const t = 1 - i / (pasos - 1);
          return (
            <div
              key={i}
              style={{ backgroundColor: interpolarYlOrRd(t) }}
              className="h-5 w-6 border border-white"
            />
          );
        })}
      </div>
      <span className="text-[10px] text-ink-helper">{copy.leyendaMin}</span>
    </div>
  );
}

function CurvaDelDia({ registros, periodo }: Props) {
  const copy = COPY_M2.seccion4;
  const datos = Array.from({ length: 24 }, (_, h) => {
    const reg = registros.find((r) => r.timestamp.getHours() === h);
    return { hora: h + 1, kW: reg ? reg.potencia_kw_prom : 0 };
  });

  return (
    <section className="space-y-5">
      <NarrativaIntro
        titulo={copy.titulo}
        texto={`${copy.detalleDia}: ${periodo.label}.`}
      />
      <div className="rounded-card border border-brand-cardBorder bg-white p-4 shadow-card">
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart data={datos}>
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis
                dataKey="hora"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(t) => `${t}h`}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                content={
                  <TooltipRecharts
                    titulo={(h) => `Hora ${h}h`}
                    formatear={(payload) =>
                      payload.map((p) => ({
                        label: "Potencia",
                        valor: `${Number(p.value ?? 0).toFixed(1)} kW`,
                        color: "#4A7C59",
                      }))
                    }
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="kW"
                stroke="#4A7C59"
                fill="#4A7C59"
                fillOpacity={0.4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
