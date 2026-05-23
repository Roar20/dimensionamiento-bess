import { useMemo } from "react";

import { COPY_M2 } from "@/lib/copy/modulo-2";
import {
  calcularExcedenteHoraMes,
  type CeldaHeatmap,
  type ResultadoHeatmap,
} from "@/lib/tab-sfv/excedente-hora-mes";
import type { RegistroHorario } from "@/types/sfv";

interface Props {
  registros: readonly RegistroHorario[];
  poiKw: number;
  /** Hora de fin de descarga (default 22, CFE GDMTH). */
  horaFinDescarga?: number;
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

const HORAS = Array.from({ length: 24 }, (_, h) => h);

const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

/**
 * Escala de color por excedente promedio en kWh. Umbrales calibrados
 * para que la matriz tenga contraste útil en datasets reales.
 */
function colorScale(kwh: number): string {
  if (kwh <= 0) return "#F5F5F4";
  if (kwh < 30) return "#FEF3C7";
  if (kwh < 60) return "#FDE68A";
  if (kwh < 100) return "#FCD34D";
  if (kwh < 150) return "#F59E0B";
  if (kwh < 200) return "#B45309";
  return "#78350F";
}

/**
 * Heatmap de excedente sobre POI por (mes, hora). Cuando
 * `excedenteAnualKwh === 0`, el componente devuelve `null` por
 * completo: ni section label ni wrapper — el `<HallazgoEjecutivo>` que
 * vive abajo en `TabSFV.tsx` cumple la función para el caso de planta
 * sin excedentes (D-PROYECTO-01 vigente). Ver decisión A del prompt B.
 */
export function HeatmapExcedente({
  registros,
  poiKw,
  horaFinDescarga = 22,
}: Props) {
  const resultado: ResultadoHeatmap = useMemo(
    () => calcularExcedenteHoraMes(registros, poiKw, horaFinDescarga),
    [registros, poiKw, horaFinDescarga]
  );

  if (resultado.excedenteAnualKwh <= 0) return null;

  const COPY = COPY_M2.heatmap;

  // Indexar celdas por (mes, hora) para render O(1).
  const celdasPorClave = new Map<string, CeldaHeatmap>();
  for (const c of resultado.celdas) {
    celdasPorClave.set(`${c.mes}|${c.hora}`, c);
  }

  const lectura =
    resultado.ventanaP80 !== null
      ? COPY.lecturaTemplate(
          resultado.ventanaP80.horaInicio,
          resultado.ventanaP80.horaFin,
          resultado.ventanaP80.horasDuracion,
          resultado.ventanaP80.duracionBessMinima,
          horaFinDescarga
        )
      : null;

  return (
    <section className="mb-8">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {COPY.sectionLabel}
      </p>
      <div className="rounded-md border-[0.5px] border-[var(--color-capture)] bg-white px-[18px] py-5 shadow-[0_0_0_1px_var(--color-capture-light)]">
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

        <div className="overflow-x-auto">
          <div
            className="grid min-w-[640px] gap-[2px]"
            style={{ gridTemplateColumns: "50px repeat(24, minmax(20px, 1fr))" }}
          >
            <div />
            {HORAS.map((h) => (
              <div
                key={`hx-${h}`}
                className="flex h-[18px] items-center justify-center text-[10px] text-[var(--color-text-tertiary)]"
              >
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
            {MESES_ABREV.map((label, mIdx) => {
              const mes = mIdx + 1;
              return (
                <FilaMes
                  key={`row-${mes}`}
                  label={label}
                  mes={mes}
                  celdasPorClave={celdasPorClave}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)]">
          <span>{COPY.legendMin}</span>
          <div className="flex h-[10px] w-[200px] overflow-hidden rounded-[2px]">
            {["#F5F5F4", "#FEF3C7", "#FDE68A", "#FCD34D", "#F59E0B", "#B45309", "#78350F"].map(
              (c) => (
                <div key={c} className="flex-1" style={{ background: c }} />
              )
            )}
          </div>
          <span>{COPY.legendMax}</span>
        </div>

        {lectura ? (
          <div className="mt-3.5 rounded-md bg-[var(--color-bg-secondary)] px-3 py-2.5 text-[12px] leading-relaxed text-[var(--color-text-secondary)]">
            <strong className="font-medium text-[var(--color-text-primary)]">
              Lectura:
            </strong>{" "}
            {lectura}
          </div>
        ) : null}

        {resultado.topHoraMes.length > 0 ? (
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
                    <th className="py-1.5 pr-3 font-medium">{COPY.tablaHeader.mes}</th>
                    <th className="py-1.5 pr-3 font-medium">{COPY.tablaHeader.hora}</th>
                    <th className="py-1.5 text-right font-medium">{COPY.tablaHeader.excedente}</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.topHoraMes.map((t, idx) => (
                    <tr
                      key={`top-${idx}`}
                      className="border-t-[0.5px] border-[var(--color-border-light)]"
                    >
                      <td className="py-1.5 pr-3 text-[var(--color-text-secondary)]">
                        {MESES_ABREV[t.mes - 1]}
                      </td>
                      <td className="py-1.5 pr-3 text-[var(--color-text-secondary)]">
                        {t.hora}h
                      </td>
                      <td className="py-1.5 text-right text-[var(--color-text-primary)]">
                        {FORMATO_ENTERO.format(t.excedenteKwh)} kWh
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

interface FilaMesProps {
  label: string;
  mes: number;
  celdasPorClave: Map<string, CeldaHeatmap>;
}

function FilaMes({ label, mes, celdasPorClave }: FilaMesProps) {
  return (
    <>
      <div className="flex items-center justify-end pr-1.5 text-[11px] text-[var(--color-text-tertiary)]">
        {label}
      </div>
      {HORAS.map((h) => {
        const celda = celdasPorClave.get(`${mes}|${h}`);
        const v = celda ? celda.excedenteKwh : 0;
        const mostrarValor = v >= 150;
        return (
          <div
            key={`c-${mes}-${h}`}
            className="flex items-center justify-center rounded-[2px] text-[9px] font-medium"
            style={{
              background: colorScale(v),
              aspectRatio: "1.4 / 1",
              color: "rgba(255,255,255,0.85)",
            }}
            title={`${label} · ${h}h — ${FORMATO_ENTERO.format(v)} kWh promedio de excedente`}
          >
            {mostrarValor ? FORMATO_ENTERO.format(v) : ""}
          </div>
        );
      })}
    </>
  );
}
