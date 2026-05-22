import { describe, expect, it } from "vitest";

import { extraerMetadataArchivo } from "@/lib/io/metadata-archivo";
import type {
  ConfiguracionPlanta,
  DatosSFV,
  Warning,
} from "@/types/sfv";

const CONFIG_BASE: ConfiguracionPlanta = {
  nombre: "Planta Demo",
  cliente: null,
  ubicacion: null,
  capacidad_poi_kw: 500,
  capacidad_instalada_kw: 500,
  zona_lmp: null,
  precio_ppa_mxn_mwh: null,
};

function datosFixture(
  overrides: Partial<DatosSFV["meta"]> = {}
): DatosSFV {
  return {
    config: CONFIG_BASE,
    registros: [],
    meta: {
      nombre_archivo: "demo.xlsx",
      fecha_carga: "2026-05-22T00:00:00.000Z",
      anio: 2025,
      total_horas: 8760,
      total_energia_mwh: 900,
      horas_con_generacion: 4500,
      pico_horario_kw: 440,
      periodo_inicio: new Date(2025, 0, 1, 0, 0, 0, 0),
      periodo_fin: new Date(2025, 11, 31, 23, 0, 0, 0),
      granularidad_detectada: "horaria",
      minutos_mediana_delta: 60,
      cobertura: "anual",
      ...overrides,
    },
  };
}

describe("extraerMetadataArchivo", () => {
  it("mapea config.nombre a nombrePlanta sin alterarlo", () => {
    const datos = datosFixture();
    const config: ConfiguracionPlanta = { ...CONFIG_BASE, nombre: "Estanzuela 2" };
    const meta = extraerMetadataArchivo(datos, [], config);
    expect(meta.nombrePlanta).toBe("Estanzuela 2");
  });

  it("propaga advertencias.mensajes en orden, sin duplicados ni inventos", () => {
    const datos = datosFixture();
    const warnings: Warning[] = [
      { codigo: "HORAS_INCOMPLETAS", mensaje: "Faltan horas." },
      { codigo: "GRANULARIDAD_SUB_HORARIA", mensaje: "Granularidad ~15 min." },
    ];
    const meta = extraerMetadataArchivo(datos, warnings, CONFIG_BASE);
    expect(meta.advertencias).toEqual([
      "Faltan horas.",
      "Granularidad ~15 min.",
    ]);
  });

  it("preserva nombrePlanta vacío si config.nombre es '' (no inventa nombre)", () => {
    const datos = datosFixture();
    const config: ConfiguracionPlanta = { ...CONFIG_BASE, nombre: "" };
    const meta = extraerMetadataArchivo(datos, [], config);
    expect(meta.nombrePlanta).toBe("");
  });

  it("traduce todos los campos snake_case → camelCase sin perder valores", () => {
    const periodoInicio = new Date(2024, 0, 1, 0, 0, 0, 0);
    const periodoFin = new Date(2024, 11, 31, 23, 0, 0, 0);
    const datos = datosFixture({
      total_horas: 8784,
      periodo_inicio: periodoInicio,
      periodo_fin: periodoFin,
      granularidad_detectada: "horaria",
      minutos_mediana_delta: 60,
      cobertura: "anual",
    });
    const meta = extraerMetadataArchivo(datos, [], CONFIG_BASE);
    expect(meta).toEqual({
      nombrePlanta: CONFIG_BASE.nombre,
      periodoInicio,
      periodoFin,
      numRegistros: 8784,
      granularidadDetectada: "horaria",
      minutosMedianaDelta: 60,
      cobertura: "anual",
      advertencias: [],
    });
  });
});
