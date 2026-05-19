import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

interface Props {
  ingreso_ppa_sfv_mxn: number;
  ingreso_cels_sfv_mxn: number;
  ingreso_captura_excedentes_mxn: number;
  ingreso_arbitraje_mxn: number;
  ingreso_potencia_firme_mxn: number;
}

const COLOR_PPA = "#9CA3AF";
const COLOR_CELS = "#A8A29E";
const COLOR_CAPTURA = "#22C55E";
const COLOR_ARB = "#3B82F6";
const COLOR_PFIRME = "#7C3AED";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FMT_MXN = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

export function SeccionBreakdownIngresos({
  ingreso_ppa_sfv_mxn,
  ingreso_cels_sfv_mxn,
  ingreso_captura_excedentes_mxn,
  ingreso_arbitraje_mxn,
  ingreso_potencia_firme_mxn,
}: Props) {
  const sfv = useMemo(
    () => [
      { label: "PPA SFV existente", valor: ingreso_ppa_sfv_mxn, color: COLOR_PPA },
      { label: "CELs SFV", valor: ingreso_cels_sfv_mxn, color: COLOR_CELS },
    ],
    [ingreso_ppa_sfv_mxn, ingreso_cels_sfv_mxn]
  );

  const bess = useMemo(
    () => [
      { label: "Captura excedentes", valor: ingreso_captura_excedentes_mxn, color: COLOR_CAPTURA },
      { label: "Arbitraje hora-punta", valor: ingreso_arbitraje_mxn, color: COLOR_ARB },
      { label: "Potencia firme proxy", valor: ingreso_potencia_firme_mxn, color: COLOR_PFIRME },
    ],
    [
      ingreso_captura_excedentes_mxn,
      ingreso_arbitraje_mxn,
      ingreso_potencia_firme_mxn,
    ]
  );

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
          Arriba: ingreso del SFV existente, ya recibido sin BESS. Abajo: el
          aporte incremental del BESS, lo único que paga el CAPEX BESS.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Panel
          titulo="Ingreso SFV existente"
          subtitulo="Contexto narrativo · no paga CAPEX BESS"
          variante="gris"
          componentes={sfv}
        />
        <Panel
          titulo="Aporte incremental BESS"
          subtitulo="Paga el CAPEX BESS"
          variante="verde"
          componentes={bess}
        />
      </div>
    </section>
  );
}

function Panel({
  titulo,
  subtitulo,
  variante,
  componentes,
}: {
  titulo: string;
  subtitulo: string;
  variante: "gris" | "verde";
  componentes: readonly { label: string; valor: number; color: string }[];
}) {
  const total = componentes.reduce((s, c) => s + c.valor, 0);
  const fondoHeader =
    variante === "verde"
      ? "bg-[#0F766E] text-white"
      : "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]";

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
          font: { size: 10 },
          callback: (v) => `${(Number(v) / 1_000_000).toFixed(2)} M`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: "#525252", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
      <div className={`px-4 py-3 ${fondoHeader}`}>
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[14px] font-medium leading-tight">{titulo}</p>
            <p className="text-[11px] opacity-90">{subtitulo}</p>
          </div>
          <p className="text-[14px] font-semibold tabular-nums">
            {(total / 1_000_000).toFixed(2)} M
          </p>
        </div>
      </div>
      <div className="p-5">
        <div className="relative h-[180px] w-full">
          <Bar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
