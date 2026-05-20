import { useMemo } from "react";

import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import { calcularCalidadDataset } from "@/lib/tab-sfv/calidad-dataset";
import type { CalidadDataset } from "@/lib/tab-sfv/calidad-dataset";
import type { RegistroHorario } from "@/types/sfv";

interface Props {
  registros: readonly RegistroHorario[];
  anio: number;
}

const FECHA_CORTA = new Intl.DateTimeFormat("es-MX", {
  day: "2-digit",
  month: "short",
});

function formatearFechaCorta(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  if (!y || !m || !d) return yyyymmdd;
  return FECHA_CORTA.format(new Date(y, m - 1, d));
}

function notaAnomalias(c: CalidadDataset["anomalias"]): string {
  if (c.total === 0) return COPY_M2.calidadDataset.anomalias.sinAnomalias;
  const fechas = c.lista.map((a) => formatearFechaCorta(a.fecha));
  if (fechas.length <= 3) return fechas.join(", ");
  const mostradas = fechas.slice(0, 3).join(", ");
  return COPY_M2.calidadDataset.anomalias.listaConExceso(
    mostradas,
    fechas.length - 3
  );
}

export function PanelCalidadDataset({ registros, anio }: Props) {
  const calidad = useMemo(
    () => calcularCalidadDataset(registros, anio),
    [registros, anio]
  );

  const cobertura = calidad.cobertura;
  const dias = calidad.diasConGeneracion;
  const anomalias = calidad.anomalias;
  const granularidad = calidad.granularidad;
  const granNotaEsHoraria = granularidad.minutos >= 60;

  const COPY = COPY_M2.calidadDataset;

  return (
    <section className="mb-6">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
        {COPY.titulo}
      </p>
      <div className="rounded-md border-[0.5px] border-[var(--color-capture)] bg-white px-[18px] py-4 shadow-[0_0_0_1px_var(--color-capture-light)]">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          <QualityItem
            label={COPY.cobertura.label}
            tooltip={COPY.cobertura.tooltip}
            valor={`${cobertura.pct.toFixed(1)}%`}
            barraPct={Math.min(100, cobertura.pct)}
            warn={cobertura.warn}
            nota={COPY.cobertura.nota(cobertura.recibidos, cobertura.esperados)}
            notaWarn={cobertura.warn}
          />
          <QualityItem
            label={COPY.diasConGeneracion.label}
            tooltip={COPY.diasConGeneracion.tooltip}
            valor={`${dias.activos.toLocaleString("es-MX")} / ${dias.totales}`}
            barraPct={Math.min(100, dias.pct)}
            nota={COPY.diasConGeneracion.nota(dias.pct)}
          />
          <QualityItem
            label={COPY.anomalias.label}
            tooltip={COPY.anomalias.tooltip}
            valor={`${anomalias.total} ${COPY.anomalias.sufijoDias(
              anomalias.total
            )}`}
            barraPct={anomalias.total > 0 ? 8 : 0}
            warn={anomalias.total > 0}
            nota={notaAnomalias(anomalias)}
            notaWarn={anomalias.total > 0}
          />
          <QualityItem
            label={COPY.granularidad.label}
            tooltip={COPY.granularidad.tooltip}
            valor={granularidad.etiqueta}
            barraPct={100}
            nota={
              granNotaEsHoraria
                ? COPY.granularidad.notaHoraria
                : COPY.granularidad.notaSubhoraria
            }
          />
        </div>
        {anomalias.total > 0 ? (
          <TablaAnomalias lista={anomalias.lista} total={anomalias.total} />
        ) : null}
      </div>
    </section>
  );
}

interface TablaAnomaliasProps {
  lista: CalidadDataset["anomalias"]["lista"];
  total: number;
}

function TablaAnomalias({ lista, total }: TablaAnomaliasProps) {
  const COPY = COPY_M2.calidadDataset.anomalias;
  const FORMATO_ENTERO = new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  });
  return (
    <details className="mt-4 border-t-[0.5px] border-[var(--color-border-light)] pt-1 text-[13px]">
      <summary className="cursor-pointer list-none py-2 text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="mr-1.5 inline-block text-[10px]">
          ▸
        </span>
        {COPY.detalleToggle(total)}
      </summary>
      <div className="overflow-x-auto pb-2 pt-1">
        <table className="w-full text-left text-[12px] tabular-nums">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.5px] text-[var(--color-text-tertiary)]">
              <th className="py-1.5 pr-3 font-medium">
                {COPY.tablaHeader.fecha}
              </th>
              <th className="py-1.5 pr-3 text-right font-medium">
                {COPY.tablaHeader.energiaDia}
              </th>
              <th className="py-1.5 pr-3 text-right font-medium">
                {COPY.tablaHeader.baseline}
              </th>
              <th className="py-1.5 text-right font-medium">
                {COPY.tablaHeader.variacion}
              </th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a) => {
              const energiaKwh = a.energia_dia_mwh * 1000;
              const baselineKwh = a.esperado_mwh * 1000;
              return (
                <tr
                  key={a.fecha}
                  className="border-t-[0.5px] border-[var(--color-border-light)]"
                >
                  <td className="py-1.5 pr-3 text-[var(--color-text-secondary)]">
                    {formatearFechaCorta(a.fecha)}
                  </td>
                  <td className="py-1.5 pr-3 text-right text-[var(--color-text-primary)]">
                    {FORMATO_ENTERO.format(energiaKwh)} kWh
                  </td>
                  <td className="py-1.5 pr-3 text-right text-[var(--color-text-secondary)]">
                    {FORMATO_ENTERO.format(baselineKwh)} kWh
                  </td>
                  <td className="py-1.5 text-right font-medium text-[var(--color-warning)]">
                    −{a.caida_pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}

interface ItemProps {
  label: string;
  tooltip: string;
  valor: string;
  barraPct: number;
  warn?: boolean;
  nota: string;
  notaWarn?: boolean;
}

function QualityItem({
  label,
  tooltip,
  valor,
  barraPct,
  warn = false,
  nota,
  notaWarn = false,
}: ItemProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.3px] text-[var(--color-text-secondary)]">
          {label}
        </p>
        <InfoTooltip texto={tooltip} etiqueta={`Trazabilidad: ${label}`} />
      </div>
      <p className="mb-1.5 text-[16px] font-medium leading-[1.2] text-[var(--color-text-primary)] tabular-nums">
        {valor}
      </p>
      <div className="mb-1.5 h-1 overflow-hidden rounded-sm bg-[var(--color-bg-secondary)]">
        <div
          className={`h-full transition-[width] duration-300 ${
            warn
              ? "bg-[var(--color-warning)]"
              : "bg-[var(--color-capture)]"
          }`}
          style={{ width: `${Math.max(0, Math.min(100, barraPct))}%` }}
        />
      </div>
      <p
        className={`text-[11px] ${
          notaWarn
            ? "text-[var(--color-warning)]"
            : "text-[var(--color-text-tertiary)]"
        }`}
      >
        {nota}
      </p>
    </div>
  );
}
