import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import type { RegistroHorario } from "@/types/sfv";

interface Props {
  registros_ajustados: readonly RegistroHorario[];
  capacidad_poi_kw: number;
  capacidad_carga_bess_kw: number;
  factor_produccion: number;
}

const COLOR_GEN = "#B45309";
const COLOR_POI = "#525252";
const COLOR_CAPT = "rgba(34, 197, 94, 0.35)";
const COLOR_NO_CAPT = "rgba(220, 38, 38, 0.30)";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FMT_PCT = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function SeccionGeneracionFactor({
  registros_ajustados,
  capacidad_poi_kw,
  capacidad_carga_bess_kw,
  factor_produccion,
}: Props) {
  const { promedioPorHora, capturable, noCapturable, poiLine } =
    useMemo(() => {
      const sumas = new Array<number>(24).fill(0);
      const conteos = new Array<number>(24).fill(0);
      for (const r of registros_ajustados) {
        const h = r.timestamp.getHours();
        sumas[h] = (sumas[h] ?? 0) + r.potencia_kw_prom;
        conteos[h] = (conteos[h] ?? 0) + 1;
      }
      const promedioPorHora = sumas.map((s, h) =>
        (conteos[h] ?? 0) > 0 ? s / (conteos[h] as number) : 0
      );
      const capturable = promedioPorHora.map((kw) => {
        const exc = Math.max(0, kw - capacidad_poi_kw);
        return Math.min(exc, capacidad_carga_bess_kw);
      });
      const noCapturable = promedioPorHora.map((kw) => {
        const exc = Math.max(0, kw - capacidad_poi_kw);
        return Math.max(0, exc - capacidad_carga_bess_kw);
      });
      const poiLine = new Array<number>(24).fill(capacidad_poi_kw);
      return { promedioPorHora, capturable, noCapturable, poiLine };
    }, [registros_ajustados, capacidad_poi_kw, capacidad_carga_bess_kw]);

  const labels = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, "0")}:00`
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Generación promedio",
        data: promedioPorHora,
        borderColor: COLOR_GEN,
        backgroundColor: "rgba(180, 83, 9, 0.08)",
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.25,
        order: 1,
      },
      {
        label: "Capacidad POI",
        data: poiLine,
        borderColor: COLOR_POI,
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 2,
      },
      {
        label: "Excedente capturable BESS",
        data: capturable.map((cap) =>
          cap > 0 ? capacidad_poi_kw + cap : capacidad_poi_kw
        ),
        borderColor: "transparent",
        backgroundColor: COLOR_CAPT,
        pointRadius: 0,
        fill: { target: { value: capacidad_poi_kw }, above: COLOR_CAPT },
        tension: 0.25,
        order: 3,
      },
      {
        label: "Excedente NO capturable",
        data: noCapturable.map((nc, i) =>
          nc > 0
            ? capacidad_poi_kw + (capturable[i] ?? 0) + nc
            : capacidad_poi_kw + (capturable[i] ?? 0)
        ),
        borderColor: "transparent",
        backgroundColor: COLOR_NO_CAPT,
        pointRadius: 0,
        fill: "-1",
        tension: 0.25,
        order: 4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item) =>
          item.dataset.label !== "Excedente capturable BESS" &&
          item.dataset.label !== "Excedente NO capturable",
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${Math.round((ctx.parsed.y as number) ?? 0).toLocaleString("es-MX")} kW`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (v) => `${Number(v).toLocaleString("es-MX")} kW`,
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Sensibilidad operativa
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Generación bajo factor {FMT_PCT.format(factor_produccion * 100)}% vs capacidad POI
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Curva promedio diaria de generación con el factor del slider
          aplicado. La línea POI define el techo de inyección al PPA. La zona
          verde es el excedente que el BESS puede capturar (limitado por su
          potencia de carga); la zona roja es el excedente que excede la
          capacidad del BESS y se perdería por curtailment.{" "}
          <strong className="font-medium">
            El factor modela sensibilidad operativa del perfil
          </strong>{" "}
          (tracker alineado, strings limpios, condiciones óptimas); no
          modela ampliación de capacidad CFE ni overbuild adicional del SFV
          (Wave 1: SFV existente, sin modificar capacidad CFE).
        </p>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda color={COLOR_GEN} texto="Generación promedio" />
          <Leyenda color={COLOR_POI} dashed texto={`POI ${capacidad_poi_kw} kW`} />
          <Leyenda color="rgba(34, 197, 94, 0.85)" texto="Capturable BESS" />
          <Leyenda color="rgba(220, 38, 38, 0.85)" texto="No capturable" />
        </div>
        <div className="relative h-[280px] w-full">
          <Line data={data} options={options} />
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
