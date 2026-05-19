import { useMemo } from "react";
import type { ChartOptions, Plugin } from "chart.js";
import { Line } from "react-chartjs-2";

import type { FlujoAnual } from "@/lib/tab-financiero/calculos";

interface Props {
  flujos_base: readonly FlujoAnual[];
  curva_soh: readonly number[];
  payback: number | null;
}

// Verde apilado de fondo a frente: oscuro = base estructural, claro = oportunista.
const COLOR_PFIRME = "#047857";
const COLOR_ARBITRAJE = "#34D399";
const COLOR_CAPTURA = "#6EE7B7";
// Naranja del SOH, idéntico al de la sección Erosión SOH (consistencia visual).
const COLOR_SOH = "#B45309";
// Teal del payback, idéntico al borde del KPI canónico del Hero.
const COLOR_PAYBACK = "#0F766E";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FMT_M = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 3,
});
const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function fmtMillones(v: number): string {
  return `$${FMT_M.format(v / 1_000_000)} M MXN`;
}

function fmtMillonesEje(v: number): string {
  return `${(v / 1_000_000).toFixed(1)}M`;
}

/**
 * Plugin inline Chart.js para dibujar la línea vertical de payback
 * directamente sobre el canvas (sin chartjs-plugin-annotation, que no
 * está instalado). Lee `payback` desde options.plugins.paybackLine.
 */
const paybackLinePlugin: Plugin<"line"> = {
  id: "paybackLine",
  afterDatasetsDraw(chart, _args, opts: { payback?: number | null }) {
    const payback = opts?.payback;
    if (payback == null) return;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    if (!xScale || !yScale) return;
    // Eje X categórico Año 1..Año 20: índice = round(payback) - 1.
    const idx = Math.round(payback) - 1;
    if (idx < 0 || idx > 19) return;
    const x = xScale.getPixelForValue(idx);
    const ctx = chart.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = COLOR_PAYBACK;
    ctx.moveTo(x, yScale.top);
    ctx.lineTo(x, yScale.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    // Label arriba.
    ctx.font = "600 12px Inter, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillStyle = COLOR_PAYBACK;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `payback ≈ ${payback.toFixed(1)} años`,
      x,
      yScale.top - 6
    );
    ctx.restore();
  },
};

export function SeccionEvolucionEconomica({
  flujos_base,
  curva_soh,
  payback,
}: Props) {
  const datos = useMemo(() => {
    // Año 1 al Año 20 (omitimos índice 0: aporte año 0 = 0, generaría
    // lectura errónea).
    const labels: string[] = [];
    const pfirme: number[] = [];
    const arbitraje: number[] = [];
    const captura: number[] = [];
    const soh: number[] = [];
    for (let i = 1; i <= 20; i += 1) {
      const f = flujos_base[i];
      if (!f) continue;
      labels.push(`Año ${i}`);
      pfirme.push(f.ingreso_potencia_firme_mxn);
      arbitraje.push(f.ingreso_arbitraje_mxn);
      captura.push(f.ingreso_captura_excedentes_mxn);
      soh.push(((curva_soh[i] as number) ?? 0) * 100);
    }
    return { labels, pfirme, arbitraje, captura, soh };
  }, [flujos_base, curva_soh]);

  const data = {
    labels: datos.labels,
    datasets: [
      {
        label: "Potencia firme proxy",
        data: datos.pfirme,
        backgroundColor: `${COLOR_PFIRME}cc`, // 80% alpha
        borderColor: COLOR_PFIRME,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: "origin" as const,
        tension: 0.15,
        yAxisID: "y",
        stack: "aporte",
        order: 3,
      },
      {
        label: "Arbitraje horario",
        data: datos.arbitraje,
        backgroundColor: `${COLOR_ARBITRAJE}cc`,
        borderColor: COLOR_ARBITRAJE,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: "-1" as const, // hacia el dataset anterior (pfirme)
        tension: 0.15,
        yAxisID: "y",
        stack: "aporte",
        order: 2,
      },
      {
        label: "Captura de excedentes",
        data: datos.captura,
        backgroundColor: `${COLOR_CAPTURA}cc`,
        borderColor: COLOR_CAPTURA,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: "-1" as const, // hacia arbitraje
        tension: 0.15,
        yAxisID: "y",
        stack: "aporte",
        order: 1,
      },
      {
        label: "SOH (%)",
        data: datos.soh,
        borderColor: COLOR_SOH,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
        tension: 0.15,
        yAxisID: "y1",
        order: 0,
      },
    ],
  };

  // Max del aporte año 1 = base del eje primario (cap superior).
  const aporteMaxAnio1 = useMemo(() => {
    const f1 = flujos_base[1];
    return f1 ? f1.ingreso_incremental_bess_mxn : 0;
  }, [flujos_base]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // leyenda custom arriba del gráfico
      tooltip: {
        callbacks: {
          title: (items) => items[0]?.label ?? "",
          label: () => "", // suprimimos labels default
          afterBody: (items) => {
            if (items.length === 0) return [];
            const i = items[0]!.dataIndex;
            const p = datos.pfirme[i] ?? 0;
            const a = datos.arbitraje[i] ?? 0;
            const c = datos.captura[i] ?? 0;
            const total = p + a + c;
            const sohVal = datos.soh[i] ?? 0;
            return [
              `Aporte BESS total:    ${fmtMillones(total)}`,
              "",
              `  Potencia firme proxy:  ${fmtMillones(p)}`,
              `  Arbitraje horario:     ${fmtMillones(a)}`,
              `  Captura excedentes:    ${fmtMillones(c)}`,
              "",
              `SOH aplicado:            ${FMT_PCT.format(sohVal)}%`,
            ];
          },
        },
        displayColors: false,
        bodyFont: { family: "monospace", size: 11 },
        titleFont: { weight: "bold" as const, size: 12 },
      },
      // @ts-expect-error opciones del plugin custom inline
      paybackLine: { payback },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#737373",
          font: { size: 10 },
          maxRotation: 0,
          autoSkipPadding: 12,
        },
      },
      y: {
        type: "linear" as const,
        position: "left" as const,
        beginAtZero: true,
        suggestedMax: aporteMaxAnio1 > 0 ? aporteMaxAnio1 * 1.05 : undefined,
        stacked: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (v) => fmtMillonesEje(Number(v)),
        },
        title: {
          display: true,
          text: "Aporte BESS anual (MXN)",
          color: "#525252",
          font: { size: 11 },
        },
      },
      y1: {
        type: "linear" as const,
        position: "right" as const,
        min: 60,
        max: 100,
        grid: { display: false },
        ticks: {
          color: COLOR_SOH,
          font: { size: 11 },
          callback: (v) => `${Number(v).toFixed(0)}%`,
        },
        title: {
          display: true,
          text: "SOH (%)",
          color: COLOR_SOH,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Evolución económica
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Aporte incremental BESS · 20 años con SOH
        </h2>
        <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
          Las áreas apiladas son el aporte anual del BESS descompuesto en
          sus tres fuentes: potencia firme proxy (base estructural),
          arbitraje horario (optimización operativa) y captura de
          excedentes (recuperación oportunista). La línea descendente es
          el SOH del catálogo Hyperstrong que erosiona el aporte año a
          año. La línea vertical marca el año del payback.
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda color={COLOR_PFIRME} texto="Potencia firme proxy" />
          <Leyenda color={COLOR_ARBITRAJE} texto="Arbitraje horario" />
          <Leyenda color={COLOR_CAPTURA} texto="Captura de excedentes" />
          <Leyenda color={COLOR_SOH} dashed texto="SOH (%)" />
        </div>
        <div className="relative h-[340px] w-full">
          <Line
            data={data}
            options={options}
            plugins={[paybackLinePlugin]}
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
