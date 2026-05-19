import { useMemo } from "react";
import type { ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";

import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";
import { MetodologiaDetalles } from "@/components/ui/MetodologiaDetalles";

import { ensureChartJsRegistered } from "../tab-sfv/chart-setup";

ensureChartJsRegistered();

const HITOS: Record<number, string> = {
  0: "Entrega",
  1: "Cierre asentamiento",
  5: "Primer lustro",
  10: "Punto contractual garantía",
  15: "Vida útil declarada Cube Plus",
  16: "Cruce umbral garantía",
  20: "Fin horizonte modelado",
};

const UMBRAL_GARANTIA_TIPICA = 70;

const COLOR_SOH = "#0F766E";
const COLOR_SOH_FILL = "rgba(15, 118, 110, 0.10)";
const COLOR_UMBRAL = "#B45309";
const COLOR_GRID = "rgba(0, 0, 0, 0.06)";

const FORMATO_PCT_1DEC = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function SeccionDegradacionSOH() {
  const soh = CATALOGO_HYPERSTRONG[0]!.curvaSoh;

  const { sohPct, deltas, pendiente1a10, pendiente10a20 } = useMemo(() => {
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

    return { sohPct, deltas, pendiente1a10, pendiente10a20 };
  }, [soh]);

  const labelsAnos = sohPct.map((_, i) => `Año ${i}`);

  const data = {
    labels: labelsAnos,
    datasets: [
      {
        label: "Umbral garantía típica (70%)",
        data: sohPct.map(() => UMBRAL_GARANTIA_TIPICA),
        borderColor: COLOR_UMBRAL,
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
        order: 2,
      },
      {
        label: "SOH (%)",
        data: sohPct,
        borderColor: COLOR_SOH,
        backgroundColor: COLOR_SOH_FILL,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.25,
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
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label}: ${FORMATO_PCT_1DEC.format(ctx.parsed.y ?? 0)}%`,
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
        min: 60,
        max: 100,
        grid: { color: COLOR_GRID },
        ticks: {
          color: "#737373",
          font: { size: 11 },
          callback: (value) => `${Number(value).toFixed(0)}%`,
        },
      },
    },
  };

  return (
    <section className="mb-8">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        Vida útil del equipo
      </p>
      <header className="mb-3">
        <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
          Degradación del BESS a 20 años
        </h2>
        <p className="text-[12px] text-[var(--color-text-secondary)]">
          Retención de capacidad (SOH, State of Health) según la curva
          declarada por Hyperstrong para la familia LFP-314Ah, base operación
          1C y condiciones nominales.
        </p>
      </header>

      <div className="mb-4 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-[var(--color-bg-secondary)] px-4 py-3 text-[13px] text-[var(--color-text-secondary)]">
        <strong className="font-medium text-[var(--color-text-primary)]">
          Lectura ejecutiva:
        </strong>{" "}
        La capacidad del banco baja de {FORMATO_PCT_1DEC.format(sohPct[0] as number)}% al
        entregar a {FORMATO_PCT_1DEC.format(sohPct[20] as number)}% al cierre del horizonte
        modelado. La pérdida no es lineal: el primer lustro concentra la mayor
        caída ({FORMATO_PCT_1DEC.format(pendiente1a10)} pp/año promedio entre año 1 y 10)
        y se atenúa después ({FORMATO_PCT_1DEC.format(pendiente10a20)} pp/año entre año
        10 y 20).
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KPICard
          label="SOH año 0"
          valor={`${FORMATO_PCT_1DEC.format(sohPct[0] as number)}%`}
          sublabel="Entrega"
        />
        <KPICard
          label="SOH año 1"
          valor={`${FORMATO_PCT_1DEC.format(sohPct[1] as number)}%`}
          sublabel="Cierre asentamiento"
        />
        <KPICard
          label="SOH año 10"
          valor={`${FORMATO_PCT_1DEC.format(sohPct[10] as number)}%`}
          sublabel="Punto contractual garantía"
        />
        <KPICard
          label="SOH año 20"
          valor={`${FORMATO_PCT_1DEC.format(sohPct[20] as number)}%`}
          sublabel="Fin horizonte modelado"
        />
      </div>

      <div className="mb-4 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white p-5">
        <div className="mb-3 flex flex-wrap gap-5 text-[12px] text-[var(--color-text-secondary)]">
          <Leyenda colorBg={COLOR_SOH} texto="SOH (%) por año" />
          <Leyenda colorBg={COLOR_UMBRAL} dashed texto={`Umbral garantía típica (${UMBRAL_GARANTIA_TIPICA}%)`} />
        </div>
        <div className="relative h-[280px] w-full">
          <Line data={data} options={options} />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <NarrativaCard
          titulo="Primera década"
          texto={`Pérdida promedio de ${FORMATO_PCT_1DEC.format(pendiente1a10)} pp/año entre el año 1 y el año 10. Es la fase donde la química LFP entrega su perfil más exigente: estabilización del SEI, primer ciclo profundo y ajuste del balance celda-celda. El punto contractual de garantía (año 10) cierra esta etapa.`}
        />
        <NarrativaCard
          titulo="Segunda década"
          texto={`Pérdida promedio de ${FORMATO_PCT_1DEC.format(pendiente10a20)} pp/año entre el año 10 y el año 20. La curva se aplana; la energía útil sigue cayendo pero a ritmo menor. El cruce del umbral garantía típica (${UMBRAL_GARANTIA_TIPICA}%) ocurre dentro de esta ventana, en línea con la vida útil declarada del equipo.`}
        />
      </div>

      <div className="mb-4 overflow-hidden rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-white">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <Th align="left">Año</Th>
              <Th>SOH (%)</Th>
              <Th>Δ vs año anterior (pp)</Th>
              <Th align="left">Hito</Th>
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

      <div className="mb-4 rounded-[12px] border-[0.5px] border-[var(--color-border-light)] bg-[#FEF3C7] px-4 py-3 text-[12px] text-[#78350F]">
        <strong className="font-medium">Disclaimer y condiciones del dato:</strong>{" "}
        Los 21 valores graficados provienen de la curva SOH publicada por
        Hyperstrong para la plataforma LFP-314Ah en condiciones nominales (1C,
        rango de temperatura de operación, sin estrés térmico o eléctrico
        extraordinario). La curva refleja un perfil declarado por el
        fabricante, no una garantía contractual: la carta formal de garantía
        de capacidad mínima vinculante a 10 años está pendiente de
        confirmación con Hyperstrong, así como la revisión de la curva para
        régimen 0.5C aplicable a despacho de hora-punta. Cualquier desviación
        operativa frente a estas condiciones (temperaturas sostenidas fuera
        de rango, ciclado profundo continuo, sobre-corriente) acelera la
        degradación más allá de lo modelado aquí.
      </div>

      <MetodologiaDetalles titulo="Metodología y procedencia de la curva SOH">
        <p className="mb-2">
          <strong className="font-medium text-[var(--color-text-primary)]">
            Origen del dato:
          </strong>{" "}
          21 puntos anuales (año 0 al año 20) entregados por Hyperstrong para
          la plataforma LFP-314Ah, operación 1C y condiciones nominales del
          datasheet. La curva es la misma para Cube Plus, Cube Max y Block
          III; el atributo distintivo entre equipos es la vida útil declarada,
          no la forma de la curva.
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
