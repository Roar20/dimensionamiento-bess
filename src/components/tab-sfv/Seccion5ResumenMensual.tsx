import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  agregarPorMes,
  resumenMensualACSV,
  type ResumenMes,
} from "@/lib/tab-sfv/agregaciones-mensuales";
import { COPY_M2 } from "@/lib/copy/modulo-2";
import { formatFechaLarga } from "@/lib/tab-sfv/narrativa";
import type { ConfiguracionPlanta, RegistroHorario } from "@/types/sfv";

import { BloqueTecnico } from "./BloqueTecnico";
import { NarrativaIntro } from "./NarrativaIntro";

interface Props {
  registros: readonly RegistroHorario[];
  config: ConfiguracionPlanta;
  anio: number;
}

const FORMATO_MWH = new Intl.NumberFormat("es-MX", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function Seccion5ResumenMensual({ registros, config, anio }: Props) {
  const copy = COPY_M2.seccion5;

  const resumen = useMemo<ResumenMes[]>(
    () => agregarPorMes(registros as RegistroHorario[]),
    [registros]
  );

  if (resumen.length === 0) return null;

  const exportar = () => {
    const csv = resumenMensualACSV(resumen);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const slug = config.nombre.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    a.href = url;
    a.download = `${slug}-resumen-mensual-${anio}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      <NarrativaIntro titulo={copy.titulo} texto={copy.descripcion} />

      <div className="overflow-x-auto rounded-card border border-brand-cardBorder bg-white shadow-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-brand-cardBorder bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-helper">
              <th className="px-3 py-2">{copy.tabla.mes}</th>
              <th className="px-3 py-2 text-right">{copy.tabla.energia}</th>
              <th className="px-3 py-2 text-right">{copy.tabla.pico}</th>
              <th className="px-3 py-2 text-right">{copy.tabla.dias}</th>
              <th className="px-3 py-2 text-right">{copy.tabla.horaPico}</th>
              <th className="px-3 py-2">{copy.tabla.mejorDia}</th>
              <th className="px-3 py-2">{copy.tabla.peorDia}</th>
            </tr>
          </thead>
          <tbody>
            {resumen.map((r) => (
              <tr
                key={`${r.anio}-${r.mes}`}
                className="border-b border-slate-100"
              >
                <td className="px-3 py-2 font-medium text-ink-primary">
                  {r.nombre}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {FORMATO_MWH.format(r.energia_mwh)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.pico_kw.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.dias_con_generacion}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {r.hora_pico_promedio !== null
                    ? `${r.hora_pico_promedio}h`
                    : copy.tabla.sinDato}
                </td>
                <td className="px-3 py-2 text-ink-secondary">
                  {r.mejor_dia_fecha ? (
                    <>
                      {formatFechaLarga(r.mejor_dia_fecha)} ·{" "}
                      <span className="tabular-nums">
                        {FORMATO_MWH.format(r.mejor_dia_mwh)} MWh
                      </span>
                    </>
                  ) : (
                    copy.tabla.sinDato
                  )}
                </td>
                <td className="px-3 py-2 text-ink-secondary">
                  {r.peor_dia_fecha ? (
                    <>
                      {formatFechaLarga(r.peor_dia_fecha)} ·{" "}
                      <span className="tabular-nums">
                        {FORMATO_MWH.format(r.peor_dia_mwh)} MWh
                      </span>
                    </>
                  ) : (
                    copy.tabla.sinDato
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BloqueTecnico titulo={copy.tecnico.titulo}>
        <Button type="button" variant="outline" onClick={exportar}>
          {copy.tecnico.boton}
        </Button>
      </BloqueTecnico>
    </section>
  );
}
