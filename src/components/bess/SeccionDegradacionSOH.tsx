import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";
import { COPY_M3 } from "@/lib/copy/modulo-3";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

// ============================================================
// Migración P5 (PR #N): la curva SOH pasa de Chart.js a Recharts
// para que dos `ReferenceLine` + `ReferenceArea` + `ReferenceDot`
// sean trivialmente declarativos (callout del año 9, bandas verde/
// ámbar/gris). Layout, spacing y wiring del Tab preservados.
// ============================================================

const COPY = COPY_M3.degradacionSoh;

const HITOS: Record<number, string> = {
  0: COPY.tabla.hitos.ano0,
  9: COPY.tabla.hitos.ano9,
  12: COPY.tabla.hitos.ano12,
  15: COPY.tabla.hitos.ano15,
  16: COPY.tabla.hitos.ano16,
  20: COPY.tabla.hitos.ano20,
};

const UMBRAL_FIN_VIDA_UTIL = 80; // %
const UMBRAL_GARANTIA = 70; // %
const ANO_CRUCE_80 = 9;

const COLOR_SOH = "#0F766E";
const COLOR_SOH_FILL = "rgba(15, 118, 110, 0.10)";
const COLOR_UMBRAL_FIN_VIDA = "#0F766E";
const COLOR_UMBRAL_GARANTIA = "#B45309";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";
const COLOR_BANDA_VERDE = "rgba(15, 118, 110, 0.05)";
const COLOR_BANDA_AMBAR = "rgba(180, 83, 9, 0.05)";
const COLOR_BANDA_GRIS = "rgba(0, 0, 0, 0.03)";

const FORMATO_PCT_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function SeccionDegradacionSOH() {
  const soh = CATALOGO_HYPERSTRONG[0]!.curvaSoh;

  const { datos, sohPct, deltas, pendiente1a10, pendiente10a20 } = useMemo(() => {
    const sohPct = soh.map((v) => v * 100);
    const deltas: (number | null)[] = sohPct.map((v, i) =>
      i === 0 ? null : (sohPct[i - 1] as number) - v
    );

    let suma1a10 = 0;
    for (let i = 1; i <= 10; i += 1) suma1a10 += deltas[i] as number;
    const pendiente1a10 = suma1a10 / 10;

    let suma10a20 = 0;
    for (let i = 11; i <= 20; i += 1) suma10a20 += deltas[i] as number;
    const pendiente10a20 = suma10a20 / 10;

    const datos = sohPct.map((v, i) => ({ ano: i, soh: v }));

    return { datos, sohPct, deltas, pendiente1a10, pendiente10a20 };
  }, [soh]);

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

      {/* Headline ejecutivo dominante (24px/700) + línea de asimetría. */}
      <div className="mb-5">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className="text-[clamp(20px,2.2vw,24px)] font-bold leading-tight tracking-[-0.01em] text-[var(--color-text-primary)]">
            {COPY.headline}
          </h3>
          <InfoTooltip texto={COPY.tooltipHeadline} etiqueta="Metodología de los umbrales SOH" />
        </div>
        <p className="text-[13px] text-[var(--color-text-secondary)]">
          {COPY.lineaAsimetria}
        </p>
      </div>

      {/* Anclas: solo año 0 y año 20. */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <KPICard
          label={COPY.cardEntrega.label}
          valor={`${FORMATO_PCT_1DEC.format(sohPct[0] as number)}%`}
          sublabel={COPY.cardEntrega.sublabel}
        />
        <KPICard
          label={COPY.cardFinHorizonte.label}
          valor={`${FORMATO_PCT_1DEC.format(sohPct[20] as number)}%`}
          sublabel={COPY.cardFinHorizonte.sublabel}
        />
      </div>

      {/* Curva con dos umbrales + callout año 9. */}
      <div className="mb-4 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda colorBg={COLOR_SOH} texto={COPY.legend.soh} />
          <Leyenda
            colorBg={COLOR_UMBRAL_FIN_VIDA}
            dashed
            texto={COPY.legend.umbralFinVida}
          />
          <Leyenda
            colorBg={COLOR_UMBRAL_GARANTIA}
            dashed
            texto={COPY.legend.umbralGarantia}
          />
        </div>
        <div className="relative h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={datos}
              margin={{ top: 12, right: 56, bottom: 4, left: 4 }}
            >
              <CartesianGrid stroke={COLOR_GRID} vertical={false} />
              <XAxis
                dataKey="ano"
                tick={{ fontSize: 11, fill: "#737373" }}
                tickFormatter={(v) => `Año ${v}`}
                interval={1}
              />
              <YAxis
                domain={[60, 100]}
                tick={{ fontSize: 11, fill: "#737373" }}
                tickFormatter={(v) => `${v}%`}
              />
              {/* Bandas verde/ámbar/gris detrás de la curva. */}
              <ReferenceArea y1={80} y2={100} fill={COLOR_BANDA_VERDE} />
              <ReferenceArea y1={70} y2={80} fill={COLOR_BANDA_AMBAR} />
              <ReferenceArea y1={60} y2={70} fill={COLOR_BANDA_GRIS} />
              <ReferenceLine
                y={UMBRAL_FIN_VIDA_UTIL}
                stroke={COLOR_UMBRAL_FIN_VIDA}
                strokeDasharray="4 4"
                label={{
                  value: "80% — fin de vida útil de referencia",
                  position: "right",
                  fill: COLOR_UMBRAL_FIN_VIDA,
                  fontSize: 10,
                }}
              />
              <ReferenceLine
                y={UMBRAL_GARANTIA}
                stroke={COLOR_UMBRAL_GARANTIA}
                strokeDasharray="4 4"
                label={{
                  value: "70% — garantía contractual",
                  position: "right",
                  fill: COLOR_UMBRAL_GARANTIA,
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="soh"
                stroke={COLOR_SOH}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
                fill={COLOR_SOH_FILL}
              />
              {/* Callout discreto en el cruce del 80% (año 9). */}
              <ReferenceDot
                x={ANO_CRUCE_80}
                y={UMBRAL_FIN_VIDA_UTIL}
                r={4}
                fill={COLOR_UMBRAL_FIN_VIDA}
                stroke="white"
                strokeWidth={2}
                label={{
                  value: `${COPY.callout.titulo} · ${COPY.callout.sub}`,
                  position: "top",
                  fill: "var(--color-text-primary)",
                  fontSize: 11,
                  fontWeight: 500,
                  offset: 12,
                }}
              />
              <RechartsTooltip
                formatter={(v: number) => [`${FORMATO_PCT_1DEC.format(v)}%`, "SOH"]}
                labelFormatter={(label) => `Año ${label}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <NarrativaCard
          titulo={COPY.narrativa.primeraDecada.titulo}
          texto={COPY.narrativa.primeraDecada.texto(
            FORMATO_PCT_1DEC.format(pendiente1a10)
          )}
        />
        <NarrativaCard
          titulo={COPY.narrativa.segundaDecada.titulo}
          texto={COPY.narrativa.segundaDecada.texto(
            FORMATO_PCT_1DEC.format(pendiente10a20)
          )}
        />
      </div>

      <div className="mb-4 overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <Th align="left">{COPY.tabla.headers.ano}</Th>
              <Th>{COPY.tabla.headers.soh}</Th>
              <Th>{COPY.tabla.headers.delta}</Th>
              <Th align="left">{COPY.tabla.headers.hito}</Th>
            </tr>
          </thead>
          <tbody>
            {sohPct.map((v, i) => (
              <tr
                key={i}
                className="border-t-[0.5px] border-[var(--color-border-light)]"
              >
                <Td align="left" emphasis>
                  {i}
                </Td>
                <Td>{FORMATO_PCT_1DEC.format(v)}</Td>
                <Td>
                  {deltas[i] === null
                    ? "—"
                    : FORMATO_PCT_1DEC.format(deltas[i] as number)}
                </Td>
                <Td align="left">{HITOS[i] ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4 rounded-[12px] border-[0.5px] border-[#B45309] bg-[#FEF3C7] px-4 py-3 text-[12px] leading-relaxed text-[#78350F]">
        <strong className="font-medium">{COPY.disclaimer.titulo}</strong>{" "}
        {COPY.disclaimer.cuerpo}
      </div>

      <MetodologiaDetalles titulo={COPY.metodologia.titulo}>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Origen del dato:
          </strong>{" "}
          {COPY.metodologia.origen}
        </p>
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Pendientes calculadas:
          </strong>{" "}
          la pérdida promedio año 1→10 ({FORMATO_PCT_1DEC.format(pendiente1a10)} pp/año)
          y año 10→20 ({FORMATO_PCT_1DEC.format(pendiente10a20)} pp/año) se obtienen
          en runtime como promedios de las diferencias anuales sobre cada
          ventana de 10 años. No están hardcoded.
        </p>
        <p>
          <strong className="font-medium text-[var(--color-text-primary)]">
            Arquitectura del dato:
          </strong>{" "}
          el catálogo expone la curva vía <code>equipo.curvaSoh</code>. Cuando
          exista el motor de potencia firme y el Tab Análisis Financiero, esos
          consumidores leerán la curva por esta vía, sin importar{" "}
          <code>CURVAS_SOH</code> directamente. Decisión arquitectónica
          registrada en <code>docs/DECISIONS.md</code>.
        </p>
      </MetodologiaDetalles>
    </section>
  );
}

function KPICard({
  label,
  valor,
  sublabel,
}: {
  label: string;
  valor: string;
  sublabel: string;
}) {
  return (
    <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-[20px] font-medium tabular-nums text-[var(--color-text-primary)]">
        {valor}
      </p>
      <p className="text-[12px] text-[var(--color-text-secondary)]">
        {sublabel}
      </p>
    </div>
  );
}

function NarrativaCard({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white px-4 py-3">
      <p className="mb-1 text-[13px] font-medium text-[var(--color-text-primary)]">
        {titulo}
      </p>
      <p className="text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
        {texto}
      </p>
    </div>
  );
}

function Th({
  children,
  align = "right",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-3.5 py-3 text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)] ${
        align === "left" ? "text-left" : "text-right"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "right",
  emphasis = false,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  emphasis?: boolean;
}) {
  return (
    <td
      className={`px-3.5 py-2.5 tabular-nums ${
        align === "left" ? "text-left" : "text-right"
      } ${emphasis ? "font-medium text-[var(--color-text-primary)]" : "text-[var(--color-text-secondary)]"}`}
    >
      {children}
    </td>
  );
}

function Leyenda({
  colorBg,
  dashed = false,
  texto,
}: {
  colorBg: string;
  dashed?: boolean;
  texto: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-3 w-3 rounded-sm"
        style={{
          backgroundColor: colorBg,
          border: dashed ? `1px dashed ${colorBg}` : undefined,
        }}
      />
      {texto}
    </span>
  );
}
