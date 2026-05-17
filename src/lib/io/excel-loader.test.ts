import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { cargarArchivoSFV } from "@/lib/io/excel-loader";
import {
  ErrorFormatoArchivo,
  type ConfiguracionPlanta,
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

function generarRegistrosAnio(anio: number, energiaPorHora: number): Fila[] {
  const filas: Fila[] = [];
  const dias = diasDelAnio(anio);
  for (let d = 0; d < dias; d += 1) {
    const fecha = new Date(anio, 0, 1 + d);
    const isoFecha = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
    for (let h = 1; h <= 24; h += 1) {
      filas.push([isoFecha, h, energiaPorHora]);
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
});
