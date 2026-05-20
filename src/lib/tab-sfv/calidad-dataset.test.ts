import { describe, expect, it } from "vitest";

import {
  calcularCalidadDataset,
  diasEnAnioCalendario,
  esBisiesto,
  horasEnAnioCalendario,
} from "./calidad-dataset";
import {
  generarDiaPlano,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";

function generarAnio(
  anioInicio: string,
  numDias: number,
  picoKwPorDia: number
) {
  const registros = [];
  for (let d = 0; d < numDias; d += 1) {
    registros.push(...generarDiaPlano(sumarDias(anioInicio, d), picoKwPorDia, 8, 17));
  }
  return registros;
}

describe("calidad-dataset · helpers de calendario", () => {
  it("año bisiesto 2024 → 8784 h y 366 días", () => {
    expect(esBisiesto(2024)).toBe(true);
    expect(horasEnAnioCalendario(2024)).toBe(8784);
    expect(diasEnAnioCalendario(2024)).toBe(366);
  });

  it("año no bisiesto 2025 → 8760 h y 365 días", () => {
    expect(esBisiesto(2025)).toBe(false);
    expect(horasEnAnioCalendario(2025)).toBe(8760);
    expect(diasEnAnioCalendario(2025)).toBe(365);
  });

  it("regla del siglo: 2100 NO es bisiesto", () => {
    expect(esBisiesto(2100)).toBe(false);
  });

  it("regla del 400: 2000 SÍ es bisiesto", () => {
    expect(esBisiesto(2000)).toBe(true);
  });
});

describe("calidad-dataset · cobertura temporal", () => {
  it("año completo no bisiesto = 100% (365 días × 24 h)", () => {
    const registros = generarAnio("2025-01-01", 365, 250);
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.cobertura.recibidos).toBe(8760);
    expect(calidad.cobertura.esperados).toBe(8760);
    expect(calidad.cobertura.pct).toBeCloseTo(100, 1);
    expect(calidad.cobertura.warn).toBe(false);
  });

  it("año bisiesto completo = 100% sobre 8784 h", () => {
    const registros = generarAnio("2024-01-01", 366, 250);
    const calidad = calcularCalidadDataset(registros, 2024);
    expect(calidad.cobertura.esperados).toBe(8784);
    expect(calidad.cobertura.pct).toBeCloseTo(100, 1);
  });

  it("dataset parcial 3 meses ≈ 25% y marca warn", () => {
    const registros = generarAnio("2025-01-01", 90, 250);
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.cobertura.recibidos).toBe(2160);
    expect(calidad.cobertura.pct).toBeCloseTo((2160 / 8760) * 100, 1);
    expect(calidad.cobertura.warn).toBe(true);
  });
});

describe("calidad-dataset · días con generación", () => {
  it("365 días con generación de mediodía = 365 / 365", () => {
    const registros = generarAnio("2025-01-01", 365, 250);
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.diasConGeneracion.activos).toBe(365);
    expect(calidad.diasConGeneracion.totales).toBe(365);
    expect(calidad.diasConGeneracion.pct).toBeCloseTo(100, 1);
  });

  it("días con todos los registros = 0 no cuentan como activos", () => {
    const registros = [
      ...generarDiaPlano("2025-03-01", 250, 8, 17),
      ...generarDiaPlano("2025-03-02", 0, 0, 0), // día apagado
      ...generarDiaPlano("2025-03-03", 250, 8, 17),
    ];
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.diasConGeneracion.activos).toBe(2);
  });
});

describe("calidad-dataset · anomalías", () => {
  it("dataset estable no genera anomalías", () => {
    const registros = generarAnio("2025-01-01", 60, 250);
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.anomalias.total).toBe(0);
    expect(calidad.anomalias.lista).toEqual([]);
  });

  it("día con 50% de caída es detectado", () => {
    // 60 días estables a 250 kW, día 30 baja a 100 kW (60% caída)
    const registros = [];
    for (let d = 0; d < 60; d += 1) {
      const pico = d === 30 ? 100 : 250;
      registros.push(...generarDiaPlano(sumarDias("2025-01-01", d), pico, 8, 17));
    }
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.anomalias.total).toBeGreaterThanOrEqual(1);
    expect(calidad.anomalias.lista[0]!.fecha).toBe("2025-01-31");
    expect(calidad.anomalias.lista[0]!.caida_pct).toBeGreaterThan(30);
  });

  it("caída de 20% NO se considera anomalía (umbral 30%)", () => {
    const registros = [];
    for (let d = 0; d < 60; d += 1) {
      const pico = d === 30 ? 200 : 250; // 20% caída
      registros.push(...generarDiaPlano(sumarDias("2025-01-01", d), pico, 8, 17));
    }
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.anomalias.total).toBe(0);
  });
});

describe("calidad-dataset · granularidad", () => {
  it("registros horarios → '1 h' y 60 min", () => {
    const registros = generarAnio("2025-01-01", 30, 250);
    const calidad = calcularCalidadDataset(registros, 2025);
    expect(calidad.granularidad.minutos).toBe(60);
    expect(calidad.granularidad.etiqueta).toBe("1 h");
  });

  it("dataset vacío fallback a 60 min", () => {
    const calidad = calcularCalidadDataset([], 2025);
    expect(calidad.granularidad.minutos).toBe(60);
    expect(calidad.granularidad.etiqueta).toBe("1 h");
    expect(calidad.cobertura.recibidos).toBe(0);
  });
});
