import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { NarrativaIntro } from "@/components/tab-sfv/NarrativaIntro";
import { COPY_M5 } from "@/lib/copy/modulo-5";
import { compararEstrategias } from "@/lib/tab-sfv-bess/recomendar-estrategia";
import type { ResultadoSimulacion } from "@/types/bess";

interface Props {
  simGreedy: ResultadoSimulacion | null;
  simArbitraje: ResultadoSimulacion | null;
}

const FMT_DECIMAL = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

const FMT_ENTERO = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

export function Seccion5Comparativa({ simGreedy, simArbitraje }: Props) {
  const copy = COPY_M5.seccion5;
  const data = useMemo(() => {
    if (!simGreedy || !simArbitraje) return null;
    return compararEstrategias(simGreedy, simArbitraje);
  }, [simGreedy, simArbitraje]);

  if (!data) return null;

  const filas = [
    {
      label: copy.filas.cargado,
      g: FMT_DECIMAL.format(data.cargado_greedy_mwh),
      a: FMT_DECIMAL.format(data.cargado_arbitraje_mwh),
      diff: diffMwh(data.cargado_greedy_mwh, data.cargado_arbitraje_mwh),
    },
    {
      label: copy.filas.descargado,
      g: FMT_DECIMAL.format(data.descargado_greedy_mwh),
      a: FMT_DECIMAL.format(data.descargado_arbitraje_mwh),
      diff: diffMwh(data.descargado_greedy_mwh, data.descargado_arbitraje_mwh),
    },
    {
      label: copy.filas.ciclos,
      g: FMT_ENTERO.format(data.ciclos_greedy),
      a: FMT_ENTERO.format(data.ciclos_arbitraje),
      diff: diffCiclos(data.ciclos_greedy, data.ciclos_arbitraje),
    },
    {
      label: copy.filas.horasPunta,
      g: FMT_ENTERO.format(data.horas_punta_greedy),
      a: FMT_ENTERO.format(data.horas_punta_arbitraje),
      diff: diffVeces(
        data.horas_punta_greedy,
        data.horas_punta_arbitraje,
        "horas"
      ),
      destacar: true,
    },
    {
      label: copy.filas.energiaPunta,
      g: FMT_DECIMAL.format(data.energia_punta_greedy_mwh),
      a: FMT_DECIMAL.format(data.energia_punta_arbitraje_mwh),
      diff: diffVeces(
        data.energia_punta_greedy_mwh,
        data.energia_punta_arbitraje_mwh,
        "MWh"
      ),
      destacar: true,
    },
  ];

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-brand-cardBorder bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-helper">
                  <th className="px-4 py-2">{copy.columnas.kpi}</th>
                  <th className="px-4 py-2 text-right">
                    {copy.columnas.greedy}
                  </th>
                  <th className="px-4 py-2 text-right">
                    {copy.columnas.arbitraje}
                  </th>
                  <th className="px-4 py-2">{copy.columnas.diferencia}</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr
                    key={f.label}
                    className={
                      f.destacar
                        ? "border-b border-slate-100 bg-action/5"
                        : "border-b border-slate-100"
                    }
                  >
                    <td
                      className={`px-4 py-2 ${f.destacar ? "font-medium text-ink-primary" : "text-ink-secondary"}`}
                    >
                      {f.label}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {f.g}
                    </td>
                    <td
                      className={`px-4 py-2 text-right tabular-nums ${f.destacar ? "font-semibold text-action" : ""}`}
                    >
                      {f.a}
                    </td>
                    <td className="px-4 py-2 text-xs text-ink-secondary">
                      {f.diff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-card border-l-4 border-action bg-action/5 p-4">
        <p className="text-sm text-ink-secondary">
          <span className="font-semibold text-ink-primary">
            {copy.recomendacionPrefijo}{" "}
          </span>
          {data.recomendacion}
        </p>
      </div>
    </section>
  );
}

function diffMwh(g: number, a: number): string {
  if (g === 0 && a === 0) return "—";
  const diff = a - g;
  const signo = diff >= 0 ? "+" : "";
  return `${signo}${diff.toFixed(1)} MWh (arbitraje vs greedy)`;
}

function diffCiclos(g: number, a: number): string {
  if (g === 0 && a === 0) return "—";
  const diff = g - a;
  return diff > 0
    ? `Greedy usa más la batería (+${diff.toFixed(0)} ciclos)`
    : `Arbitraje usa más la batería (+${(-diff).toFixed(0)} ciclos)`;
}

function diffVeces(g: number, a: number, unidad: string): string {
  if (a <= 0 && g <= 0) return "—";
  if (g <= 0) return `Solo arbitraje entrega ${unidad} en hora-punta`;
  const ratio = a / g;
  if (ratio >= 1) {
    return `Arbitraje entrega ${ratio.toFixed(1)}× más ${unidad} en hora-punta`;
  }
  return `Greedy entrega ${(1 / ratio).toFixed(1)}× más ${unidad} en hora-punta`;
}
