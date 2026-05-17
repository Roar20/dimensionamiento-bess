import type { EstadoHorario, ResultadoSimulacion } from "@/types/bess";
import type { PeriodoActivo } from "@/lib/tab-sfv/filtrar-por-periodo";

export function filtrarDetalle(
  detalle: readonly EstadoHorario[],
  periodo: PeriodoActivo | null
): EstadoHorario[] {
  if (!periodo) return [...detalle];
  const ini = periodo.fechaInicio.getTime();
  const fin = periodo.fechaFin.getTime();
  return detalle.filter((e) => {
    const t = e.timestamp.getTime();
    return t >= ini && t < fin;
  });
}

export function filtrarSimulacion(
  sim: ResultadoSimulacion,
  periodo: PeriodoActivo | null
): ResultadoSimulacion {
  return {
    ...sim,
    detalle_horario: filtrarDetalle(sim.detalle_horario, periodo),
  };
}

/** Cuenta días distintos (YYYY-MM-DD) en el detalle. */
export function contarDiasDistintos(
  detalle: readonly EstadoHorario[]
): number {
  const dias = new Set<string>();
  for (const e of detalle) {
    const y = e.timestamp.getFullYear();
    const m = String(e.timestamp.getMonth() + 1).padStart(2, "0");
    const d = String(e.timestamp.getDate()).padStart(2, "0");
    dias.add(`${y}-${m}-${d}`);
  }
  return dias.size;
}
