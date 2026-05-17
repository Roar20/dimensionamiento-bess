import type { EstadoHorario } from "@/types/bess";

export type PuntoDespachoPromedio = {
  /** Hora-ending 1..24 (convención CFE). */
  hora: number;
  /** kW promedio del SFV en esa hora del día. */
  gen_kw: number;
  /** Potencia promedio cargando el BESS en esa hora. */
  carga_kw: number;
  /** Potencia promedio descargando el BESS en esa hora. */
  descarga_kw: number;
  /** SoC promedio normalizado a la capacidad útil (0-100). */
  soc_pct: number;
};

export function calcularDespachoDiarioPromedio(
  detalle: readonly EstadoHorario[],
  cap_util_kwh: number
): PuntoDespachoPromedio[] {
  const sumas: Array<{
    gen: number;
    carga: number;
    descarga: number;
    soc: number;
    n: number;
  }> = Array.from({ length: 24 }, () => ({
    gen: 0,
    carga: 0,
    descarga: 0,
    soc: 0,
    n: 0,
  }));

  for (const e of detalle) {
    const idx = e.timestamp.getHours(); // 0..23 = hora-ending 1..24 índice
    const bucket = sumas[idx]!;
    bucket.gen += e.gen_mwh * 1000;
    bucket.carga += e.cargado_kwh;
    bucket.descarga += e.descargado_kwh;
    bucket.soc += cap_util_kwh > 0 ? (e.soc_kwh / cap_util_kwh) * 100 : 0;
    bucket.n += 1;
  }

  return sumas.map((b, i) => {
    const n = b.n || 1;
    return {
      hora: i + 1,
      gen_kw: b.gen / n,
      carga_kw: b.carga / n,
      descarga_kw: b.descarga / n,
      soc_pct: b.soc / n,
    };
  });
}
