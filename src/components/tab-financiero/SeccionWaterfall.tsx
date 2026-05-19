import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

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

const FMT_M = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function fmtMillones(v: number): string {
  return `${FMT_M.format(v / 1_000_000)} M`;
}

export function SeccionWaterfall({
  ingreso_captura_excedentes_mxn,
  ingreso_arbitraje_mxn,
  ingreso_potencia_firme_mxn,
  opex_mxn,
}: Props) {
  const { labels, valores, colores, bases } = useMemo(() => {
    // Solo bloque incremental BESS: el waterfall responde exclusivamente
    // a "qué paga el CAPEX BESS". PPA SFV y CELs SFV son contexto que
    // vive en la comparativa SFV vs SFV+BESS y la tabla anual.
    const componentes: { label: string; delta: number; color: string }[] = [
      { label: "+ Captura BESS", delta: ingreso_captura_excedentes_mxn, color: COLOR_BESS_POSITIVO },
      { label: "+ Arbitraje", delta: ingreso_arbitraje_mxn, color: COLOR_BESS_POSITIVO },
      { label: "+ Pfirme proxy⚑", delta: ingreso_potencia_firme_mxn, color: COLOR_BESS_POSITIVO },
      { label: "− OPEX BESS", delta: -opex_mxn, color: COLOR_NEGATIVO },
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
    let acum = 0;
    for (const c of componentes) {
      labels.push(c.label);
      colores.push(c.color);
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
    return { labels, valores, bases, colores };
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

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item) => item.dataset.label !== "Base offset",
        callbacks: {
          label: (ctx) => fmtMillones((ctx.parsed.y as number) ?? 0),
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
          callback: (v) => fmtMillones(Number(v)),
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
          <Bar data={data} options={options} />
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
