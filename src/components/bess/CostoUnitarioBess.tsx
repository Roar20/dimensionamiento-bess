import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CATALOGO_HYPERSTRONG, type EquipoBess } from "@/data/catalogo-hyperstrong";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

// ============================================================
// Costo Unitario por kWh nominal — PR P5.
// Spec mandata: barras = SOLO nominal, lectura inequívoca. La
// sensibilidad DoD 95% NO va como label flotante; vive en chip,
// tooltip y `<details>` metodología.
// ============================================================

const COPY = COPY_M3.costoUnitario;

const DOD = 0.95;

const COLOR_BAR = "#0F766E"; // capture color del design system
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FORMATO_USD = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

interface BarraEquipo {
  equipo: string;
  modelo: string;
  usdKwhNominal: number;
  usdKwhUtil: number;
}

function localizarEquipo(id: string): EquipoBess | null {
  return CATALOGO_HYPERSTRONG.find((e) => e.id === id) ?? null;
}

function calcularUsdKwhUtil(precio: number, capacidadKwh: number): number {
  return Math.round(precio / (capacidadKwh * DOD));
}

export function CostoUnitarioBess() {
  const { barras, blockIII, headline } = useMemo(() => {
    const plus = localizarEquipo("cube-plus");
    const max = localizarEquipo("cube-max");
    const block = localizarEquipo("block-iii");

    const barras: BarraEquipo[] = [];
    if (plus) {
      barras.push({
        equipo: "Cube Plus",
        modelo: plus.modelo,
        usdKwhNominal: plus.precioUsdKwh,
        usdKwhUtil: calcularUsdKwhUtil(plus.precioUsdUnidad, plus.energiaKwh),
      });
    }
    if (max) {
      barras.push({
        equipo: "Cube Max",
        modelo: max.modelo,
        usdKwhNominal: max.precioUsdKwh,
        usdKwhUtil: calcularUsdKwhUtil(max.precioUsdUnidad, max.energiaKwh),
      });
    }

    // Headline ejecutivo dinámico — usa el delta real del catálogo,
    // no un número hardcodeado. Cae al texto del COPY si no hay datos.
    let headline: string = COPY.headline;
    if (barras.length === 2) {
      const plusBar = barras[0]!;
      const maxBar = barras[1]!;
      const deltaPct = Math.round(
        ((plusBar.usdKwhNominal - maxBar.usdKwhNominal) /
          plusBar.usdKwhNominal) *
          100
      );
      headline = `El Cube Max cuesta ${deltaPct}% menos por kWh que el Cube Plus.`;
    }

    return { barras, blockIII: block, headline };
  }, []);

  const yMax = useMemo(() => {
    const m = Math.max(...barras.map((b) => b.usdKwhNominal), 0);
    return Math.ceil((m * 1.2) / 50) * 50;
  }, [barras]);

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {COPY.eyebrow}
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          {COPY.titulo}
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          {COPY.subtitulo}
        </p>
      </header>

      {/* Headline ejecutivo dominante 24px/700 con tooltip de metodología. */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className="text-[clamp(20px,2.2vw,24px)] font-bold leading-tight tracking-[-0.01em] text-[var(--color-text-primary)]">
            {headline}
          </h3>
          <InfoTooltip
            texto={COPY.metodologia.parrafoBase}
            etiqueta="Metodología del costo unitario"
          />
        </div>
      </div>

      <div className="mb-3 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="relative h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barras}
              margin={{ top: 24, right: 16, bottom: 4, left: 4 }}
            >
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis
                dataKey="equipo"
                tick={{ fontSize: 12, fill: "var(--color-text-secondary)" }}
                tickLine={false}
                axisLine={{ stroke: COLOR_GRID }}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fontSize: 11, fill: "#737373" }}
                tickFormatter={(v) => `$${FORMATO_USD.format(v)}`}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "0.5px solid var(--color-border-light)",
                }}
                formatter={(_value, _name, ctx) => {
                  const d = ctx.payload as BarraEquipo;
                  return [
                    COPY.tooltipBarra(d.usdKwhNominal, d.usdKwhUtil),
                    "USD/kWh",
                  ];
                }}
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="usdKwhNominal"
                radius={[4, 4, 0, 0]}
                maxBarSize={80}
                isAnimationActive={false}
              >
                {barras.map((_, i) => (
                  <Cell key={i} fill={COLOR_BAR} />
                ))}
                <LabelList
                  dataKey="usdKwhNominal"
                  position="top"
                  formatter={(v: number) => `$${FORMATO_USD.format(v)}`}
                  style={{
                    fill: "var(--color-text-primary)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <Chip texto={COPY.chipBase} variante="solida" />
          <Chip texto={COPY.chipSensibilidad} variante="discreta" />
        </div>
      </div>

      {/* Tira utility separada para Block III. Borde punteado + fondo
          tenue para que NO compita con la comparación de arriba. */}
      {blockIII ? (
        <div
          className="mb-4 rounded-[12px] border border-dashed border-[var(--color-border-medium)] bg-[var(--color-bg-secondary)] px-4 py-3"
          data-testid="tira-block-iii"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <span className="text-[16px] font-medium text-[var(--color-text-primary)] tabular-nums">
                {COPY.blockIII.titulo}
              </span>
              <span className="text-[12px] text-[var(--color-text-secondary)]">
                {COPY.blockIII.mensaje}
              </span>
            </div>
            <span className="rounded-sm bg-[var(--color-text-tertiary)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.5px] text-white">
              {COPY.blockIII.tag}
            </span>
          </div>
        </div>
      ) : null}

      <MetodologiaDetalles titulo={COPY.metodologia.titulo}>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Base nominal:
          </strong>{" "}
          {COPY.metodologia.parrafoBase}
        </p>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Sensibilidad DoD 95%:
          </strong>{" "}
          {COPY.metodologia.parrafoSensibilidad}
        </p>
        <p>
          <strong className="font-medium text-[var(--color-text-primary)]">
            Block III fuera de escala:
          </strong>{" "}
          {COPY.metodologia.parrafoBlockIII}
        </p>
      </MetodologiaDetalles>
    </section>
  );
}

function Chip({
  texto,
  variante,
}: {
  texto: string;
  variante: "solida" | "discreta";
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] tabular-nums";
  const cls =
    variante === "solida"
      ? `${base} bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] font-medium`
      : `${base} border border-[var(--color-border-light)] text-[var(--color-text-secondary)]`;
  return <span className={cls}>{texto}</span>;
}
