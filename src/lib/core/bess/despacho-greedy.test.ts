import { describe, expect, it } from "vitest";

import { simularDespachoGreedy } from "./despacho-greedy";
import {
  CONFIG_BESS_TEST,
  generarDiaConGeneracion,
} from "@/test/fixtures/bess-fixtures";

describe("simularDespachoGreedy", () => {
  it("sin energía en la categoría: no carga ni descarga (SoC inicial 0)", () => {
    const registros = generarDiaConGeneracion("2025-03-15", 0, []);
    const energia_categoria_mwh = new Array(24).fill(0);
    const detalle = simularDespachoGreedy(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    expect(detalle.every((e) => e.cargado_kwh === 0)).toBe(true);
    expect(detalle.every((e) => e.descargado_kwh === 0)).toBe(true);
    expect(detalle.every((e) => e.soc_kwh === 0)).toBe(true);
  });

  it("energía abundante: carga acotada por potencia (P=250), excedente va a no_capturada", () => {
    // 10 horas con 300 kW de categoría (= 0.3 MWh/hora). P_kW = 250.
    const registros = generarDiaConGeneracion(
      "2025-03-15",
      0,
      []
    );
    const energia_categoria_mwh = new Array(24).fill(0);
    for (let h = 8; h <= 17; h += 1) energia_categoria_mwh[h] = 0.3;
    const detalle = simularDespachoGreedy(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    // En las primeras horas la carga = min(300, 250, capacidad libre/√rte).
    const h8 = detalle[8]!;
    expect(h8.cargado_kwh).toBeLessThanOrEqual(250);
    expect(h8.no_capturada_kwh).toBeGreaterThan(0);
  });

  it("ciclo completo: carga durante el día, descarga inmediatamente al atardecer", () => {
    // 10 horas con 100 kW en categoría + 14 horas sin → SoC sube y luego baja.
    const registros = generarDiaConGeneracion("2025-03-15", 100, [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
    ]);
    const energia_categoria_mwh = new Array(24).fill(0);
    for (let h = 8; h <= 17; h += 1) energia_categoria_mwh[h] = 0.1;

    const detalle = simularDespachoGreedy(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    // SoC máximo durante las horas de carga.
    const soc_max = Math.max(...detalle.map((e) => e.soc_kwh));
    expect(soc_max).toBeGreaterThan(0);
    expect(soc_max).toBeLessThanOrEqual(CONFIG_BESS_TEST.e_kwh * CONFIG_BESS_TEST.dod);

    // Descarga en la primera hora sin categoría (h=18).
    expect(detalle[18]!.descargado_kwh).toBeGreaterThan(0);

    // SoC final cerca de 0 tras descargas continuas.
    expect(detalle[23]!.soc_kwh).toBeLessThan(50);
  });

  it("eficiencia RTE 0.85: 100 kWh cargados → SoC ~92.2; descarga → ~85 kWh AC", () => {
    const registros = generarDiaConGeneracion("2025-03-15", 0, []);
    const energia_categoria_mwh = new Array(24).fill(0);
    energia_categoria_mwh[10] = 0.1; // 100 kWh

    const detalle = simularDespachoGreedy(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    const sqrtRte = Math.sqrt(0.85); // ≈ 0.9220
    expect(detalle[10]!.cargado_kwh).toBeCloseTo(100, 4);
    expect(detalle[10]!.soc_kwh).toBeCloseTo(100 * sqrtRte, 3);

    // Hora 11 sin categoría → descarga inmediata.
    const descarga_h11 = detalle[11]!.descargado_kwh;
    // SoC pre-descarga = 100*√rte ≈ 92.2. Descarga AC = SoC * √rte ≈ 85.
    expect(descarga_h11).toBeCloseTo(100 * 0.85, 2);
  });
});
