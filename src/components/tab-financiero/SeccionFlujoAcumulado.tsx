import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import type { FlujoAnual } from "@/lib/tab-financiero/calculos";

interface Props {
  flujos_sfv_bess: readonly FlujoAnual[];
  /** Ingreso anual SFV solo año 1 (no degrada en modelo simplificado). */
  ingreso_sfv_solo_anio: number;
  capex_mxn: number;
  payback: number | null;
}

const COLOR_BESS = "#0F766E";
const COLOR_SFV = "#B45309";
const COLOR_CAPEX = "#737373";
const COLOR_PAYBACK = "#DC2626";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";
const COLOR_ZERO = "rgba(0, 0, 0, 0.30)";

const FMT_MXN_M = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function fmtMillones(v: number): string {
  return `${FMT_MXN_M.format(v / 1_000_000)} M`;
}

export function SeccionFlujoAcumulado({
  flujos_sfv_bess,
  ingreso_sfv_solo_anio,
  capex_mxn,
  payback,
}: Props) {
  const { labels, acumSfvBess, acumSfvSolo, capexLine } = useMemo(() => {
    const labels = flujos_sfv_bess.map((f) => `Año ${f.anio}`);
    const acumSfvBess = flujos_sfv_bess.map((f) => f.flujo_acumulado_mxn);
    // SFV solo: año 0 = 0 (sin CAPEX), año i = i × ingreso_anual.
    const acumSfvSolo = flujos_sfv_bess.map((f) =>
      f.anio === 0 ? 0 : ingreso_sfv_solo_anio * f.anio
    );
    const capexLine = flujos_sfv_bess.map(() => -capex_mxn);
    return { labels, acumSfvBess, acumSfvSolo, capexLine };
  }, [flujos_sfv_bess, ingreso_sfv_solo_anio, capex_mxn]);

  // Marcador del payback: punto destacado en el año más cercano sobre la
  // curva del BESS (visualmente apoya el KPI, sin truco de nulls).
  const paybackMarkerData = useMemo(() => {
    if (payback === null) return null;
    const idx = Math.round(payback);
    if (idx < 0 || idx >= flujos_sfv_bess.length) return null;
    return {
      idx,
      valor: flujos_sfv_bess[idx]!.flujo_acumulado_mxn,
    };
  }, [flujos_sfv_bess, payback]);

  const data = {
    labels,
    datasets: [
      {
        label: "SFV + BESS · flujo acumulado",
        data: acumSfvBess,
        borderColor: COLOR_BESS,
        backgroundColor: "rgba(15, 118, 110, 0.10)",
        borderWidth: 2.5,
        pointRadius: acumSfvBess.map((_, i) =>
          paybackMarkerData && i === paybackMarkerData.idx ? 6 : 0
        ),
        pointBackgroundColor: acumSfvBess.map((_, i) =>
          paybackMarkerData && i === paybackMarkerData.idx
            ? COLOR_PAYBACK
            : COLOR_BESS
        ),
        pointHoverRadius: 5,
        fill: true,
        tension: 0.15,
        order: 1,
      },
      {
        label: "SFV solo · acumulado (referencia)",
        data: acumSfvSolo,
        borderColor: COLOR_SFV,
        borderDash: [2, 2],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.15,
        order: 2,
      },
      {
        label: "− CAPEX",
        data: capexLine,
        borderColor: COLOR_CAPEX,
        borderDash: [6, 4],
        borderWidth: 1,
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 3,
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
            `${ctx.dataset.label}: ${fmtMillones((ctx.parsed.y as number) ?? 0)}`,
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
        Flujo acumulado
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Flujo acumulado 20 años con SOH aplicado
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Acumulado anual del SFV + BESS frente al SFV solo. La curva del
          BESS aplica el factor SOH del catálogo año por año. El cruce de
          cero coincide por construcción con el KPI de payback.
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda color={COLOR_BESS} texto="SFV + BESS · acumulado" />
          <Leyenda color={COLOR_SFV} dashed texto="SFV solo · acumulado" />
          <Leyenda color={COLOR_CAPEX} dashed texto="−CAPEX (línea base año 0)" />
          {payback !== null ? (
            <Leyenda
              color={COLOR_PAYBACK}
              texto={`Payback ≈ ${payback.toFixed(1)} años`}
            />
          ) : null}
        </div>
        <div className="relative h-[320px] w-full">
          <Line
            data={data}
            options={{
              ...options,
              scales: {
                ...options.scales,
                y: {
                  ...options.scales!.y,
                  // Línea de cero visible.
                  grid: {
                    ...(options.scales!.y as { grid?: object }).grid,
                    color: (ctx) =>
                      ctx.tick.value === 0 ? COLOR_ZERO : COLOR_GRID,
                  },
                },
              },
            }}
          />
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
