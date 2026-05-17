import type { RegistroHorario } from "@/types/sfv";

export type Granularidad =
  | "anual"
  | "semestral"
  | "trimestral"
  | "mensual"
  | "diario";

export type PeriodoActivo = {
  granularidad: Granularidad;
  /** Inicio del periodo (inclusive). */
  fechaInicio: Date;
  /** Fin del periodo (exclusive). */
  fechaFin: Date;
  /** Label legible: "2025", "Septiembre 2025", "15 de marzo de 2025". */
  label: string;
  /** Identificador estable para usar como key/value de selects. */
  id: string;
};

const MESES_LARGOS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MESES_CORTOS_DIA = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function fechaISO(ts: Date): string {
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function filtrarRegistros(
  registros: readonly RegistroHorario[],
  periodo: PeriodoActivo
): RegistroHorario[] {
  return registros.filter(
    (r) =>
      r.timestamp.getTime() >= periodo.fechaInicio.getTime() &&
      r.timestamp.getTime() < periodo.fechaFin.getTime()
  );
}

export function calcularPeriodosDisponibles(
  registros: readonly RegistroHorario[],
  granularidad: Granularidad
): PeriodoActivo[] {
  if (registros.length === 0) return [];

  if (granularidad === "anual") {
    const anios = new Set<number>();
    for (const r of registros) anios.add(r.timestamp.getFullYear());
    return [...anios].sort().map((anio) => construirPeriodoAnual(anio));
  }

  if (granularidad === "semestral") {
    const anios = new Set<number>();
    for (const r of registros) anios.add(r.timestamp.getFullYear());
    const periodos: PeriodoActivo[] = [];
    for (const anio of [...anios].sort()) {
      periodos.push(construirPeriodoSemestral(anio, 1));
      periodos.push(construirPeriodoSemestral(anio, 2));
    }
    return periodos.filter((p) => tieneRegistros(registros, p));
  }

  if (granularidad === "trimestral") {
    const anios = new Set<number>();
    for (const r of registros) anios.add(r.timestamp.getFullYear());
    const periodos: PeriodoActivo[] = [];
    for (const anio of [...anios].sort()) {
      for (const q of [1, 2, 3, 4] as const) {
        periodos.push(construirPeriodoTrimestral(anio, q));
      }
    }
    return periodos.filter((p) => tieneRegistros(registros, p));
  }

  if (granularidad === "mensual") {
    const claves = new Set<string>();
    for (const r of registros) {
      const y = r.timestamp.getFullYear();
      const m = r.timestamp.getMonth();
      claves.add(`${y}-${String(m + 1).padStart(2, "0")}`);
    }
    return [...claves]
      .sort()
      .map((c) => {
        const [yStr, mStr] = c.split("-");
        return construirPeriodoMensual(Number(yStr), Number(mStr) - 1);
      });
  }

  const claves = new Set<string>();
  for (const r of registros) claves.add(fechaISO(r.timestamp));
  return [...claves].sort().map((iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return construirPeriodoDiario(new Date(y!, m! - 1, d!));
  });
}

function tieneRegistros(
  registros: readonly RegistroHorario[],
  periodo: PeriodoActivo
): boolean {
  const ini = periodo.fechaInicio.getTime();
  const fin = periodo.fechaFin.getTime();
  for (const r of registros) {
    const t = r.timestamp.getTime();
    if (t >= ini && t < fin) return true;
  }
  return false;
}

export function construirPeriodoSemestral(
  anio: number,
  semestre: 1 | 2
): PeriodoActivo {
  if (semestre === 1) {
    return {
      granularidad: "semestral",
      fechaInicio: new Date(anio, 0, 1, 0, 0, 0, 0),
      fechaFin: new Date(anio, 6, 1, 0, 0, 0, 0),
      label: `S1 ${anio} (ene–jun)`,
      id: `semestral:${anio}-S1`,
    };
  }
  return {
    granularidad: "semestral",
    fechaInicio: new Date(anio, 6, 1, 0, 0, 0, 0),
    fechaFin: new Date(anio + 1, 0, 1, 0, 0, 0, 0),
    label: `S2 ${anio} (jul–dic)`,
    id: `semestral:${anio}-S2`,
  };
}

const TRIMESTRES: Array<{
  num: 1 | 2 | 3 | 4;
  mesIni: number;
  mesFin: number;
  label: string;
}> = [
  { num: 1, mesIni: 0, mesFin: 3, label: "ene–mar" },
  { num: 2, mesIni: 3, mesFin: 6, label: "abr–jun" },
  { num: 3, mesIni: 6, mesFin: 9, label: "jul–sep" },
  { num: 4, mesIni: 9, mesFin: 12, label: "oct–dic" },
];

export function construirPeriodoTrimestral(
  anio: number,
  trimestre: 1 | 2 | 3 | 4
): PeriodoActivo {
  const t = TRIMESTRES[trimestre - 1]!;
  const fechaInicio = new Date(anio, t.mesIni, 1, 0, 0, 0, 0);
  const fechaFin =
    t.mesFin === 12
      ? new Date(anio + 1, 0, 1, 0, 0, 0, 0)
      : new Date(anio, t.mesFin, 1, 0, 0, 0, 0);
  return {
    granularidad: "trimestral",
    fechaInicio,
    fechaFin,
    label: `Q${t.num} ${anio} (${t.label})`,
    id: `trimestral:${anio}-Q${t.num}`,
  };
}

export function construirPeriodoAnual(anio: number): PeriodoActivo {
  return {
    granularidad: "anual",
    fechaInicio: new Date(anio, 0, 1, 0, 0, 0, 0),
    fechaFin: new Date(anio + 1, 0, 1, 0, 0, 0, 0),
    label: String(anio),
    id: `anual:${anio}`,
  };
}

export function construirPeriodoMensual(
  anio: number,
  mes0Indexado: number
): PeriodoActivo {
  return {
    granularidad: "mensual",
    fechaInicio: new Date(anio, mes0Indexado, 1, 0, 0, 0, 0),
    fechaFin: new Date(anio, mes0Indexado + 1, 1, 0, 0, 0, 0),
    label: `${MESES_LARGOS[mes0Indexado]} ${anio}`,
    id: `mensual:${anio}-${String(mes0Indexado + 1).padStart(2, "0")}`,
  };
}

export function construirPeriodoDiario(fecha: Date): PeriodoActivo {
  const inicio = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    0,
    0,
    0,
    0
  );
  const fin = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate() + 1,
    0,
    0,
    0,
    0
  );
  return {
    granularidad: "diario",
    fechaInicio: inicio,
    fechaFin: fin,
    label: `${inicio.getDate()} de ${MESES_CORTOS_DIA[inicio.getMonth()]} de ${inicio.getFullYear()}`,
    id: `diario:${fechaISO(inicio)}`,
  };
}

export function nombreMes(mes0Indexado: number): string {
  return MESES_LARGOS[mes0Indexado] ?? "";
}
