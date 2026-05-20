import { useMemo, useRef, useEffect } from "react";
import { Chart as ChartJS, type ChartOptions, type Plugin } from "chart.js";
import { Line } from "react-chartjs-2";

import { COPY_M2 } from "@/lib/copy/modulo-2";
import { calcularPerfilHorario } from "@/lib/core/sfv";
import type { RegistroHorario } from "@/types/sfv";

import { SelectorInline } from "./SelectorInline";
import { usePeriodoInline } from "./usePeriodoInline";

interface Props {
  registros: readonly RegistroHorario[];
}

const HORAS_LABELS = Array.from({ length: 24 }, (_, i) =>
  String(i + 1).padStart(2, "0") + ":00"
);

const COLOR_GENERATION = "#B45309";
const COLOR_GENERATION_BAND = "rgba(180, 83, 9, 0.18)";
const COLOR_BASELINE = "#737373";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

// Ventana hora-punta CFE GDMTH: 18:00–22:00. Labels en formato HH:00 con
// hora-ending (`HORAS_LABELS[17]` = "18:00"). Dibujamos por índice de
// categoría, no por valor — el plugin tolera reordenes futuros del array.
const VENTANA_PUNTA_INICIO_IDX = 17; // "18:00"
const VENTANA_PUNTA_FIN_IDX = 21; // "22:00"
const COLOR_PRIMARY = "#1E40AF";
const COLOR_PRIMARY_DARK = "#1E3A8A";
const COLOR_PRIMARY_FILL = "rgba(30, 64, 175, 0.06)";
const COLOR_PRIMARY_BORDER = "rgba(30, 64, 175, 0.3)";

/**
 * Plugin local que dibuja un overlay rectangular sobre la ventana
 * 18:00–22:00 con borde dashed y label "Hora punta CFE" centrado.
 *
 * Trade-off: la solución es local al chart (no registrada globalmente
 * vía `ChartJS.register`) para evitar contaminar otros charts y
 * mantener el cambio mínimo. Se ejecuta en `beforeDatasetsDraw` así el
 * overlay queda debajo de las líneas, no encima.
 */
const ventanaPuntaCFE: Plugin<"line"> = {
  id: "ventanaPuntaCFE",
  beforeDatasetsDraw(chart) {
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    const area = chart.chartArea;
    if (!xScale || !yScale || !area) return;
    const xIni = xScale.getPixelForValue(VENTANA_PUNTA_INICIO_IDX);
    const xFin = xScale.getPixelForValue(VENTANA_PUNTA_FIN_IDX);
    if (!Number.isFinite(xIni) || !Number.isFinite(xFin)) return;

    const ctx = chart.ctx;
    ctx.save();
    ctx.fillStyle = COLOR_PRIMARY_FILL;
    ctx.fillRect(xIni, area.top, xFin - xIni, area.bottom - area.top);
    ctx.strokeStyle = COLOR_PRIMARY_BORDER;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(xIni, area.top);
    ctx.lineTo(xIni, area.bottom);
    ctx.moveTo(xFin, area.top);
    ctx.lineTo(xFin, area.bottom);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = COLOR_PRIMARY_DARK;
    ctx.font = "500 10px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      COPY_M2.perfilHorario.ventanaCFE.label,
      (xIni + xFin) / 2,
      area.top + 14
    );
    ctx.restore();
  },
};

export function ChartPerfilHorario({ registros }: Props) {
  const periodo = usePeriodoInline(registros);
  const datasetVacio = periodo.registrosFiltrados.length === 0;
  const chartRef = useRef<ChartJS<"line">>(null);

  const perfil = useMemo(() => {
    if (datasetVacio) return null;
    return calcularPerfilHorario(periodo.registrosFiltrados);
  }, [datasetVacio, periodo.registrosFiltrados]);

  const { promedio, p25, p75, maximo } = useMemo(() => {
    if (!perfil) {
      const zeros = Array(24).fill(0);
      return { promedio: zeros, p25: zeros, p75: zeros, maximo: zeros };
    }
    const promedio: number[] = [];
    const p25: number[] = [];
    const p75: number[] = [];
    const maximo: number[] = [];
    for (let h = 1; h <= 24; h += 1) {
      const e = perfil.perfil_por_hora[h]!;
      promedio.push(e.kW_promedio);
      p25.push(e.kW_p25);
      p75.push(e.kW_p75);
      maximo.push(e.kW_maximo);
    }
    return { promedio, p25, p75, maximo };
  }, [perfil]);

  // Asegura redibujo cuando cambia el dataset (Chart.js no reactivo a refs).
  useEffect(() => {
    chartRef.current?.update();
  }, [promedio, p25, p75, maximo]);

  const data = {
    labels: HORAS_LABELS,
    datasets: [
      {
        label: "P75",
        data: p75,
        borderColor: "transparent",
        backgroundColor: COLOR_GENERATION_BAND,
        pointRadius: 0,
        fill: "+1",
        tension: 0.35,
        order: 3,
      },
      {
        label: "P25",
        data: p25,
        borderColor: "transparent",
        backgroundColor: COLOR_GENERATION_BAND,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 3,
      },
      {
        label: "Pico máximo",
        data: maximo,
        borderColor: COLOR_BASELINE,
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 2,
      },
      {
        label: "Generación promedio",
        data: promedio,
        borderColor: COLOR_GENERATION,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0.35,
        order: 1,
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
          item.dataset.label !== "P25" && item.dataset.label !== "P75",
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${Math.round(ctx.parsed.y ?? 0).toLocaleString("es-MX")} kW`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (value) => Number(value).toLocaleString("es-MX"),
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
            Perfil horario promedio anual
          </h2>
          <p className="text-[12px] text-[var(--color-text-secondary)]">
            Generación promedio por hora del día · base 365 días
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[var(--color-text-tertiary)]">
            kW
          </span>
          <SelectorInline
            granularidad={periodo.granularidad}
            onGranularidadChange={periodo.setGranularidad}
            periodo={periodo.periodo}
            periodos={periodo.periodos}
            onSeleccionarPorId={periodo.seleccionarPorId}
            onAnterior={periodo.irAnterior}
            onSiguiente={periodo.irSiguiente}
            hayAnterior={periodo.hayAnterior}
            haySiguiente={periodo.haySiguiente}
          />
        </div>
      </header>
      <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda colorBg={COLOR_GENERATION} texto="Generación promedio" />
          <Leyenda colorBg={COLOR_GENERATION} opacity={0.3} texto="Banda P25–P75" />
          <Leyenda colorBg={COLOR_BASELINE} dashed texto="Pico máximo del año" />
          <Leyenda
            colorBg={COLOR_PRIMARY_FILL}
            border={COLOR_PRIMARY}
            texto={COPY_M2.perfilHorario.ventanaCFE.leyenda}
          />
        </div>
        <div className="relative h-[260px] w-full">
          {datasetVacio ? (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
              Sin registros en el periodo seleccionado.
            </p>
          ) : (
            <Line
              ref={chartRef}
              data={data}
              options={options}
              plugins={[ventanaPuntaCFE]}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Leyenda({
  colorBg,
  opacity = 1,
  dashed = false,
  border,
  texto,
}: {
  colorBg: string;
  opacity?: number;
  dashed?: boolean;
  /** Color del borde sólido; tiene precedencia sobre `dashed`. */
  border?: string;
  texto: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{
          backgroundColor: colorBg,
          opacity,
          border: border
            ? `1px solid ${border}`
            : dashed
            ? `1px dashed ${colorBg}`
            : undefined,
        }}
      />
      {texto}
    </span>
  );
}
