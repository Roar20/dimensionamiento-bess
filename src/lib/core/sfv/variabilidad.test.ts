import { describe, expect, it } from "vitest";

import { caracterizarVariabilidad } from "./variabilidad";
import {
  generarDiaPlano,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";

function diaConTotalMwh(fecha: string, totalMwh: number) {
  // 10 horas de generación constante → kW = totalMwh / 10 horas * 1000.
  const kwPorHora = (totalMwh / 10) * 1000;
  return generarDiaPlano(fecha, kwPorHora, 8, 17);
}

describe("caracterizarVariabilidad", () => {
  it("coef_variacion ≈ 0 cuando los 30 días son idénticos", () => {
    const registros = [];
    for (let d = 0; d < 30; d += 1) {
      registros.push(...diaConTotalMwh(sumarDias("2025-01-01", d), 5));
    }
    const r = caracterizarVariabilidad(registros);

    expect(r.coef_variacion).toBe(0);
    expect(r.dia_mejor_mwh).toBeCloseTo(5);
    expect(r.dia_peor_mwh).toBeCloseTo(5);
    expect(r.dias_anomalos).toEqual([]);
    expect(r.n_dias_anomalos).toBe(0);
    expect(Object.keys(r.serie_diaria)).toHaveLength(30);
  });

  it("detecta un outlier extremo entre 30 días", () => {
    const registros = [];
    for (let d = 0; d < 29; d += 1) {
      registros.push(...diaConTotalMwh(sumarDias("2025-02-01", d), 5));
    }
    const fechaOutlier = sumarDias("2025-02-01", 29);
    registros.push(...diaConTotalMwh(fechaOutlier, 0.5));

    const r = caracterizarVariabilidad(registros);

    expect(r.n_dias_anomalos).toBe(1);
    expect(r.dias_anomalos).toContain(fechaOutlier);
    expect(r.dia_peor_fecha).toBe(fechaOutlier);
    expect(r.dia_peor_mwh).toBeCloseTo(0.5);
    expect(r.dia_mejor_mwh).toBeCloseTo(5);
  });

  it("heatmap forma una matriz fecha×24 con ceros fuera de la ventana de gen", () => {
    // Generación entre inicio-intervalo 10 y 16 (7 horas) → indices 10..16 > 0.
    const registros = [];
    for (let d = 0; d < 7; d += 1) {
      registros.push(...generarDiaPlano(sumarDias("2025-07-01", d), 300, 10, 16));
    }
    const r = caracterizarVariabilidad(registros);

    const claves = Object.keys(r.heatmap);
    expect(claves).toHaveLength(7);

    for (const clave of claves) {
      const fila = r.heatmap[clave]!;
      expect(fila).toHaveLength(24);
      for (let i = 0; i <= 9; i += 1) {
        expect(fila[i]).toBe(0);
      }
      for (let i = 10; i <= 16; i += 1) {
        expect(fila[i]).toBeGreaterThan(0);
      }
      for (let i = 17; i <= 23; i += 1) {
        expect(fila[i]).toBe(0);
      }
    }
  });

  it("serie_diaria coincide con la suma de energia_mwh por fecha", () => {
    const registros = [
      ...diaConTotalMwh("2025-08-01", 4.2),
      ...diaConTotalMwh("2025-08-02", 5.1),
      ...diaConTotalMwh("2025-08-03", 3.8),
    ];
    const r = caracterizarVariabilidad(registros);

    expect(r.serie_diaria["2025-08-01"]).toBeCloseTo(4.2);
    expect(r.serie_diaria["2025-08-02"]).toBeCloseTo(5.1);
    expect(r.serie_diaria["2025-08-03"]).toBeCloseTo(3.8);
    expect(r.dia_mejor_fecha).toBe("2025-08-02");
    expect(r.dia_peor_fecha).toBe("2025-08-03");
  });
});
