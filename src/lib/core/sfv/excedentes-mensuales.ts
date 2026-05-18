import type { RegistroHorario } from "@/types/sfv";

import { redondear } from "./_utils";

export type ExcedenteMensual = {
  /** "YYYY-MM" para ordenamiento y agrupamiento. */
  mes: string;
  /** Etiqueta corta para chart ("Ene", "Feb", …, "Dic"). */
  mes_label: string;
  /** MWh excedente del mes (suma de `max(0, gen_h − POI_kWh)` por hora). */
  excedente_mwh: number;
};

const MES_CORTO = [
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

/**
 * Agrega excedentes (energía generada por encima del techo POI) por mes.
 *
 * El excedente horario es `max(0, energia_mwh − poi_kw/1000)`; se suma por
 * mes. El array sale ordenado cronológicamente y SIEMPRE cubre los 12 meses
 * del año (o de los años) presentes en `registros`, rellenando con 0 los
 * meses sin generación reportada.
 */
export function agregarExcedentesPorMes(
  registros: readonly RegistroHorario[],
  poi_kw: number
): ExcedenteMensual[] {
  if (!Number.isFinite(poi_kw) || poi_kw <= 0) {
    throw new Error("poi_kw debe ser un número positivo.");
  }
  if (registros.length === 0) return [];

  const poi_mwh_h = poi_kw / 1000;
  const acumPorMes = new Map<string, number>();
  let anioMin = Infinity;
  let anioMax = -Infinity;

  for (const r of registros) {
    const anio = r.timestamp.getFullYear();
    const mes = r.timestamp.getMonth();
    const clave = `${anio}-${String(mes + 1).padStart(2, "0")}`;
    const excedente = Math.max(0, r.energia_mwh - poi_mwh_h);
    acumPorMes.set(clave, (acumPorMes.get(clave) ?? 0) + excedente);
    if (anio < anioMin) anioMin = anio;
    if (anio > anioMax) anioMax = anio;
  }

  const resultado: ExcedenteMensual[] = [];
  for (let anio = anioMin; anio <= anioMax; anio += 1) {
    for (let m = 0; m < 12; m += 1) {
      const clave = `${anio}-${String(m + 1).padStart(2, "0")}`;
      resultado.push({
        mes: clave,
        mes_label: MES_CORTO[m]!,
        excedente_mwh: redondear(acumPorMes.get(clave) ?? 0, 4),
      });
    }
  }

  return resultado;
}
