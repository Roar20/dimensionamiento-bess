import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import type { FlujoAnual } from "@/lib/tab-financiero/calculos";

interface Props {
  flujos: readonly FlujoAnual[];
  curva_soh: readonly number[];
}

const COLOR_SOH = "#B45309";
const COLOR_INGRESO = "#0F766E";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FMT_M = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function SeccionSohErosion({ flujos, curva_soh }: Props) {
  const { labels, sohPct, ingresoMxn } = useMemo(() => {
    const labels = flujos.map((f) => `Año ${f.anio}`);
    const sohPct = flujos.map(
      (_f, i) => ((curva_soh[i] as number) ?? 0) * 100
    );
    const ingresoMxn = flujos.map((f) => f.ingreso_total_mxn);
    return { labels, sohPct, ingresoMxn };
  }, [flujos, curva_soh]);

  const data = {
    labels,
    datasets: [
      {
        label: "Ingreso anual",
        data: ingresoMxn,
        borderColor: COLOR_INGRESO,
        backgroundColor: "rgba(15, 118, 110, 0.10)",
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.15,
        yAxisID: "y",
        order: 2,
      },
      {
        label: "SOH (%)",
        data: sohPct,
        borderColor: COLOR_SOH,
        borderDash: [4, 4],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.15,
        yAxisID: "y1",
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
        callbacks: {
          label: (ctx) => {
            if (ctx.dataset.yAxisID === "y1") {
              return `SOH: ${FMT_PCT.format((ctx.parsed.y as number) ?? 0)}%`;
            }
            return `Ingreso: ${FMT_M.format(((ctx.parsed.y as number) ?? 0) / 1_000_000)} M MXN`;
          },
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 10 }, maxRotation: 0 },
      },
      y: {
        type: "linear",
        position: "left",
        grid: { color: COLOR_GRID },
        ticks: {
          color: COLOR_INGRESO,
          font: { size: 11 },
          callback: (v) => `${(Number(v) / 1_000_000).toFixed(1)} M`,
        },
      },
      y1: {
        type: "linear",
        position: "right",
        min: 60,
        max: 100,
        grid: { display: false },
        ticks: {
          color: COLOR_SOH,
          font: { size: 11 },
          callback: (v) => `${Number(v).toFixed(0)}%`,
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Erosión económica por SOH
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Cómo la curva SOH erosiona el ingreso anual
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Eje izquierdo: ingreso bruto anual del SFV+BESS, en MXN. Eje
          derecho: SOH del catálogo Hyperstrong, año a año. La curva SOH
          procede de <code>equipo.curvaSoh</code>; el Tab Financiero no
          replica la visualización canónica que vive en Tab BESS, solo
          consume los valores numéricos.
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda color={COLOR_INGRESO} texto="Ingreso anual (MXN)" />
          <Leyenda color={COLOR_SOH} dashed texto="SOH (%)" />
        </div>
        <div className="relative h-[300px] w-full">
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

function Leyenda({
  color,
  texto,
  dashed = false,
}: {
  color: string;
  texto: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{
          backgroundColor: color,
          border: dashed ? `1px dashed ${color}` : undefined,
        }}
      />
      {texto}
    </span>
  );
}
