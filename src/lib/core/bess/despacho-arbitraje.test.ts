import { describe, expect, it } from "vitest";

import { simularDespachoArbitraje } from "./despacho-arbitraje";
import { simularDespachoGreedy } from "./despacho-greedy";
import {
  CONFIG_BESS_TEST,
  generarDiaConGeneracion,
} from "@/test/fixtures/bess-fixtures";

describe("simularDespachoArbitraje", () => {
  it("carga durante el día (fuera de punta), descarga solo en hora-punta CFE", () => {
    // Energía solo en h=8..15 (inicio-intervalo) → hora-ending 9..16, fuera de punta.
    const registros = generarDiaConGeneracion("2025-03-15", 100, [
      8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    const energia_categoria_mwh = new Array(24).fill(0);
    for (let h = 8; h <= 15; h += 1) energia_categoria_mwh[h] = 0.1;

    const detalle = simularDespachoArbitraje(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    // Hay carga durante h=8..15.
    for (let h = 8; h <= 15; h += 1) {
      expect(detalle[h]!.cargado_kwh).toBeGreaterThan(0);
      expect(detalle[h]!.descargado_kwh).toBe(0);
    }

    // Solo hay descarga en h=17..21 (inicio-intervalo) = hora-ending 18..22.
    let descargas_fuera_de_punta = 0;
    let descargas_en_punta = 0;
    for (let h = 0; h < 24; h += 1) {
      const horaEnding = h + 1;
      if (horaEnding >= 18 && horaEnding <= 22) {
        if (detalle[h]!.descargado_kwh > 0) descargas_en_punta += 1;
      } else if (detalle[h]!.descargado_kwh > 0) {
        descargas_fuera_de_punta += 1;
      }
    }
    expect(descargas_fuera_de_punta).toBe(0);
    expect(descargas_en_punta).toBeGreaterThan(0);
  });

  it("energía en hora-punta se reporta como no_capturada (no se carga en punta)", () => {
    // Energía solo en h=18 (inicio-intervalo) → hora-ending 19, dentro de punta.
    const registros = generarDiaConGeneracion("2025-03-15", 200, [18]);
    const energia_categoria_mwh = new Array(24).fill(0);
    energia_categoria_mwh[18] = 0.2;

    const detalle = simularDespachoArbitraje(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    expect(detalle[18]!.cargado_kwh).toBe(0);
    expect(detalle[18]!.no_capturada_kwh).toBeCloseTo(200, 4);
  });

  it("SoC inicial 0 sin carga previa: descarga en hora-punta = 0", () => {
    const registros = generarDiaConGeneracion("2025-03-15", 0, []);
    const energia_categoria_mwh = new Array(24).fill(0);
    const detalle = simularDespachoArbitraje(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    for (let h = 0; h < 24; h += 1) {
      expect(detalle[h]!.descargado_kwh).toBe(0);
    }
  });

  it("respeta piso de SoC del 5% y descarga solo en hora-punta", () => {
    const registros = generarDiaConGeneracion("2025-06-15", 300, [
      8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    const energia_categoria_mwh = registros.map((r) => r.energia_mwh);

    const detalle = simularDespachoArbitraje(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    const cap_util = CONFIG_BESS_TEST.e_kwh * CONFIG_BESS_TEST.dod;
    const soc_min = cap_util * 0.05;
    for (const e of detalle) {
      expect(e.soc_kwh).toBeGreaterThanOrEqual(soc_min - 0.01);
    }

    // Toda descarga debe ocurrir SOLO en hora-ending 18..22.
    for (let h = 0; h < 24; h += 1) {
      if (detalle[h]!.descargado_kwh > 0) {
        const horaEnding = h + 1;
        expect(horaEnding).toBeGreaterThanOrEqual(18);
        expect(horaEnding).toBeLessThanOrEqual(22);
      }
    }
  });

  it("con generación toda fuera de hora-punta: greedy y arbitraje cargan lo mismo", () => {
    const registros = generarDiaConGeneracion("2025-03-15", 100, [
      8, 9, 10, 11, 12, 13, 14, 15,
    ]);
    const energia_categoria_mwh = new Array(24).fill(0);
    for (let h = 8; h <= 15; h += 1) energia_categoria_mwh[h] = 0.1;

    const greedy = simularDespachoGreedy(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );
    const arb = simularDespachoArbitraje(
      registros,
      energia_categoria_mwh,
      CONFIG_BESS_TEST
    );

    const cargado_greedy = greedy.reduce((s, e) => s + e.cargado_kwh, 0);
    const cargado_arb = arb.reduce((s, e) => s + e.cargado_kwh, 0);
    expect(cargado_arb).toBeCloseTo(cargado_greedy, 4);
  });
});
