import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

interface Props {
  ingreso_energia_ppa_mxn: number;
  ingreso_captura_excedentes_mxn: number;
  ingreso_arbitraje_mxn: number;
  ingreso_potencia_firme_mxn: number;
  ingreso_cels_mxn: number;
}

const COLOR_PPA = "#0F766E";
const COLOR_CAPTURA = "#22C55E";
const COLOR_ARB = "#3B82F6";
const COLOR_PFIRME = "#7C3AED";
const COLOR_CELS = "#B45309";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FMT_MXN = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function SeccionBreakdownIngresos({
  ingreso_energia_ppa_mxn,
  ingreso_captura_excedentes_mxn,
  ingreso_arbitraje_mxn,
  ingreso_potencia_firme_mxn,
  ingreso_cels_mxn,
}: Props) {
  const componentes = useMemo(
    () => [
      { label: "Energía PPA (generación SFV)", valor: ingreso_energia_ppa_mxn, color: COLOR_PPA },
      { label: "Captura BESS", valor: ingreso_captura_excedentes_mxn, color: COLOR_CAPTURA },
      { label: "Arbitraje hora-punta", valor: ingreso_arbitraje_mxn, color: COLOR_ARB },
      { label: "Potencia firme proxy", valor: ingreso_potencia_firme_mxn, color: COLOR_PFIRME },
      { label: "CELs", valor: ingreso_cels_mxn, color: COLOR_CELS },
    ],
    [
      ingreso_energia_ppa_mxn,
      ingreso_captura_excedentes_mxn,
      ingreso_arbitraje_mxn,
      ingreso_potencia_firme_mxn,
      ingreso_cels_mxn,
    ]
  );

  const total = componentes.reduce((s, c) => s + c.valor, 0);

  const data = {
    labels: componentes.map((c) => c.label),
    datasets: [
      {
        label: "MXN",
        data: componentes.map((c) => c.valor),
        backgroundColor: componentes.map((c) => c.color),
        borderRadius: 3,
        borderSkipped: false as const,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = (ctx.parsed.x as number) ?? 0;
            const pct = total > 0 ? (v / total) * 100 : 0;
            return `${FMT_MXN.format(v)} MXN · ${FMT_PCT.format(pct)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (v) => `${(Number(v) / 1_000_000).toFixed(1)} M`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#525252", font: { size: 12 } },
      },
    },
  };

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Desglose del ingreso año 1
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          De dónde viene cada peso del año 1
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Composición del ingreso bruto del proyecto SFV + BESS en su
          primer año de operación, antes de OPEX.
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="relative h-[280px] w-full">
          <Bar data={data} options={options} />
        </div>
      </div>
    </section>
  );
}
