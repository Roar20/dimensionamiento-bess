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
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

/**
 * Tolerancia para detectar convergencia entre estrategias en un mismo
 * punto (x,y). El motor escribe `fraccion_capturada` como float; dos
 * estrategias pueden coincidir hasta varios decimales sin ser idénticas.
 */
const EPS_CONVERGENCIA = 1e-6;

export function CurvaCapturaCapacidad({ resultado }: Props) {
  const datos = useMemo(() => prepararDatosCurva(resultado), [resultado]);
  const copy = COPY_SFV_BESS.comparacionConfiguraciones.curva;
  const copyEstrategias = COPY_SFV_BESS.estrategias;

  const { data, options } = useMemo(() => {
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
      // Codo: NO se renderiza marker hasta que se defina la regla de
      // significancia de curvatura (D-MOTOR-02). El cálculo en el motor
      // sigue intacto; solo se oculta su marker en esta vista.
    ];

    const data: ChartData<"line"> = { datasets };

    /** Detecta si otra evaluada coincide en (p_kw, e_kwh, y) con distinta estrategia. */
    function convergenEvaluadas(i: number): boolean {
      const p = datos.evaluadas[i];
      if (!p) return false;
      return datos.evaluadas.some(
        (q, j) =>
          j !== i &&
          q.config.config.p_kw === p.config.config.p_kw &&
          q.config.config.e_kwh === p.config.config.e_kwh &&
          q.config.estrategia !== p.config.estrategia &&
          Math.abs(q.y - p.y) < EPS_CONVERGENCIA
      );
    }

    function convergenFrente(i: number): boolean {
      const p = datos.frente[i];
      if (!p) return false;
      return datos.frente.some(
        (q, j) =>
          j !== i &&
          q.config.config.p_kw === p.config.config.p_kw &&
          q.config.config.e_kwh === p.config.config.e_kwh &&
          q.config.estrategia !== p.config.estrategia &&
          Math.abs(q.y - p.y) < EPS_CONVERGENCIA
      );
    }

    function formatearLabel(
      puntoY: number,
      p_kw: number,
      e_kwh: number,
      estrategia: "greedy" | "arbitraje",
      converge: boolean
    ): string {
      const horas = e_kwh / p_kw;
      const estrategiaTxt = converge
        ? copy.estrategiasAmbas
        : estrategia === "greedy"
          ? copyEstrategias.greedy
          : copyEstrategias.arbitraje;
      return `${p_kw} kW × ${horas} h · ${estrategiaTxt} · ${puntoY.toFixed(1)}%`;
    }

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          // Dedupe: cuando dos items del mismo dataset coinciden en (x,y)
          // (típicamente porque ambas estrategias convergen), mantenemos
          // sólo el primero.
          filter: (item, index, items) => {
            return (
              items.findIndex(
                (it) =>
                  it.datasetIndex === item.datasetIndex &&
                  it.parsed.x === item.parsed.x &&
                  it.parsed.y === item.parsed.y
              ) === index
            );
          },
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label ?? "";
              const i = ctx.dataIndex;
              if (label === copy.leyendaEvaluadas) {
                const p = datos.evaluadas[i];
                if (!p) {
                  const y = ctx.parsed.y ?? 0;
                  return `${Math.round(y).toLocaleString("es-MX")}%`;
                }
                return formatearLabel(
                  p.y,
                  p.config.config.p_kw,
                  p.config.config.e_kwh,
                  p.config.estrategia,
                  convergenEvaluadas(i)
                );
              }
              if (label === copy.leyendaFrente) {
                const p = datos.frente[i];
                if (!p) {
                  const y = ctx.parsed.y ?? 0;
                  return `${Math.round(y).toLocaleString("es-MX")}%`;
                }
                return formatearLabel(
                  p.y,
                  p.config.config.p_kw,
                  p.config.config.e_kwh,
                  p.config.estrategia,
                  convergenFrente(i)
                );
              }
              const y = ctx.parsed.y ?? 0;
              return `${Math.round(y).toLocaleString("es-MX")}%`;
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
  }, [datos, copy, copyEstrategias]);

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
      </div>
      <div className="relative h-[190px] w-full md:h-[220px]">
        <Line data={data} options={options} />
      </div>
    </div>
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
