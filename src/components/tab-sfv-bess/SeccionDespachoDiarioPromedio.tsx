import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import { calcularDespachoDiarioPromedio } from "@/lib/tab-sfv-bess/despacho-diario-promedio";
import type { EstadoHorario } from "@/types/bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  detalle: readonly EstadoHorario[];
  capUtilKwh: number;
}

const COLOR_GEN = "#B45309";
const COLOR_CAPTURE = "#0F766E";
const COLOR_DISCHARGE = "#6366F1";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const HORAS_LABELS = Array.from({ length: 24 }, (_, i) =>
  String(i + 1).padStart(2, "0") + ":00"
);

export function SeccionDespachoDiarioPromedio({ detalle, capUtilKwh }: Props) {
  const puntos = useMemo(
    () => calcularDespachoDiarioPromedio(detalle, capUtilKwh),
    [detalle, capUtilKwh]
  );

  const data = {
    labels: HORAS_LABELS,
    datasets: [
      {
        label: "Generación SFV",
        data: puntos.map((p) => p.gen_kw),
        borderColor: COLOR_GEN,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
      },
      {
        label: "Carga BESS",
        data: puntos.map((p) => p.carga_kw),
        borderColor: COLOR_CAPTURE,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
      },
      {
        label: "Descarga BESS",
        data: puntos.map((p) => p.descarga_kw),
        borderColor: COLOR_DISCHARGE,
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
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
          label: (ctx) =>
            `${ctx.dataset.label}: ${Math.round(ctx.parsed.y ?? 0).toLocaleString("es-MX")} kW`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#737373", font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (v) => Number(v).toLocaleString("es-MX"),
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            {COPY_SFV_BESS.charts.despachoTitulo}
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            {COPY_SFV_BESS.charts.despachoSubtitulo}
          </p>
        </div>
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          {COPY_SFV_BESS.charts.despachoUnidad}
        </span>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda color={COLOR_GEN} texto="Generación SFV" />
          <Leyenda color={COLOR_CAPTURE} texto="Carga BESS" />
          <Leyenda color={COLOR_DISCHARGE} texto="Descarga BESS" />
        </div>
        <div className="relative h-[260px] w-full">
          <Line data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

function Leyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
      {texto}
    </span>
  );
}
