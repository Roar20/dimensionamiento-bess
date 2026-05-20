import type { RegistroHorario } from "@/types/sfv";

/**
 * Indicadores de calidad del dataset cargado. Es una caracterización del
 * archivo Excel del usuario, no del recurso solar — vive aparte del motor
 * de cálculo (`src/lib/core/sfv.ts`) para mantener responsabilidades
 * separadas.
 *
 * MVP — alcance del PR P1+P3:
 *  - Cobertura temporal: registros recibidos vs horas calendario del año.
 *  - Días con generación: días con ≥1 registro > 0 vs total de días del año.
 *  - Anomalías: días con caída >30% contra promedio móvil simétrico 7d.
 *    Señal de revisión, NO diagnóstico climático.
 *  - Granularidad: derivada del diff de timestamps, no hardcodeada.
 */

export type Granularidad = {
  /** Etiqueta para UI: "1 h", "30 min", etc. */
  etiqueta: string;
  /** Minutos detectados entre registros consecutivos (mediana). */
  minutos: number;
};

export type AnomaliaDia = {
  /** Fecha local YYYY-MM-DD del día con caída. */
  fecha: string;
  /** Energía total del día (MWh). */
  energia_dia_mwh: number;
  /** Promedio móvil esperado para ese día (MWh). */
  esperado_mwh: number;
  /** Porcentaje de caída respecto al esperado, valor positivo. */
  caida_pct: number;
};

export type CalidadDataset = {
  cobertura: {
    /** Cantidad de registros en el dataset. */
    recibidos: number;
    /** Cantidad esperada para un año completo (8760 u 8784 bisiesto, según granularidad horaria). */
    esperados: number;
    /** Porcentaje (0–100). */
    pct: number;
    /** True si la cobertura está por debajo del 95%. */
    warn: boolean;
  };
  diasConGeneracion: {
    /** Días distintos con al menos un registro de potencia > 0. */
    activos: number;
    /** Días del año calendario (365 o 366 bisiesto). */
    totales: number;
    /** Porcentaje (0–100). */
    pct: number;
  };
  anomalias: {
    /** Lista de anomalías detectadas, ordenada cronológicamente. */
    lista: AnomaliaDia[];
    /** Total para mostrar en la UI. */
    total: number;
  };
  granularidad: Granularidad;
};

/** Año bisiesto en el calendario gregoriano. */
export function esBisiesto(anio: number): boolean {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;
}

/** Horas en el año calendario. 8784 si bisiesto, 8760 en otro caso. */
export function horasEnAnioCalendario(anio: number): number {
  return esBisiesto(anio) ? 8784 : 8760;
}

/** Días en el año calendario. */
export function diasEnAnioCalendario(anio: number): number {
  return esBisiesto(anio) ? 366 : 365;
}

/**
 * Mediana de los diffs de timestamps consecutivos, en minutos. Si el
 * dataset tiene menos de 2 registros se asume 60 min como fallback.
 */
function detectarGranularidadMinutos(
  registros: readonly RegistroHorario[]
): number {
  if (registros.length < 2) return 60;
  const diffs: number[] = [];
  for (let i = 1; i < registros.length; i += 1) {
    const a = registros[i - 1]!.timestamp.getTime();
    const b = registros[i]!.timestamp.getTime();
    const delta = Math.round((b - a) / 60_000);
    if (delta > 0) diffs.push(delta);
  }
  if (diffs.length === 0) return 60;
  diffs.sort((a, b) => a - b);
  const mid = diffs[Math.floor(diffs.length / 2)]!;
  return mid;
}

function etiquetarGranularidad(minutos: number): string {
  if (minutos >= 60 && minutos % 60 === 0) {
    return minutos === 60 ? "1 h" : `${minutos / 60} h`;
  }
  return `${minutos} min`;
}

/** Clave YYYY-MM-DD en hora local del timestamp. */
function claveFechaLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/** Suma de `energia_mwh` agrupada por día local. */
function energiaPorDia(
  registros: readonly RegistroHorario[]
): Map<string, number> {
  const out = new Map<string, number>();
  for (const r of registros) {
    const k = claveFechaLocal(r.timestamp);
    out.set(k, (out.get(k) ?? 0) + r.energia_mwh);
  }
  return out;
}

/**
 * Detecta anomalías como caída >30% respecto al promedio móvil simétrico
 * de 7 días (3 antes + 3 después + el propio día). Si el día actual o el
 * esperado son <= 0 (noche larga, dataset parcial), se omite — un cero
 * no es una anomalía calculable.
 *
 * Trade-off MVP: no descuenta estacionalidad esperada (eso requeriría
 * modelo climático fuera del alcance del PR).
 */
function detectarAnomalias(
  energiaDia: Map<string, number>
): AnomaliaDia[] {
  const fechas = Array.from(energiaDia.keys()).sort();
  const valores = fechas.map((f) => energiaDia.get(f) ?? 0);
  const out: AnomaliaDia[] = [];
  for (let i = 0; i < fechas.length; i += 1) {
    const ini = Math.max(0, i - 3);
    const fin = Math.min(fechas.length - 1, i + 3);
    let suma = 0;
    let n = 0;
    for (let j = ini; j <= fin; j += 1) {
      suma += valores[j]!;
      n += 1;
    }
    const esperado = n > 0 ? suma / n : 0;
    const actual = valores[i]!;
    if (actual <= 0 || esperado <= 0) continue;
    const caida_pct = ((esperado - actual) / esperado) * 100;
    if (caida_pct > 30) {
      out.push({
        fecha: fechas[i]!,
        energia_dia_mwh: actual,
        esperado_mwh: esperado,
        caida_pct,
      });
    }
  }
  return out;
}

/** Calcula los 4 indicadores. Función pura, no depende de hooks ni I/O. */
export function calcularCalidadDataset(
  registros: readonly RegistroHorario[],
  anio: number
): CalidadDataset {
  const minutos = detectarGranularidadMinutos(registros);
  const horasEsperadas = horasEnAnioCalendario(anio);
  // En el MVP los registros son horarios; cada registro = 1 hora. Si entra
  // un dataset con granularidad ≠ 60 min, ajustamos el denominador para
  // mantener la cobertura comparable (esperados = horas × 60/min).
  const registrosEsperados = Math.round((horasEsperadas * 60) / minutos);
  const recibidos = registros.length;
  const pctCobertura =
    registrosEsperados > 0 ? (recibidos / registrosEsperados) * 100 : 0;

  const energiaDia = energiaPorDia(registros);
  const diasActivos = Array.from(energiaDia.values()).filter(
    (v) => v > 0
  ).length;
  const diasTotales = diasEnAnioCalendario(anio);
  const pctDias = diasTotales > 0 ? (diasActivos / diasTotales) * 100 : 0;

  const anomalias = detectarAnomalias(energiaDia);

  return {
    cobertura: {
      recibidos,
      esperados: registrosEsperados,
      pct: pctCobertura,
      warn: pctCobertura < 95,
    },
    diasConGeneracion: {
      activos: diasActivos,
      totales: diasTotales,
      pct: pctDias,
    },
    anomalias: {
      lista: anomalias,
      total: anomalias.length,
    },
    granularidad: {
      etiqueta: etiquetarGranularidad(minutos),
      minutos,
    },
  };
}
