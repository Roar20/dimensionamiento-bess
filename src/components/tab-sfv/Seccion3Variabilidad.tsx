import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { caracterizarVariabilidad } from "@/lib/core/sfv";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import { calcularHistogramaEnergia } from "@/lib/tab-sfv/histograma-energia";
import {
  formatFechaLarga,
  generarNarrativaSeccion3,
} from "@/lib/tab-sfv/narrativa";
import type { PeriodoActivo } from "@/lib/tab-sfv/filtrar-por-periodo";
import type { RegistroHorario } from "@/types/sfv";

import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";
import { KPICard } from "./KPICard";
import { NarrativaIntro } from "./NarrativaIntro";
import { TooltipRecharts } from "./TooltipRecharts";

interface Props {
  registros: readonly RegistroHorario[];
  periodo: PeriodoActivo;
}

const FORMATO_MWH = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

export function Seccion3Variabilidad({ registros, periodo }: Props) {
  const copy = COPY_M2.seccion3;

  const variab = useMemo(() => {
    if (registros.length === 0) return null;
    return caracterizarVariabilidad(registros as RegistroHorario[]);
  }, [registros]);

  const histograma = useMemo(() => {
    if (!variab) return [];
    return calcularHistogramaEnergia(variab.serie_diaria);
  }, [variab]);

  if (!variab) return null;

  const datosSerie = Object.entries(variab.serie_diaria)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, mwh]) => ({ fecha, mwh }));

  return (
    <section className="space-y-5">
      <NarrativaIntro
        titulo={copy.titulo}
        texto={generarNarrativaSeccion3(variab, periodo)}
      />

      <div className="rounded-card border border-brand-cardBorder bg-white p-4 shadow-card">
        <div className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={datosSerie}
              margin={{ top: 20, right: 30, bottom: 30, left: 10 }}
            >
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 10, fill: "#64748b" }}
                interval={Math.ceil(datosSerie.length / 14)}
                tickFormatter={(f: string) => f.slice(5)}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#64748b" }}
                label={{
                  value: copy.serieLabel,
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 12,
                  fill: "#64748b",
                }}
              />
              <Tooltip
                content={
                  <TooltipRecharts
                    titulo={(fecha) => formatFechaLarga(fecha ?? "")}
                    formatear={(payload) =>
                      payload.map((p) => ({
                        label: "Energía",
                        valor: `${Number(p.value ?? 0).toFixed(2)} MWh`,
                        color: "#4A7C59",
                      }))
                    }
                  />
                }
              />
              <ReferenceLine
                y={variab.promedio_mwh}
                stroke="#3B82F6"
                strokeDasharray="4 4"
                label={{
                  value: copy.promedioLabel(variab.promedio_mwh),
                  position: "right",
                  fontSize: 10,
                  fill: "#3B82F6",
                }}
              />
              <ReferenceLine
                y={variab.p10_mwh}
                stroke="#D97706"
                strokeDasharray="4 4"
                label={{
                  value: copy.p10Label(variab.p10_mwh),
                  position: "right",
                  fontSize: 10,
                  fill: "#D97706",
                }}
              />
              <Bar dataKey="mwh" fill="#4A7C59" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPICard
          label={copy.kpis.mejorDia.label}
          valor={FORMATO_MWH.format(variab.dia_mejor_mwh)}
          unidad="MWh"
          sublabel={formatFechaLarga(variab.dia_mejor_fecha)}
          tooltip={copy.kpis.mejorDia.tooltip}
        />
        <KPICard
          label={copy.kpis.peorDia.label}
          valor={FORMATO_MWH.format(variab.dia_peor_mwh)}
          unidad="MWh"
          sublabel={formatFechaLarga(variab.dia_peor_fecha)}
          tooltip={copy.kpis.peorDia.tooltip}
        />
        <KPICard
          label={copy.kpis.promedio.label}
          valor={FORMATO_MWH.format(variab.promedio_mwh)}
          unidad="MWh"
          tooltip={copy.kpis.promedio.tooltip}
        />
        <KPICard
          label={copy.kpis.variabilidad.label}
          valor={(variab.coef_variacion * 100).toFixed(1)}
          unidad="%"
          tooltip={copy.kpis.variabilidad.tooltip}
        />
        <KPICard
          label={copy.kpis.diasAnomalos.label}
          valor={String(variab.n_dias_anomalos)}
          tooltip={copy.kpis.diasAnomalos.tooltip}
        />
      </div>

      <MetodologiaDetalles titulo={copy.tecnico.titulo}>
        <p className="mb-3 text-ink-secondary">{copy.tecnico.explicacion}</p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer>
            <BarChart data={histograma}>
              <CartesianGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#64748b" }}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                content={
                  <TooltipRecharts
                    titulo={(rango) => `Rango ${rango} MWh`}
                    formatear={(payload) =>
                      payload.map((p) => ({
                        label: "Días en el rango",
                        valor: `${Number(p.value ?? 0)}`,
                        color: "#4A7C59",
                      }))
                    }
                  />
                }
              />
              <Bar dataKey="dias" fill="#4A7C59" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </MetodologiaDetalles>
    </section>
  );
}
