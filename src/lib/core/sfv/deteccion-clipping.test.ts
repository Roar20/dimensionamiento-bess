import { describe, expect, it } from "vitest";

import { detectarClipping } from "./deteccion-clipping";
import {
  createRegistro,
  generarDiaPlano,
} from "@/test/fixtures/sfv-fixtures";

describe("detectarClipping", () => {
  it("reporta sin clipping cuando ninguna hora alcanza el POI", () => {
    const registros = generarDiaPlano("2025-05-01", 400, 8, 17);
    const r = detectarClipping(registros, 500);

    expect(r.hay_clipping_real).toBe(false);
    expect(r.horas_en_clipping).toBe(0);
    expect(r.dias_con_clipping).toBe(0);
    expect(r.horas_con_generacion).toBe(10);
    expect(r.dias_totales).toBe(1);
    expect(r.pct_horas_clipping).toBe(0);
  });

  it("detecta clipping cuando 5 horas tocan el POI", () => {
    const registros = generarDiaPlano("2025-05-02", 400, 8, 17);
    // Sobrescribimos 5 horas pico para que toquen el POI (500 kW = 0.5 MWh).
    registros[10] = createRegistro("2025-05-02", 10, 0.5);
    registros[11] = createRegistro("2025-05-02", 11, 0.5);
    registros[12] = createRegistro("2025-05-02", 12, 0.5);
    registros[13] = createRegistro("2025-05-02", 13, 0.5);
    registros[14] = createRegistro("2025-05-02", 14, 0.5);

    const r = detectarClipping(registros, 500);

    expect(r.hay_clipping_real).toBe(true);
    expect(r.horas_en_clipping).toBe(5);
    expect(r.dias_con_clipping).toBe(1);
    expect(r.horas_con_generacion).toBe(10);
    expect(r.pct_horas_clipping).toBe(50);
  });

  it("respeta el umbral del 1% de tolerancia (caso borde)", () => {
    // umbral_mwh con POI 500 y tol 1% = 0.5 * 0.99 = 0.495
    const justoArriba = [createRegistro("2025-05-03", 12, 0.4955)];
    expect(detectarClipping(justoArriba, 500, 1).hay_clipping_real).toBe(true);

    const justoAbajo = [createRegistro("2025-05-04", 12, 0.4925)];
    expect(detectarClipping(justoAbajo, 500, 1).hay_clipping_real).toBe(false);
  });

  it("reporta umbral_kwh_horario correcto", () => {
    const registros = [createRegistro("2025-05-05", 12, 0.1)];
    const r = detectarClipping(registros, 500, 1);
    // 500 / 1000 * 0.99 = 0.495 MWh = 495 kWh
    expect(r.umbral_kwh_horario).toBe(495);
  });
});
