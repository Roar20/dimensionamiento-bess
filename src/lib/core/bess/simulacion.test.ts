import { describe, expect, it } from "vitest";

import { construirCategoriasDefault } from "./categoria-energia";
import { simularCompleto, simularUna } from "./simulacion";
import { CONFIG_BESS_TEST } from "@/test/fixtures/bess-fixtures";
import { generarDiaPlano } from "@/test/fixtures/sfv-fixtures";
import type { ParametrosPPA } from "@/types/bess";

const PARAMS_PPA: ParametrosPPA = {
  compromiso_mensual_mwh: 60,
  ventana_punta_cfe: [18, 22],
  capacidad_poi_kw: 500,
};

describe("simularCompleto", () => {
  it("2 estrategias × 4 categorías = 8 simulaciones", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const categorias = construirCategoriasDefault(PARAMS_PPA);
    const resultado = simularCompleto(registros, CONFIG_BESS_TEST, categorias);
    expect(resultado.simulaciones).toHaveLength(8);
  });

  it("todas las simulaciones devuelven la misma config del input", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const categorias = construirCategoriasDefault(PARAMS_PPA);
    const resultado = simularCompleto(registros, CONFIG_BESS_TEST, categorias);
    for (const s of resultado.simulaciones) {
      expect(s.config).toEqual(CONFIG_BESS_TEST);
    }
  });

  it("misma categoría con dos estrategias: mismo energia_categoria_total_mwh", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const categorias = construirCategoriasDefault(PARAMS_PPA);
    const resultado = simularCompleto(registros, CONFIG_BESS_TEST, categorias);

    // Las 2 estrategias de cada categoría tienen el mismo total.
    for (const cat of categorias) {
      const sims = resultado.simulaciones.filter(
        (s) => s.categoria.tipo === cat.tipo
      );
      expect(sims).toHaveLength(2);
      expect(sims[0]!.kpis.energia_categoria_total_mwh).toBeCloseTo(
        sims[1]!.kpis.energia_categoria_total_mwh,
        6
      );
    }
  });
});

describe("simularUna", () => {
  it("devuelve detalle_horario con longitud igual a registros", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const categorias = construirCategoriasDefault(PARAMS_PPA);
    const r = simularUna(
      registros,
      CONFIG_BESS_TEST,
      categorias[0]!,
      "greedy"
    );
    expect(r.detalle_horario).toHaveLength(registros.length);
  });

  it("la estrategia se refleja en el resultado", () => {
    const registros = generarDiaPlano("2025-03-15", 100, 8, 17);
    const categorias = construirCategoriasDefault(PARAMS_PPA);
    const rg = simularUna(registros, CONFIG_BESS_TEST, categorias[0]!, "greedy");
    const ra = simularUna(
      registros,
      CONFIG_BESS_TEST,
      categorias[0]!,
      "arbitraje"
    );
    expect(rg.estrategia).toBe("greedy");
    expect(ra.estrategia).toBe("arbitraje");
  });
});
