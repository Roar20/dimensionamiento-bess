import { useMemo } from "react";

import { COPY_M2 } from "@/lib/copy/modulo-2";
import {
  calcularDispersionDiaria,
  type EstadisticasMensuales,
} from "@/lib/tab-sfv/dispersion-diaria";
import type { RegistroHorario } from "@/types/sfv";

interface Props {
  registros: readonly RegistroHorario[];
}

const MESES_ABREV = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

const FORMATO_FECHA_CORTA = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

/** Redondeo "bonito" hacia arriba al múltiplo de 500 más cercano. */
function redondearArriba500(n: number): number {
  return Math.ceil(n / 500) * 500;
}

export function BoxplotGeneracionDiaria({ registros }: Props) {
  const stats: EstadisticasMensuales[] = useMemo(
    () => calcularDispersionDiaria(registros),
    [registros]
  );

  const COPY = COPY_M2.boxplot;

  // X_MAX = max_diario_anual × 1.1, redondeado a 500 arriba para que las
  // etiquetas del eje queden en valores limpios.
  const maxDiario = stats.reduce((acc, m) => Math.max(acc, m.max), 0);
  const xMax = redondearArriba500(Math.max(1, maxDiario * 1.1));

  const conDatos = stats.filter((m) => m.diasContados > 0);
  const mejorMes =
    conDatos.length > 0
      ? conDatos.reduce((a, b) => (a.mediana >= b.mediana ? a : b))
      : null;
  const peorMes =
    conDatos.length > 0
      ? conDatos.reduce((a, b) => (a.mediana <= b.mediana ? a : b))
      : null;

  const lectura =
    mejorMes && peorMes
      ? COPY.lecturaTemplate(
          MESES_ABREV[mejorMes.mes - 1] ?? "—",
          MESES_ABREV[peorMes.mes - 1] ?? "—"
        )
      : null;

  // 5 etiquetas equidistantes en el eje (valores absolutos kWh).
  const etiquetasEje = [0, 0.25, 0.5, 0.75, 1].map((p) =>
    FORMATO_ENTERO.format(p * xMax)
  );

  return (
    <section className="mb-8">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {COPY.sectionLabel}
      </p>
      <div className="rounded-md border-[0.5px] border-[var(--color-border-light)] bg-white px-[18px] py-5">
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-medium text-[var(--color-text-primary)]">
              {COPY.title}
            </h2>
            <p className="text-[12px] text-[var(--color-text-tertiary)]">
              {COPY.subtitle}
            </p>
          </div>
          <span className="text-[11px] uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
            {COPY.unidad}
          </span>
        </header>

        <div className="space-y-1">
          <div
            className="grid items-center gap-3 text-[10px] uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]"
            style={{ gridTemplateColumns: "50px 1fr 80px" }}
          >
            <div />
            <div className="flex justify-between">
              {etiquetasEje.map((etq) => (
                <span key={etq}>{etq}</span>
              ))}
            </div>
            <div className="text-right">Mediana</div>
          </div>

          {stats.map((m) => (
            <FilaBoxplot key={`bp-${m.mes}`} stats={m} xMax={xMax} />
          ))}
        </div>

        {lectura ? (
          <div className="mt-3.5 rounded-md bg-[var(--color-bg-secondary)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
            <strong className="font-medium text-[var(--color-text-primary)]">
              Lectura:
            </strong>{" "}
            {lectura}
          </div>
        ) : null}

        {conDatos.length > 0 ? (
          <details className="mt-3 border-t-[0.5px] border-[var(--color-border-light)] pt-1 text-[13px]">
            <summary className="cursor-pointer list-none py-2 text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true" className="mr-1.5 inline-block text-[10px]">
                ▸
              </span>
              {COPY.detalleToggle}
            </summary>
            <div className="overflow-x-auto pb-2 pt-1">
              <table className="w-full text-left text-[12px] tabular-nums">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
                    <th className="py-1.5 pr-3 font-medium">
                      {COPY.tablaHeader.mes}
                    </th>
                    <th className="py-1.5 pr-3 font-medium">
                      {COPY.tablaHeader.mejorDiaFecha}
                    </th>
                    <th className="py-1.5 pr-3 text-right font-medium">
                      {COPY.tablaHeader.mejorDiaKwh}
                    </th>
                    <th className="py-1.5 pr-3 font-medium">
                      {COPY.tablaHeader.peorDiaFecha}
                    </th>
                    <th className="py-1.5 text-right font-medium">
                      {COPY.tablaHeader.peorDiaKwh}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((m) => (
                    <tr
                      key={`row-${m.mes}`}
                      className="border-t-[0.5px] border-[var(--color-border-light)]"
                    >
                      <td className="py-1.5 pr-3 text-[var(--color-text-secondary)]">
                        {MESES_ABREV[m.mes - 1]}
                      </td>
                      <td className="py-1.5 pr-3 text-[var(--color-text-secondary)]">
                        {m.mejorDia ? FORMATO_FECHA_CORTA.format(m.mejorDia.fecha) : "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-right text-[var(--color-text-primary)]">
                        {m.mejorDia ? FORMATO_ENTERO.format(m.mejorDia.energiaKwh) : "—"}
                      </td>
                      <td className="py-1.5 pr-3 text-[var(--color-text-secondary)]">
                        {m.peorDia ? FORMATO_FECHA_CORTA.format(m.peorDia.fecha) : "—"}
                      </td>
                      <td className="py-1.5 text-right text-[var(--color-text-primary)]">
                        {m.peorDia ? FORMATO_ENTERO.format(m.peorDia.energiaKwh) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ) : null}
      </div>
    </section>
  );
}

interface FilaProps {
  stats: EstadisticasMensuales;
  xMax: number;
}

function FilaBoxplot({ stats, xMax }: FilaProps) {
  const label = MESES_ABREV[stats.mes - 1] ?? `${stats.mes}`;
  const hasData = stats.diasContados > 0;
  const pct = (v: number) => `${(v / xMax) * 100}%`;
  const ancho = (a: number, b: number) => `${((b - a) / xMax) * 100}%`;
  const medianaStr = hasData ? `${FORMATO_ENTERO.format(stats.mediana)} kWh` : "—";

  const tooltip = hasData
    ? `${label} — Min: ${FORMATO_ENTERO.format(stats.min)} · P25: ${FORMATO_ENTERO.format(
        stats.p25
      )} · Mediana: ${FORMATO_ENTERO.format(stats.mediana)} · P75: ${FORMATO_ENTERO.format(
        stats.p75
      )} · Max: ${FORMATO_ENTERO.format(stats.max)} kWh/día`
    : `${label} — sin datos válidos`;

  return (
    <div
      className="grid items-center gap-3 text-[11px]"
      style={{ gridTemplateColumns: "50px 1fr 80px" }}
      title={tooltip}
    >
      <div className="pr-1.5 text-right text-[var(--color-text-secondary)]">
        {label}
      </div>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--color-border-light)]" />
        {hasData ? (
          <>
            <div
              className="absolute top-1/2 h-px -translate-y-1/2 bg-[var(--color-text-tertiary)]"
              style={{ left: pct(stats.min), width: ancho(stats.min, stats.max) }}
            >
              <span
                className="absolute -top-[5px] h-[11px] w-px bg-[var(--color-text-tertiary)]"
                style={{ left: 0 }}
              />
              <span
                className="absolute -top-[5px] h-[11px] w-px bg-[var(--color-text-tertiary)]"
                style={{ right: 0 }}
              />
            </div>
            <div
              className="absolute top-1/2 h-[14px] -translate-y-1/2 rounded-[2px] border bg-[var(--color-generation-light)]"
              style={{
                left: pct(stats.p25),
                width: ancho(stats.p25, stats.p75),
                borderColor: "var(--color-generation)",
              }}
            />
            <div
              className="absolute top-1/2 h-[14px] w-[2px] -translate-y-1/2 bg-[var(--color-generation)]"
              style={{ left: pct(stats.mediana) }}
            />
          </>
        ) : null}
      </div>
      <div className="text-right text-[var(--color-text-secondary)] tabular-nums">
        {medianaStr}
      </div>
    </div>
  );
}
