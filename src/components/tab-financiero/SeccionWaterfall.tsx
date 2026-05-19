import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

interface Props {
  ingreso_sfv_base_mxn: number;
  ingreso_captura_excedentes_mxn: number;
  ingreso_arbitraje_mxn: number;
  ingreso_potencia_firme_mxn: number;
  ingreso_cels_mxn: number;
  opex_mxn: number;
}

const COLOR_BASE = "#525252";
const COLOR_POSITIVO = "#0F766E";
const COLOR_NEGATIVO = "#B91C1C";
const COLOR_TOTAL = "#1F2937";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FMT_MXN_M = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function fmtMillones(v: number): string {
  return `${FMT_MXN_M.format(v / 1_000_000)} M`;
}

export function SeccionWaterfall({
  ingreso_sfv_base_mxn,
  ingreso_captura_excedentes_mxn,
  ingreso_arbitraje_mxn,
  ingreso_potencia_firme_mxn,
  ingreso_cels_mxn,
  opex_mxn,
}: Props) {
  const { labels, valores, colores, bases } = useMemo(() => {
    const componentes: { label: string; delta: number; color: string }[] = [
      { label: "SFV base", delta: ingreso_sfv_base_mxn, color: COLOR_BASE },
      { label: "+ Captura BESS", delta: ingreso_captura_excedentes_mxn, color: COLOR_POSITIVO },
      { label: "+ Arbitraje", delta: ingreso_arbitraje_mxn, color: COLOR_POSITIVO },
      { label: "+ Potencia firme", delta: ingreso_potencia_firme_mxn, color: COLOR_POSITIVO },
      { label: "+ CELs", delta: ingreso_cels_mxn, color: COLOR_POSITIVO },
      { label: "− OPEX", delta: -opex_mxn, color: COLOR_NEGATIVO },
    ];
    const total =
      ingreso_sfv_base_mxn +
      ingreso_captura_excedentes_mxn +
      ingreso_arbitraje_mxn +
      ingreso_potencia_firme_mxn +
      ingreso_cels_mxn -
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
    labels.push("= SFV + BESS");
    bases.push(0);
    valores.push(total);
    colores.push(COLOR_TOTAL);
    return { labels, valores, bases, colores };
  }, [
    ingreso_sfv_base_mxn,
    ingreso_captura_excedentes_mxn,
    ingreso_arbitraje_mxn,
    ingreso_potencia_firme_mxn,
    ingreso_cels_mxn,
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
        ticks: { color: "#737373", font: { size: 11 } },
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
          Anatomía del ingreso del año 1
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Componentes que suman al ingreso bruto del SFV+BESS partiendo de
          la línea base SFV solo. La columna final es el ingreso neto
          después de OPEX BESS.
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="relative h-[300px] w-full">
          <Bar data={data} options={options} />
        </div>
      </div>
    </section>
  );
}
