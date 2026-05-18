import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

import { HallazgoEjecutivo } from "@/components/ui/HallazgoEjecutivo";
import type { EstadoHorario } from "@/types/bess";
import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";

interface Props {
  detalle: readonly EstadoHorario[];
  /** Etiqueta de la categoría activa, para narrar el hallazgo si captura = 0. */
  categoriaEtiqueta: string;
  /** Nombre de la planta, para narrar el hallazgo. */
  nombrePlanta: string;
  /** POI en kW, para narrar el hallazgo. */
  poiKw: number;
}

const COLOR_CAPTURE = "#0F766E";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";
const MES_CORTO = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function SeccionCapturaPorPeriodo({
  detalle,
  categoriaEtiqueta,
  nombrePlanta,
  poiKw,
}: Props) {
  const series = useMemo(() => {
    const acum = new Array<number>(12).fill(0);
    for (const e of detalle) {
      const mes = e.timestamp.getMonth();
      acum[mes] = (acum[mes] ?? 0) + e.cargado_kwh / 1000;
    }
    return acum;
  }, [detalle]);

  const sinCaptura = series.every((v) => v < 0.05);

  const data = {
    labels: MES_CORTO,
    datasets: [
      {
        label: "Captura mensual",
        data: series,
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
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            {COPY_SFV_BESS.charts.capturaTitulo}
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            {COPY_SFV_BESS.charts.capturaSubtitulo}
          </p>
        </div>
        <span className="text-[11px] text-[var(--color-text-tertiary)]">
          {COPY_SFV_BESS.charts.capturaUnidad}
        </span>
      </header>
      {sinCaptura ? (
        <HallazgoEjecutivo
          titulo={`Sin captura mensual bajo "${categoriaEtiqueta}"`}
          parrafos={[
            `El SFV de ${nombrePlanta} no produce energía capturable por el BESS bajo esta categoría: opera por debajo del techo POI de ${FORMATO_ENTERO.format(poiKw)} kW durante todo el año.`,
            "Selecciona otra categoría en el bloque inferior para evaluar otros casos de uso.",
          ]}
        />
      ) : (
        <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
          <div className="relative h-[240px] w-full">
            <Bar data={data} options={options} />
          </div>
        </div>
      )}
    </section>
  );
}
