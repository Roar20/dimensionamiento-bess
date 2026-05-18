import { useMemo, useRef, useEffect } from "react";
import { Chart as ChartJS, type ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import { calcularPerfilHorario } from "@/lib/core/sfv";
import type { RegistroHorario } from "@/types/sfv";

import { SelectorInline } from "./SelectorInline";
import { usePeriodoInline } from "./usePeriodoInline";

interface Props {
  registros: readonly RegistroHorario[];
}

const HORAS_LABELS = Array.from({ length: 24 }, (_, i) =>
  String(i + 1).padStart(2, "0") + ":00"
);

const COLOR_GENERATION = "#B45309";
const COLOR_GENERATION_BAND = "rgba(180, 83, 9, 0.18)";
const COLOR_BASELINE = "#737373";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

export function ChartPerfilHorario({ registros }: Props) {
  const periodo = usePeriodoInline(registros);
  const datasetVacio = periodo.registrosFiltrados.length === 0;
  const chartRef = useRef<ChartJS<"line">>(null);

  const perfil = useMemo(() => {
    if (datasetVacio) return null;
    return calcularPerfilHorario(periodo.registrosFiltrados);
  }, [datasetVacio, periodo.registrosFiltrados]);

  const { promedio, p25, p75, maximo } = useMemo(() => {
    if (!perfil) {
      const zeros = Array(24).fill(0);
      return { promedio: zeros, p25: zeros, p75: zeros, maximo: zeros };
    }
    const promedio: number[] = [];
    const p25: number[] = [];
    const p75: number[] = [];
    const maximo: number[] = [];
    for (let h = 1; h <= 24; h += 1) {
      const e = perfil.perfil_por_hora[h]!;
      promedio.push(e.kW_promedio);
      p25.push(e.kW_p25);
      p75.push(e.kW_p75);
      maximo.push(e.kW_maximo);
    }
    return { promedio, p25, p75, maximo };
  }, [perfil]);

  // Asegura redibujo cuando cambia el dataset (Chart.js no reactivo a refs).
  useEffect(() => {
    chartRef.current?.update();
  }, [promedio, p25, p75, maximo]);

  const data = {
    labels: HORAS_LABELS,
    datasets: [
      {
        label: "P75",
        data: p75,
        borderColor: "transparent",
        backgroundColor: COLOR_GENERATION_BAND,
        pointRadius: 0,
        fill: "+1",
        tension: 0.35,
        order: 3,
      },
      {
        label: "P25",
        data: p25,
        borderColor: "transparent",
        backgroundColor: COLOR_GENERATION_BAND,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 3,
      },
      {
        label: "Pico máximo",
        data: maximo,
        borderColor: COLOR_BASELINE,
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 2,
      },
      {
        label: "Generación promedio",
        data: promedio,
        borderColor: COLOR_GENERATION,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 1,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item) =>
          item.dataset.label !== "P25" && item.dataset.label !== "P75",
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${Math.round(ctx.parsed.y ?? 0).toLocaleString("es-MX")} kW`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (value) => Number(value).toLocaleString("es-MX"),
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Perfil horario promedio anual
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Generación promedio por hora del día · base 365 días
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            kW
          </span>
          <SelectorInline
            granularidad={periodo.granularidad}
            onGranularidadChange={periodo.setGranularidad}
            periodo={periodo.periodo}
            periodos={periodo.periodos}
            onSeleccionarPorId={periodo.seleccionarPorId}
            onAnterior={periodo.irAnterior}
            onSiguiente={periodo.irSiguiente}
            hayAnterior={periodo.hayAnterior}
            haySiguiente={periodo.haySiguiente}
          />
        </div>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda colorBg={COLOR_GENERATION} texto="Generación promedio" />
          <Leyenda colorBg={COLOR_GENERATION} opacity={0.3} texto="Banda P25–P75" />
          <Leyenda colorBg={COLOR_BASELINE} dashed texto="Pico máximo del año" />
        </div>
        <div className="relative h-[260px] w-full">
          {datasetVacio ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
              Sin registros en el periodo seleccionado.
            </p>
          ) : (
            <Line ref={chartRef} data={data} options={options} />
          )}
        </div>
      </div>
    </section>
  );
}

function Leyenda({
  colorBg,
  opacity = 1,
  dashed = false,
  texto,
}: {
  colorBg: string;
  opacity?: number;
  dashed?: boolean;
  texto: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{
          backgroundColor: colorBg,
          opacity,
          border: dashed ? `1px dashed ${colorBg}` : undefined,
        }}
      />
      {texto}
    </span>
  );
}
