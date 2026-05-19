import { useMemo } from "react";
import type { ChartOptions, Plugin } from "chart.js";
import { Bar } from "react-chartjs-2";

import { formatoCompacto, formatoEje } from "@/lib/tab-financiero/formato-monetario";

interface Props {
  ingreso_captura_excedentes_mxn: number;
  ingreso_arbitraje_mxn: number;
  ingreso_potencia_firme_mxn: number;
  opex_mxn: number;
}

const COLOR_BESS_POSITIVO = "#0F766E"; // verde teal: aporte BESS
const COLOR_NEGATIVO = "#B91C1C";
const COLOR_TOTAL_BESS = "#065F46";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";
const COLOR_LABEL_BARRA = "#1F2937";

/**
 * Tipos de label arriba de cada barra del waterfall.
 *  - aporte:   "+$XXk"   (signo + delante)
 *  - egreso:   "−$XXk"   (signo − ya viene del helper)
 *  - resultado: "$XXk"   (sin signo, es total neto)
 */
type TipoLabel = "aporte" | "egreso" | "resultado";

function labelMonto(tipo: TipoLabel, valor: number): string {
  const fmt = formatoCompacto(valor);
  if (tipo === "aporte") return `+${fmt}`;
  return fmt;
}

export function SeccionWaterfall({
  ingreso_captura_excedentes_mxn,
  ingreso_arbitraje_mxn,
  ingreso_potencia_firme_mxn,
  opex_mxn,
}: Props) {
  const { labels, valores, colores, bases, tiposLabel, montosOriginales } = useMemo(() => {
    // Solo bloque incremental BESS: el waterfall responde exclusivamente
    // a "qué paga el CAPEX BESS". PPA SFV y CELs SFV son contexto que
    // vive en la comparativa SFV vs SFV+BESS y la tabla anual.
    const componentes: {
      label: string;
      delta: number;
      color: string;
      tipo: TipoLabel;
    }[] = [
      { label: "+ Captura BESS", delta: ingreso_captura_excedentes_mxn, color: COLOR_BESS_POSITIVO, tipo: "aporte" },
      { label: "+ Arbitraje", delta: ingreso_arbitraje_mxn, color: COLOR_BESS_POSITIVO, tipo: "aporte" },
      { label: "+ Pfirme proxy⚑", delta: ingreso_potencia_firme_mxn, color: COLOR_BESS_POSITIVO, tipo: "aporte" },
      { label: "− OPEX BESS", delta: -opex_mxn, color: COLOR_NEGATIVO, tipo: "egreso" },
    ];
    const total_incremental_bess =
      ingreso_captura_excedentes_mxn +
      ingreso_arbitraje_mxn +
      ingreso_potencia_firme_mxn -
      opex_mxn;

    const labels: string[] = [];
    const valores: number[] = [];
    const bases: number[] = [];
    const colores: string[] = [];
    const tiposLabel: TipoLabel[] = [];
    const montosOriginales: number[] = [];
    let acum = 0;
    for (const c of componentes) {
      labels.push(c.label);
      colores.push(c.color);
      tiposLabel.push(c.tipo);
      montosOriginales.push(c.delta);
      if (c.delta >= 0) {
        bases.push(acum);
        valores.push(c.delta);
      } else {
        bases.push(acum + c.delta);
        valores.push(-c.delta);
      }
      acum += c.delta;
    }
    // Total INCREMENTAL BESS (verde oscuro destacado) — el que paga el CAPEX.
    // Se omite intencionalmente la barra "Proyecto total"; el gráfico tiene
    // como único objetivo explicar qué paga el CAPEX BESS.
    labels.push("= Aporte BESS");
    bases.push(0);
    valores.push(total_incremental_bess);
    colores.push(COLOR_TOTAL_BESS);
    tiposLabel.push("resultado");
    montosOriginales.push(total_incremental_bess);
    return { labels, valores, bases, colores, tiposLabel, montosOriginales };
  }, [
    ingreso_captura_excedentes_mxn,
    ingreso_arbitraje_mxn,
    ingreso_potencia_firme_mxn,
    opex_mxn,
  ]);

  const data = {
    labels,
    datasets: [
      {
        label: "Base offset",
        data: bases,
        backgroundColor: "transparent",
        borderColor: "transparent",
        stack: "wf",
      },
      {
        label: "Valor",
        data: valores,
        backgroundColor: colores,
        borderRadius: 3,
        borderSkipped: false as const,
        stack: "wf",
      },
    ],
  };

  /**
   * Plugin inline para dibujar el label monetario arriba de cada barra
   * del waterfall. Usa `meta.data[i]` (los rect elements ya posicionados)
   * para conocer las coordenadas reales de la barra y dibujar el texto
   * 4px sobre el extremo superior visual de cada barra. La barra de
   * OPEX (negativa) tiene su base por encima del extremo superior — el
   * extremo superior visible es `b.base` en ese caso; afortunadamente
   * Chart.js expone `getCenterPoint()` y propiedades `y` / `base` que
   * nos permiten calcular el top visual correctamente sin importar el
   * signo.
   */
  const labelsBarrasPlugin: Plugin<"bar"> = {
    id: "labelsBarras",
    afterDatasetsDraw(chart) {
      const ctx = chart.ctx;
      // El dataset visible es el de "Valor" (índice 1; el 0 es el
      // offset transparente del waterfall).
      const meta = chart.getDatasetMeta(1);
      if (!meta || !meta.data) return;
      ctx.save();
      ctx.font =
        "600 11px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = COLOR_LABEL_BARRA;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      meta.data.forEach((bar, i) => {
        const props = bar.getProps(["x", "y", "base"], true) as {
          x: number;
          y: number;
          base: number;
        };
        // top visual = min(y, base) cubre barras positivas y negativas
        // (la base puede estar arriba en barras que cuelgan hacia abajo
        // por el stacking del waterfall).
        const yTop = Math.min(props.y, props.base);
        const xCenter = props.x;
        const tipo = tiposLabel[i] ?? "aporte";
        const monto = montosOriginales[i] ?? 0;
        ctx.fillText(labelMonto(tipo, monto), xCenter, yTop - 4);
      });
      ctx.restore();
    },
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    // Padding superior para que los labels de las barras no se
    // clippeen contra el borde superior del chartArea.
    layout: { padding: { top: 20 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item) => item.dataset.label !== "Base offset",
        callbacks: {
          label: (ctx) => formatoCompacto((ctx.parsed.y as number) ?? 0),
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 10 } },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (v) => formatoEje(Number(v)),
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Flujo año 1
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Qué paga el CAPEX del BESS · año 1
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          El waterfall muestra únicamente el flujo incremental
          atribuible al BESS. El PPA y los CELs del SFV existente son
          contexto, pero no pagan el CAPEX BESS.
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda color={COLOR_BESS_POSITIVO} texto="Aporte BESS" />
          <Leyenda color={COLOR_NEGATIVO} texto="OPEX BESS" />
          <Leyenda color={COLOR_TOTAL_BESS} texto="Aporte BESS neto" />
          <span className="text-[11px] text-[#7F1D1D]">
            ⚑ proxy conservador preliminar
          </span>
        </div>
        <div className="relative h-[320px] w-full">
          <Bar data={data} options={options} plugins={[labelsBarrasPlugin]} />
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
