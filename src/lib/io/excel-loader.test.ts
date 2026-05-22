import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { cargarArchivoSFV, detectarGranularidad } from "@/lib/io/excel-loader";
import {
  ErrorFormatoArchivo,
  type ConfiguracionPlanta,
  type RegistroHorario,
} from "@/types/sfv";

const CONFIG_BASE: ConfiguracionPlanta = {
  nombre: "Tequila 1",
  cliente: null,
  ubicacion: null,
  capacidad_poi_kw: 500,
  capacidad_instalada_kw: 500,
  zona_lmp: null,
  precio_ppa_mxn_mwh: null,
};

const HEADERS = [
  "Día de Operación",
  "Hora",
  "Energía Registrada [MWh]",
];

type Fila = Array<string | number | null>;

function construirArchivo(filas: Fila[], nombre = "fixture.xlsx"): File {
  const sheet = XLSX.utils.aoa_to_sheet(filas);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Reporte");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([buffer], nombre, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function diasDelAnio(anio: number): number {
  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0 ? 366 : 365;
}

function isoFecha(anio: number, mes1Indexado: number, dia: number): string {
  return `${anio}-${String(mes1Indexado).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function diasDelMes(anio: number, mes1Indexado: number): number {
  return new Date(anio, mes1Indexado, 0).getDate();
}

/**
 * Replica la estructura real del reporte de Tequila: columna 0 de padding,
 * datos en columnas 1..3, y entre cada mes una fila vacía, una fila
 * "Total general | null | <total mensual>", y otra fila vacía.
 * Incluye también el total anual al final.
 */
function generarFixtureMensualizadoTequila(anio: number, energiaPorHora: number): Fila[] {
  const filas: Fila[] = [];
  // Header con padding column 0 vacío (real-world Tequila).
  filas.push([null, "Día de Operación", "Hora", "Energía Registrada [MWh]"]);
  let totalAnual = 0;
  for (let mes = 1; mes <= 12; mes += 1) {
    let totalMes = 0;
    const dias = diasDelMes(anio, mes);
    for (let d = 1; d <= dias; d += 1) {
      const fecha = isoFecha(anio, mes, d);
      for (let h = 1; h <= 24; h += 1) {
        filas.push([null, fecha, h, energiaPorHora]);
        totalMes += energiaPorHora;
      }
    }
    totalAnual += totalMes;
    // Separadores y total mensual (padding column).
    filas.push([null, null, null, null]);
    filas.push(["Total general", null, null, totalMes]);
    filas.push([null, null, null, null]);
  }
  filas.push(["Total general", null, null, totalAnual]);
  return filas;
}

function generarRegistrosAnio(anio: number, energiaPorHora: number): Fila[] {
  const filas: Fila[] = [];
  const dias = diasDelAnio(anio);
  for (let d = 0; d < dias; d += 1) {
    const fecha = new Date(anio, 0, 1 + d);
    const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
    for (let h = 1; h <= 24; h += 1) {
      filas.push([fechaStr, h, energiaPorHora]);
    }
  }
  return filas;
}

describe("cargarArchivoSFV", () => {
  it("lee un día completo (24 registros) con suma de energía y pico correctos", async () => {
    const filas: Fila[] = [HEADERS];
    for (let h = 1; h <= 24; h += 1) {
      filas.push(["2025-03-15", h, h === 13 ? 0.45 : 0.1]);
    }
    const file = construirArchivo(filas);

    const { datos } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.registros).toHaveLength(24);
    const primer = datos.registros[0]!;
    expect(primer.timestamp.getHours()).toBe(0);
    expect(primer.timestamp.getFullYear()).toBe(2025);
    expect(primer.timestamp.getMonth()).toBe(2);
    expect(primer.timestamp.getDate()).toBe(15);

    const trecePm = datos.registros[12]!;
    expect(trecePm.timestamp.getHours()).toBe(12);
    expect(trecePm.energia_mwh).toBeCloseTo(0.45);
    expect(trecePm.potencia_kw_prom).toBeCloseTo(450);

    const totalEsperado = 23 * 0.1 + 0.45;
    expect(datos.meta.total_energia_mwh).toBeCloseTo(totalEsperado);
    expect(datos.meta.pico_horario_kw).toBeCloseTo(450);
    expect(datos.meta.horas_con_generacion).toBe(24);
  });

  it("salta filas de basura antes del header (header en fila 7)", async () => {
    const filas: Fila[] = [
      ["Desglose de Energía"],
      ["Información del cliente"],
      [],
      ["Otro texto"],
      [],
      [],
      HEADERS,
      ["2025-01-01", 1, 0.05],
      ["2025-01-01", 2, 0.08],
    ];
    const file = construirArchivo(filas);

    const { datos } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.registros).toHaveLength(2);
    expect(datos.meta.total_energia_mwh).toBeCloseTo(0.13);
  });

  it("ignora la fila 'Total general' al final", async () => {
    const filas: Fila[] = [
      HEADERS,
      ["2025-06-10", 1, 0.2],
      ["2025-06-10", 2, 0.3],
      ["Total general", null, 0.5],
    ];
    const file = construirArchivo(filas);

    const { datos } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.registros).toHaveLength(2);
    expect(datos.meta.total_energia_mwh).toBeCloseTo(0.5);
  });

  it("lanza ErrorFormatoArchivo si falta la columna 'Hora'", async () => {
    const filas: Fila[] = [
      ["Día de Operación", "Energía Registrada [MWh]"],
      ["2025-01-01", 0.1],
    ];
    const file = construirArchivo(filas);

    await expect(cargarArchivoSFV(file, CONFIG_BASE)).rejects.toBeInstanceOf(
      ErrorFormatoArchivo
    );
  });

  it("emite warning PICO_EXCEDE_POI cuando el pico supera el POI en >5%", async () => {
    const filas: Fila[] = [HEADERS];
    for (let h = 1; h <= 24; h += 1) {
      filas.push(["2025-04-01", h, h === 13 ? 0.6 : 0.1]);
    }
    const file = construirArchivo(filas);

    const { datos, warnings } = await cargarArchivoSFV(file, {
      ...CONFIG_BASE,
      capacidad_poi_kw: 500,
      capacidad_instalada_kw: 1000,
    });

    expect(datos.meta.pico_horario_kw).toBeCloseTo(600);
    expect(warnings.find((w) => w.codigo === "PICO_EXCEDE_POI")).toBeTruthy();
    expect(
      warnings.find((w) => w.codigo === "PICO_EXCEDE_INSTALADA")
    ).toBeUndefined();
  });

  it("emite warning HORAS_INCOMPLETAS cuando hay menos de 8,760 registros", async () => {
    const filas: Fila[] = [HEADERS];
    for (let i = 0; i < 100; i += 1) {
      const dia = Math.floor(i / 24) + 1;
      const hora = (i % 24) + 1;
      filas.push([`2025-01-${String(dia).padStart(2, "0")}`, hora, 0.1]);
    }
    const file = construirArchivo(filas);

    const { datos, warnings } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.meta.total_horas).toBe(100);
    expect(
      warnings.find((w) => w.codigo === "HORAS_INCOMPLETAS")
    ).toBeTruthy();
  });

  it("no emite HORAS_INCOMPLETAS para un año completo de 8,760 horas", async () => {
    const filas: Fila[] = [HEADERS, ...generarRegistrosAnio(2025, 0.1)];
    const file = construirArchivo(filas);

    const { datos, warnings } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.meta.total_horas).toBe(8760);
    expect(
      warnings.find((w) => w.codigo === "HORAS_INCOMPLETAS")
    ).toBeUndefined();
    expect(
      warnings.find((w) => w.codigo === "ANIO_NO_COMPLETO")
    ).toBeUndefined();
  });

  it("salta filas vacías y 'Total general' intermedios entre meses", async () => {
    // Enero (31 días × 24 h = 744) + separadores + total mensual +
    // febrero (28 días × 24 h = 672). El total mensual = 744 * 0.1 = 74.4.
    const filas: Fila[] = [
      [null, "Día de Operación", "Hora", "Energía Registrada [MWh]"],
    ];
    let totalEnero = 0;
    for (let d = 1; d <= 31; d += 1) {
      const fecha = `2025-01-${String(d).padStart(2, "0")}`;
      for (let h = 1; h <= 24; h += 1) {
        filas.push([null, fecha, h, 0.1]);
        totalEnero += 0.1;
      }
    }
    filas.push([null, null, null, null]);
    filas.push(["Total general", null, null, totalEnero]);
    filas.push([null, null, null, null]);
    for (let d = 1; d <= 28; d += 1) {
      const fecha = `2025-02-${String(d).padStart(2, "0")}`;
      for (let h = 1; h <= 24; h += 1) {
        filas.push([null, fecha, h, 0.1]);
      }
    }
    const file = construirArchivo(filas);

    const { datos } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.registros).toHaveLength(744 + 672);
    expect(datos.meta.total_horas).toBe(744 + 672);
    // El total mensual intermedio NO debe estar en los registros.
    expect(datos.registros.some((r) => r.energia_mwh === totalEnero)).toBe(false);
  });

  it("procesa archivo anual completo de 12 meses con totales intermedios (estructura real Tequila)", async () => {
    const filas = generarFixtureMensualizadoTequila(2025, 0.1042);
    const file = construirArchivo(filas);

    const { datos, warnings } = await cargarArchivoSFV(file, CONFIG_BASE);

    expect(datos.meta.total_horas).toBe(8760);
    expect(datos.meta.anio).toBe(2025);
    expect(
      warnings.find((w) => w.codigo === "HORAS_INCOMPLETAS")
    ).toBeUndefined();
    expect(
      warnings.find((w) => w.codigo === "ANIO_NO_COMPLETO")
    ).toBeUndefined();
    // Energía anual aproximada: 8760 * 0.1042 ≈ 912.79 MWh.
    expect(datos.meta.total_energia_mwh).toBeCloseTo(8760 * 0.1042, 1);
  });

  it("parsea fechas en formato es-MX DD/MM/YYYY sin perder registros", async () => {
    // Días 13..31 de cualquier mes son inválidos al pasar por `new Date()`
    // (V8 los interpreta como M/D/Y → mes 13 → NaN). El loader debe
    // detectar el formato DD/MM/YYYY explícitamente y mantener todos los
    // registros.
    const filas: Fila[] = [HEADERS];
    // Marzo 13-15, 3 días, 24 horas cada uno = 72 registros.
    for (const d of [13, 14, 15]) {
      const fecha = `${String(d).padStart(2, "0")}/03/2025`;
      for (let h = 1; h <= 24; h += 1) {
        filas.push([fecha, h, 0.1]);
      }
    }
    const { datos } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.registros).toHaveLength(72);
    // Los timestamps deben ser marzo, no enero ni febrero.
    expect(datos.registros[0]!.timestamp.getMonth()).toBe(2); // marzo = idx 2
    expect(datos.registros[0]!.timestamp.getDate()).toBe(13);
    expect(datos.registros[71]!.timestamp.getDate()).toBe(15);
  });

  it("también acepta fechas YYYY-MM-DD (formato ISO)", async () => {
    const filas: Fila[] = [HEADERS, ["2025-03-15", 12, 0.42]];
    const { datos } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.registros).toHaveLength(1);
    expect(datos.registros[0]!.timestamp.getMonth()).toBe(2);
    expect(datos.registros[0]!.timestamp.getDate()).toBe(15);
  });

  // ────────────────────────────────────────────────────────────────
  // Metadata: granularidad, periodo, cobertura
  // ────────────────────────────────────────────────────────────────

  it("archivo horario válido → granularidad 'horaria', mediana ≈ 60 min, sin warning de granularidad", async () => {
    const filas: Fila[] = [HEADERS];
    for (let h = 1; h <= 24; h += 1) {
      filas.push(["2025-03-15", h, 0.1]);
    }
    const { datos, warnings } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.meta.granularidad_detectada).toBe("horaria");
    expect(datos.meta.minutos_mediana_delta).toBeCloseTo(60, 6);
    expect(
      warnings.find((w) =>
        w.codigo.startsWith("GRANULARIDAD_")
      )
    ).toBeUndefined();
    expect(datos.meta.periodo_inicio?.getDate()).toBe(15);
    expect(datos.meta.periodo_fin?.getHours()).toBe(23);
  });

  it("serie horaria con hueco temporal grande sigue siendo 'horaria' (mediana, no promedio)", async () => {
    // Esta es la decisión técnica central de la pieza: la MEDIANA de
    // los deltas resiste un hueco aislado. Con 99 deltas de 60 min y
    // 1 delta de 48 h, el promedio sería ~88 min (rompería la
    // clasificación), pero la mediana sigue siendo 60.
    const filas: Fila[] = [HEADERS];
    // Bloque 1: 50 registros consecutivos enero 1-2 (días 1-2, 24h + 2h).
    for (let h = 1; h <= 24; h += 1) filas.push(["2025-01-01", h, 0.1]);
    for (let h = 1; h <= 24; h += 1) filas.push(["2025-01-02", h, 0.1]);
    for (let h = 1; h <= 2; h += 1) filas.push(["2025-01-03", h, 0.1]);
    // Hueco grande: saltamos del 03 02:00 al 05 03:00 (≈ 49 horas).
    for (let h = 3; h <= 24; h += 1) filas.push(["2025-01-05", h, 0.1]);
    for (let h = 1; h <= 24; h += 1) filas.push(["2025-01-06", h, 0.1]);

    const { datos, warnings } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.meta.granularidad_detectada).toBe("horaria");
    expect(datos.meta.minutos_mediana_delta).toBeCloseTo(60, 6);
    expect(
      warnings.find((w) =>
        w.codigo.startsWith("GRANULARIDAD_")
      )
    ).toBeUndefined();
  });

  it("detecta granularidad sub-horaria de 15 min sobre registros sintéticos", () => {
    // El formato Excel del loader fuerza Hora 1-24 (horario), así que
    // sub-horario no puede provenir de un .xlsx aceptado. Se valida
    // directamente sobre la función pura `detectarGranularidad`.
    const registros = registrosSinteticos(
      new Date(2025, 2, 15, 0, 0, 0, 0),
      96,
      15 * 60_000
    );
    const r = detectarGranularidad(registros);
    expect(r.granularidad).toBe("sub_horaria");
    expect(r.minutos_mediana_delta).toBeCloseTo(15, 6);
  });

  it("detecta granularidad sub-horaria de 5 min sobre registros sintéticos", () => {
    const registros = registrosSinteticos(
      new Date(2025, 2, 15, 0, 0, 0, 0),
      288,
      5 * 60_000
    );
    const r = detectarGranularidad(registros);
    expect(r.granularidad).toBe("sub_horaria");
    expect(r.minutos_mediana_delta).toBeCloseTo(5, 6);
  });

  it("detecta granularidad supra-horaria diaria sobre registros sintéticos", () => {
    const registros = registrosSinteticos(
      new Date(2025, 2, 1, 0, 0, 0, 0),
      30,
      24 * 60 * 60_000
    );
    const r = detectarGranularidad(registros);
    expect(r.granularidad).toBe("supra_horaria");
    expect(r.minutos_mediana_delta).toBeCloseTo(1440, 6);
  });

  it("archivo con 1 registro → granularidad 'desconocida', cobertura 'desconocida', warning GRANULARIDAD_DESCONOCIDA", async () => {
    const filas: Fila[] = [HEADERS, ["2025-03-15", 12, 0.42]];
    const { datos, warnings } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.registros).toHaveLength(1);
    expect(datos.meta.granularidad_detectada).toBe("desconocida");
    expect(datos.meta.minutos_mediana_delta).toBeNull();
    expect(datos.meta.cobertura).toBe("desconocida");
    expect(
      warnings.find((w) => w.codigo === "GRANULARIDAD_DESCONOCIDA")
    ).toBeTruthy();
  });

  it("cobertura 'anual' con 8,760 registros horarios (año no bisiesto)", async () => {
    const filas: Fila[] = [HEADERS, ...generarRegistrosAnio(2025, 0.1)];
    const { datos } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.meta.total_horas).toBe(8760);
    expect(datos.meta.granularidad_detectada).toBe("horaria");
    expect(datos.meta.cobertura).toBe("anual");
  });

  it("cobertura 'anual' con 8,784 registros horarios (año bisiesto 2024)", async () => {
    const filas: Fila[] = [HEADERS, ...generarRegistrosAnio(2024, 0.1)];
    const { datos } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.meta.total_horas).toBe(8784);
    expect(datos.meta.granularidad_detectada).toBe("horaria");
    expect(datos.meta.cobertura).toBe("anual");
  });

  it("cobertura 'parcial' cuando granularidad es horaria pero el conteo no es 8,760 ni 8,784", async () => {
    const filas: Fila[] = [HEADERS];
    for (let d = 1; d <= 5; d += 1) {
      for (let h = 1; h <= 24; h += 1) {
        filas.push([`2025-01-${String(d).padStart(2, "0")}`, h, 0.1]);
      }
    }
    const { datos } = await cargarArchivoSFV(
      construirArchivo(filas),
      CONFIG_BASE
    );
    expect(datos.meta.total_horas).toBe(120);
    expect(datos.meta.granularidad_detectada).toBe("horaria");
    expect(datos.meta.cobertura).toBe("parcial");
  });
});

// Helper para construir RegistroHorario[] con timestamps separados por
// un delta arbitrario. Usado por los tests de sub/supra que no pueden
// pasar por el loader de Excel (fuerza Hora 1-24).
function registrosSinteticos(
  inicio: Date,
  n: number,
  deltaMs: number
): RegistroHorario[] {
  const out: RegistroHorario[] = [];
  for (let i = 0; i < n; i += 1) {
    const ts = new Date(inicio.getTime() + i * deltaMs);
    out.push({ timestamp: ts, energia_mwh: 0.05, potencia_kw_prom: 50 });
  }
  return out;
}
