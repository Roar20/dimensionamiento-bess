import { useMemo } from "react";
import type { ChartData, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import { prepararDatosCurva } from "@/lib/tab-sfv-bess/curva-captura-capacidad";
import type { ResultadoBarridoConfiguraciones } from "@/lib/core/bess/barrido-configuraciones";

interface Props {
  resultado: ResultadoBarridoConfiguraciones;
}

const COLOR_EVALUADA = "rgba(115, 115, 115, 0.45)";
const COLOR_EVALUADA_BORDER = "rgba(115, 115, 115, 0.7)";
const COLOR_FRENTE = "#1e40af";
const COLOR_FRENTE_BORDER = "#1e40af";
const COLOR_CODO_BORDER = "#0f172a";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

export function CurvaCapturaCapacidad({ resultado }: Props) {
  const datos = useMemo(() => prepararDatosCurva(resultado), [resultado]);
  const copy = COPY_SFV_BESS.comparacionConfiguraciones.curva;

  const { data, options } = useMemo(() => {
    const tieneCodo = datos.codo !== null;

    const datasets: NonNullable<ChartData<"line">["datasets"]> = [
      // Dataset 1: evaluadas (scatter neutro, sin línea).
      {
        label: copy.leyendaEvaluadas,
        data: datos.evaluadas.map((p) => ({ x: p.x, y: p.y })),
        backgroundColor: COLOR_EVALUADA,
        borderColor: COLOR_EVALUADA_BORDER,
        pointRadius: 3,
        pointHoverRadius: 5,
        showLine: false,
      },
      // Dataset 2: frente Pareto (línea + puntos, ordenado por x).
      {
        label: copy.leyendaFrente,
        data: datos.frente.map((p) => ({ x: p.x, y: p.y })),
        backgroundColor: COLOR_FRENTE,
        borderColor: COLOR_FRENTE_BORDER,
        borderWidth: 1.5,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0,
        showLine: true,
      },
    ];

    if (tieneCodo) {
      datasets.push({
        label: copy.leyendaCodo,
        data: [{ x: datos.codo!.x, y: datos.codo!.y }],
        backgroundColor: "transparent",
        borderColor: COLOR_CODO_BORDER,
        borderWidth: 1.5,
        pointRadius: 7,
        pointHoverRadius: 8,
        pointStyle: "rectRot",
        showLine: false,
      });
    }

    const data: ChartData<"line"> = { datasets };

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              // Recupera la config detrás del punto.
              const i = ctx.dataIndex;
              const label = ctx.dataset.label ?? "";
              let punto:
                | { x: number; y: number; config?: { config: { p_kw: number; e_kwh: number }; estrategia: string } }
                | undefined;
              if (label === copy.leyendaEvaluadas) {
                punto = datos.evaluadas[i];
              } else if (label === copy.leyendaFrente) {
                punto = datos.frente[i];
              } else if (label === copy.leyendaCodo && datos.codo) {
                punto = datos.codo;
              }
              if (!punto || !punto.config) {
                const y = ctx.parsed.y ?? 0;
                return `${Math.round(y).toLocaleString("es-MX")}%`;
              }
              const { p_kw, e_kwh } = punto.config.config;
              const horas = e_kwh / p_kw;
              const estrategia =
                punto.config.estrategia === "greedy"
                  ? COPY_SFV_BESS.estrategias.greedy
                  : COPY_SFV_BESS.estrategias.arbitraje;
              return `${p_kw} kW × ${horas} h · ${estrategia} · ${punto.y.toFixed(1)}%`;
            },
          },
        },
      },
      interaction: { mode: "nearest", intersect: true },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: copy.ejeX,
            color: "#737373",
            font: { size: 11 },
          },
          grid: { color: COLOR_GRID },
          ticks: {
            color: "#737373",
            font: { size: 11 },
            callback: (v) => Number(v).toLocaleString("es-MX"),
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: copy.ejeY,
            color: "#737373",
            font: { size: 11 },
          },
          grid: { color: COLOR_GRID },
          ticks: {
            color: "#737373",
            font: { size: 11 },
            callback: (v) => `${Number(v).toLocaleString("es-MX")}`,
          },
        },
      },
    };

    return { data, options };
  }, [datos, copy]);

  const tieneCodo = datos.codo !== null;

  return (
    <div
      data-testid="curva-captura-capacidad"
      className="mb-4 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5"
    >
      <header className="mb-3">
        <h3 className="text-[14px] font-medium text-[var(--color-text-primary)]">
          {copy.tituloPanel}
        </h3>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          {copy.subtituloPanel}
        </p>
      </header>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-[var(--color-text-secondary)]">
        <Leyenda color={COLOR_EVALUADA_BORDER} texto={copy.leyendaEvaluadas} />
        <Leyenda color={COLOR_FRENTE_BORDER} texto={copy.leyendaFrente} />
        {tieneCodo && (
          <Leyenda
            color={COLOR_CODO_BORDER}
            texto={copy.leyendaCodo}
            style="outline"
            testid="leyenda-codo"
          />
        )}
      </div>
      <div className="relative h-[190px] w-full md:h-[220px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

function Leyenda({
  color,
  texto,
  style = "solid",
  testid,
}: {
  color: string;
  texto: string;
  style?: "solid" | "outline";
  testid?: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      data-testid={testid}
    >
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={
          style === "outline"
            ? { borderColor: color, borderWidth: 1.5, borderStyle: "solid" }
            : { backgroundColor: color }
        }
      />
      {texto}
    </span>
  );
}
