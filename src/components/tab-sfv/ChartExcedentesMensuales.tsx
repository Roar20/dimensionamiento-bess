import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

import { agregarExcedentesPorMes } from "@/lib/core/sfv";
import type { RegistroHorario } from "@/types/sfv";

interface Props {
  registros: readonly RegistroHorario[];
  poiKw: number;
}

const COLOR_CAPTURE = "#0F766E";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

export function ChartExcedentesMensuales({ registros, poiKw }: Props) {
  const series = useMemo(() => {
    const datos = agregarExcedentesPorMes(registros, poiKw);
    if (datos.length === 0) {
      return { labels: [] as string[], values: [] as number[] };
    }
    // Si el dataset cubre múltiples años, se grafica el año más reciente.
    const anios = new Set(datos.map((d) => d.mes.slice(0, 4)));
    const anioFoco =
      anios.size === 1
        ? [...anios][0]!
        : [...anios].sort().slice(-1)[0]!;
    const filtrado = datos.filter((d) => d.mes.startsWith(anioFoco));
    return {
      labels: filtrado.map((d) => d.mes_label),
      values: filtrado.map((d) => d.excedente_mwh),
    };
  }, [registros, poiKw]);

  const data = {
    labels: series.labels,
    datasets: [
      {
        label: "Excedente mensual",
        data: series.values,
        backgroundColor: COLOR_CAPTURE,
        borderRadius: 3,
        borderSkipped: false as const,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${(ctx.parsed.y ?? 0).toFixed(1)} MWh`,
        },
      },
    },
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
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Excedentes mensuales
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Energía generada por encima del techo POI agregada por mes
          </p>
        </div>
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          MWh/mes
        </span>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="relative h-[260px] w-full">
          {series.labels.length === 0 ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
              Sin registros disponibles.
            </p>
          ) : (
            <Bar data={data} options={options} />
          )}
        </div>
      </div>
    </section>
  );
}
