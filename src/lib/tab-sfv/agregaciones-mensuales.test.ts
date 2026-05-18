import { describe, expect, it } from "vitest";

import {
  agregarPorMes,
  resumenMensualACSV,
} from "./agregaciones-mensuales";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";

function diaConGen(fecha: string, kw = 100) {
  return generarDiaPlano(fecha, kw, 8, 17);
}

describe("agregarPorMes", () => {
  it("12 meses sintéticos: devuelve 12 entradas con totales correctos", () => {
    const registros = [];
    for (let mes = 0; mes < 12; mes += 1) {
      const fechaInicio = `2025-${String(mes + 1).padStart(2, "0")}-01`;
      const diasMes = new Date(2025, mes + 1, 0).getDate();
      for (let d = 0; d < diasMes; d += 1) {
        registros.push(...diaConGen(sumarDias(fechaInicio, d)));
      }
    }

    const resumen = agregarPorMes(registros);
    expect(resumen).toHaveLength(12);
    for (const m of resumen) {
      expect(m.energia_mwh).toBeGreaterThan(0);
      expect(m.pico_kw).toBeCloseTo(100, 1);
      expect(m.dias_con_generacion).toBeGreaterThan(0);
      expect(m.mejor_dia_fecha).not.toBeNull();
    }
  });

  it("CSV: incluye headers y una fila por mes", () => {
    const registros = diaConGen("2025-06-15");
    const resumen = agregarPorMes(registros);
    const csv = resumenMensualACSV(resumen);
    const lineas = csv.split("\n");
    expect(lineas[0]).toContain("Mes");
    expect(lineas).toHaveLength(2); // header + 1 mes
  });

  it("acumula excedente_mwh contra POI cuando se pasa poi_kw", () => {
    // 1 día con 600 kW × 10 h en marzo: excedente diario = (600-500) × 10/1000 = 1.0 MWh.
    const registros = generarDiaPlano("2025-03-10", 600, 8, 17);
    const conPoi = agregarPorMes(registros, 500);
    expect(conPoi).toHaveLength(1);
    expect(conPoi[0]!.excedente_mwh).toBeCloseTo(1.0, 4);

    const sinPoi = agregarPorMes(registros);
    expect(sinPoi[0]!.excedente_mwh).toBe(0);
  });
});
