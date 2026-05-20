import type { RegistroHorario } from "@/types/sfv";

/**
 * Cálculo del excedente sobre POI agregado por (mes, hora). Lo usa el
 * heatmap del Tab SFV y la lectura interpretativa que sugiere ventana
 * de captura BESS.
 *
 * Decisión arquitectural (D-SFV-04 — ver docs/DECISIONS.md):
 *  - El excedente físico se calcula como Σ max(0, potencia_h − POI) por
 *    hora dentro del mes, no como neto (MTR − MDA).
 *  - La ventana P80 se obtiene por expansión simétrica greedy desde la
 *    hora pico; válido porque la distribución horaria del excedente
 *    solar es unimodal (una sola joroba alrededor del mediodía).
 */

export interface CeldaHeatmap {
  /** Mes 1..12 (enero = 1). */
  mes: number;
  /** Hora del día 0..23 (hora-ending convention: hora 0 = intervalo 00:00–01:00). */
  hora: number;
  /** Promedio del excedente sobre POI en esa (mes, hora) considerando solo días del mes. */
  excedenteKwh: number;
}

export interface VentanaP80 {
  /** Hora más temprana de la ventana (0..23). */
  horaInicio: number;
  /** Hora más tardía de la ventana (0..23). */
  horaFin: number;
  /** Cantidad de horas (horaFin - horaInicio + 1). */
  horasDuracion: number;
  /**
   * Piso de horas de almacenamiento sugerido para descargar después de
   * horaFin hasta `horaFinDescarga`. Mínimo 4 horas por convención BESS.
   */
  duracionBessMinima: number;
}

export interface TopHoraMes {
  mes: number;
  hora: number;
  excedenteKwh: number;
}

export interface ResultadoHeatmap {
  /** 12 × 24 celdas, ordenadas (mes asc, hora asc). */
  celdas: CeldaHeatmap[];
  /** Excedente anual total agregado (kWh). */
  excedenteAnualKwh: number;
  /** Ventana que contiene >= 80% del excedente anual. null si no hay excedente. */
  ventanaP80: VentanaP80 | null;
  /** Top 10 combinaciones (mes, hora) con mayor excedente promedio. Vacío si no hay excedente. */
  topHoraMes: TopHoraMes[];
}

const HORA_FIN_DESCARGA_DEFAULT_CFE_GDMTH = 22;

/**
 * Cálculo principal. Función pura. No depende de hooks ni de I/O.
 *
 * @param registros Registros horarios validados por el loader Excel.
 * @param poiKw Capacidad autorizada en el POI (kW).
 * @param horaFinDescarga Hora de fin de descarga para dimensionar duración
 *   BESS mínima. Default 22 (CFE GDMTH estándar 18–22). Explícito en la
 *   firma para portabilidad a offtakers con TOU distinto.
 */
export function calcularExcedenteHoraMes(
  registros: readonly RegistroHorario[],
  poiKw: number,
  horaFinDescarga: number = HORA_FIN_DESCARGA_DEFAULT_CFE_GDMTH
): ResultadoHeatmap {
  // Suma y conteo de días distintos por (mes, hora). Promedio = suma / conteo.
  // Los días con potencia ≤ POI contribuyen 0 al numerador pero SÍ al
  // denominador (el "promedio del mes" es promedio sobre todos los días
  // del mes que tienen ese hueco horario, no solo sobre los días con
  // excedente). Esto evita inflar artificialmente los promedios de
  // meses con pocos excedentes.
  const sumaPorMesHora = new Map<string, number>();
  const diasPorMesHora = new Map<string, Set<string>>();

  for (const r of registros) {
    const t = r.timestamp;
    const mes = t.getMonth() + 1;
    const hora = t.getHours();
    const fechaDia = `${t.getFullYear()}-${mes}-${t.getDate()}`;
    const key = `${mes}|${hora}`;

    const potenciaKw = r.potencia_kw_prom;
    const excedente_kwh = Math.max(0, potenciaKw - poiKw); // 1h × kW → kWh

    sumaPorMesHora.set(key, (sumaPorMesHora.get(key) ?? 0) + excedente_kwh);
    let dias = diasPorMesHora.get(key);
    if (!dias) {
      dias = new Set<string>();
      diasPorMesHora.set(key, dias);
    }
    dias.add(fechaDia);
  }

  const celdas: CeldaHeatmap[] = [];
  let excedenteAnualKwh = 0;
  for (let mes = 1; mes <= 12; mes += 1) {
    for (let hora = 0; hora < 24; hora += 1) {
      const key = `${mes}|${hora}`;
      const suma = sumaPorMesHora.get(key) ?? 0;
      const dias = diasPorMesHora.get(key)?.size ?? 0;
      const promedio = dias > 0 ? suma / dias : 0;
      celdas.push({ mes, hora, excedenteKwh: promedio });
      excedenteAnualKwh += suma;
    }
  }

  const ventanaP80 =
    excedenteAnualKwh > 0
      ? calcularVentanaP80(registros, poiKw, horaFinDescarga)
      : null;

  const topHoraMes: TopHoraMes[] =
    excedenteAnualKwh > 0
      ? [...celdas]
          .sort((a, b) => b.excedenteKwh - a.excedenteKwh)
          .slice(0, 10)
          .filter((c) => c.excedenteKwh > 0)
          .map((c) => ({ mes: c.mes, hora: c.hora, excedenteKwh: c.excedenteKwh }))
      : [];

  return { celdas, excedenteAnualKwh, ventanaP80, topHoraMes };
}

/**
 * Expansión greedy simétrica desde la hora pico hasta cubrir ≥ 80% del
 * excedente anual. La distribución solar es unimodal alrededor del
 * mediodía, así que greedy es óptimo aquí (no requiere DP ni búsqueda
 * combinatoria).
 *
 * `duracionBessMinima = max(4, ceil(horaFinDescarga - horaFin))`.
 */
function calcularVentanaP80(
  registros: readonly RegistroHorario[],
  poiKw: number,
  horaFinDescarga: number
): VentanaP80 {
  const excedentePorHora = new Array<number>(24).fill(0);
  for (const r of registros) {
    const hora = r.timestamp.getHours();
    const e = Math.max(0, r.potencia_kw_prom - poiKw);
    excedentePorHora[hora] = (excedentePorHora[hora] ?? 0) + e;
  }

  const total = excedentePorHora.reduce((a, b) => a + b, 0);
  // Caller solo entra aquí si total > 0, pero defendemos por seguridad.
  if (total <= 0) {
    return {
      horaInicio: 0,
      horaFin: 0,
      horasDuracion: 1,
      duracionBessMinima: 4,
    };
  }

  // Identificar hora pico. En caso de empate (varias horas con el mismo
  // máximo), elegimos la mediana del plateau para que la expansión
  // simétrica arranque desde el centro de la distribución y no esté
  // sesgada al primer empate (más estable para datasets degenerados o
  // con resolución limitada).
  let valorMax = -Infinity;
  const candidatos: number[] = [];
  for (let h = 0; h < 24; h += 1) {
    const v = excedentePorHora[h] ?? 0;
    if (v > valorMax) {
      valorMax = v;
      candidatos.length = 0;
      candidatos.push(h);
    } else if (v === valorMax) {
      candidatos.push(h);
    }
  }
  const horaPico = candidatos[Math.floor(candidatos.length / 2)] ?? 0;

  let inicio = horaPico;
  let fin = horaPico;
  let acumulado = excedentePorHora[horaPico] ?? 0;
  // Expansión simétrica: alterna lado mientras quepan vecinos. Cuando un
  // lado está agotado, sigue por el otro hasta cubrir el 80%.
  let lado: "izq" | "der" = "izq";
  while (acumulado / total < 0.8 && (inicio > 0 || fin < 23)) {
    if (lado === "izq" && inicio > 0) {
      inicio -= 1;
      acumulado += excedentePorHora[inicio] ?? 0;
    } else if (lado === "der" && fin < 23) {
      fin += 1;
      acumulado += excedentePorHora[fin] ?? 0;
    } else if (inicio > 0) {
      inicio -= 1;
      acumulado += excedentePorHora[inicio] ?? 0;
    } else if (fin < 23) {
      fin += 1;
      acumulado += excedentePorHora[fin] ?? 0;
    }
    lado = lado === "izq" ? "der" : "izq";
  }

  return {
    horaInicio: inicio,
    horaFin: fin,
    horasDuracion: fin - inicio + 1,
    duracionBessMinima: Math.max(4, Math.ceil(horaFinDescarga - fin)),
  };
}
