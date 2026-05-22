import { useMemo } from "react";

import { COPY_SFV_BESS } from "@/lib/copy/sfv-bess";
import {
  construirFilasTabla,
  formatearCiclos,
  formatearConfig,
  formatearPct,
} from "@/lib/tab-sfv-bess/comparacion-configuraciones";
import type { ResultadoBarridoConfiguraciones } from "@/lib/core/bess/barrido-configuraciones";

interface Props {
  resultado: ResultadoBarridoConfiguraciones;
}

const COPY = COPY_SFV_BESS.comparacionConfiguraciones;

export function TablaConfiguraciones({ resultado }: Props) {
  const filas = useMemo(() => construirFilasTabla(resultado), [resultado]);

  return (
    <div className="overflow-x-auto rounded-[12px] border-[0.5px] border-[var(--color-border-light)]">
      <table className="w-full min-w-[640px] text-[12px]">
        <thead>
          <tr className="border-b border-[var(--color-border-light)] bg-[var(--color-bg-page)]">
            <Th>{COPY.tabla.colConfig}</Th>
            <Th>{COPY.tabla.colEstrategia}</Th>
            <Th align="right">{COPY.tabla.colKwh}</Th>
            <Th align="right">{COPY.tabla.colCaptura}</Th>
            <Th align="right">{COPY.tabla.colCiclos}</Th>
            <Th>{COPY.tabla.colIndicador}</Th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => {
            const ev = fila.evaluada;
            const horas = ev.config.e_kwh / ev.config.p_kw;
            const rowBg = !fila.enFrente ? "bg-[#fafafa]" : "bg-white";
            return (
              <tr
                key={i}
                data-testid="fila-config"
                data-frente={fila.enFrente ? "true" : undefined}
                data-codo={fila.esCodo ? "true" : undefined}
                className={`border-b border-[var(--color-border-light)] last:border-b-0 ${rowBg}`}
              >
                <Td>
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {formatearConfig(ev.config.p_kw, horas)}
                  </span>
                </Td>
                <Td>
                  <span className="inline-block rounded-full bg-[var(--color-bg-page)] px-2 py-0.5 text-[11px] text-[var(--color-text-secondary)]">
                    {ev.estrategia === "greedy"
                      ? COPY.estrategias.greedy
                      : COPY.estrategias.arbitraje}
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[var(--color-text-secondary)]">
                    {ev.config.e_kwh.toLocaleString("es-MX")} kWh
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[var(--color-text-primary)]">
                    {formatearPct(ev.kpis.fraccion_capturada)}
                  </span>
                </Td>
                <Td align="right">
                  <span className="text-[var(--color-text-primary)]">
                    {formatearCiclos(ev.kpis.ciclos_periodo)}
                  </span>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    {fila.enFrente && (
                      <span
                        data-testid="badge-frente"
                        className="inline-block rounded-full bg-[var(--color-info-bg)] px-2 py-0.5 text-[11px] text-[var(--color-info)]"
                      >
                        {COPY.badges.frente}
                      </span>
                    )}
                    {fila.esCodo && (
                      <span
                        data-testid="badge-inflexion"
                        className="inline-block rounded-full border-[0.5px] border-[var(--color-text-secondary)] px-2 py-0.5 text-[11px] text-[var(--color-text-primary)]"
                      >
                        {COPY.badges.inflexion}
                      </span>
                    )}
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.4px] text-[var(--color-text-tertiary)] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`px-4 py-2.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </td>
  );
}
