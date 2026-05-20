import type { RegistroHorario } from "@/types/sfv";

/**
 * Estadísticas de dispersión de generación diaria por mes. Insumo del
 * boxplot del Tab SFV.
 *
 * Convención: una "generación diaria" es la suma de energía (kWh) de
 * todas las horas del día calendario. Días con energía total = 0 se
 * excluyen — no representan datos válidos del recurso.
 */

export interface DiaExtremo {
  /** Fecha del día (zona horaria local del registro). */
  fecha: Date;
  /** Energía total del día en kWh. */
  energiaKwh: number;
}

export interface EstadisticasMensuales {
  /** Mes 1..12. */
  mes: number;
  /** Mínimo de energía diaria del mes (kWh). */
  min: number;
  /** Percentil 25. */
  p25: number;
  /** Mediana. */
  mediana: number;
  /** Percentil 75. */
  p75: number;
  /** Máximo. */
  max: number;
  /** Días con energía > 0 considerados en el cálculo. */
  diasContados: number;
  /** Día de mayor energía del mes (`null` si el mes no tuvo días con energía > 0). */
  mejorDia: DiaExtremo | null;
  /** Día de menor energía no-nula del mes (`null` si el mes no tuvo días con energía > 0). */
  peorDia: DiaExtremo | null;
}

/**
 * Devuelve siempre 12 entradas (enero..diciembre). Meses sin datos
 * válidos retornan estadísticas en cero y mejor/peor día en null.
 */
export function calcularDispersionDiaria(
  registros: readonly RegistroHorario[]
): EstadisticasMensuales[] {
  // Energía total por día calendario, agrupada por mes.
  type AcumDia = { fechaYmd: string; mes: number; dia: number; year: number; energiaKwh: number };
  const porFecha = new Map<string, AcumDia>();

  for (const r of registros) {
    const t = r.timestamp;
    const year = t.getFullYear();
    const mes = t.getMonth() + 1;
    const dia = t.getDate();
    const key = `${year}-${mes}-${dia}`;
    let acc = porFecha.get(key);
    if (!acc) {
      acc = { fechaYmd: key, mes, dia, year, energiaKwh: 0 };
      porFecha.set(key, acc);
    }
    acc.energiaKwh += r.energia_mwh * 1000; // MWh → kWh
  }

  // Agrupar por mes.
  const porMes = new Map<number, AcumDia[]>();
  for (const d of porFecha.values()) {
    let bucket = porMes.get(d.mes);
    if (!bucket) {
      bucket = [];
      porMes.set(d.mes, bucket);
    }
    bucket.push(d);
  }

  const out: EstadisticasMensuales[] = [];
  for (let mes = 1; mes <= 12; mes += 1) {
    const bucket = porMes.get(mes) ?? [];
    const conEnergia = bucket.filter((d) => d.energiaKwh > 0);
    if (conEnergia.length === 0) {
      out.push({
        mes,
        min: 0,
        p25: 0,
        mediana: 0,
        p75: 0,
        max: 0,
        diasContados: 0,
        mejorDia: null,
        peorDia: null,
      });
      continue;
    }
    const valoresOrdenados = conEnergia
      .map((d) => d.energiaKwh)
      .sort((a, b) => a - b);
    const min = valoresOrdenados[0]!;
    const max = valoresOrdenados[valoresOrdenados.length - 1]!;
    const p25 = percentilLineal(valoresOrdenados, 0.25);
    const mediana = percentilLineal(valoresOrdenados, 0.5);
    const p75 = percentilLineal(valoresOrdenados, 0.75);

    // Mejor / peor: ordenar por energía y tomar extremos. En caso de
    // empate, el primero del orden estable (fecha asc por construcción
    // del Map insertion order — no estrictamente garantizado, pero
    // suficiente para el caso de uso).
    const ordenadosAsc = [...conEnergia].sort(
      (a, b) => a.energiaKwh - b.energiaKwh
    );
    const peor = ordenadosAsc[0]!;
    const mejor = ordenadosAsc[ordenadosAsc.length - 1]!;

    out.push({
      mes,
      min,
      p25,
      mediana,
      p75,
      max,
      diasContados: conEnergia.length,
      mejorDia: {
        fecha: new Date(mejor.year, mejor.mes - 1, mejor.dia),
        energiaKwh: mejor.energiaKwh,
      },
      peorDia: {
        fecha: new Date(peor.year, peor.mes - 1, peor.dia),
        energiaKwh: peor.energiaKwh,
      },
    });
  }

  return out;
}

/** Interpolación lineal entre los valores ordenados ascendentemente. */
function percentilLineal(ordenadoAsc: readonly number[], p: number): number {
  const n = ordenadoAsc.length;
  if (n === 0) return 0;
  if (n === 1) return ordenadoAsc[0]!;
  const idx = p * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return ordenadoAsc[lo]!;
  const t = idx - lo;
  return (ordenadoAsc[lo] ?? 0) * (1 - t) + (ordenadoAsc[hi] ?? 0) * t;
}
