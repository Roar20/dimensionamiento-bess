import { describe, expect, it } from "vitest";

import { escalarEquipo, inversionTotal } from "./configuracion-equipo";
import { buscarEquipo } from "@/lib/bess/catalogo-hyperstrong";

describe("escalarEquipo", () => {
  it("multiplicador 1 → p_kw y e_kwh idénticos al equipo individual", () => {
    const max = buscarEquipo("hypercube-max")!;
    const c = escalarEquipo(max, 1);
    expect(c.p_kw).toBe(max.kw_ac);
    expect(c.e_kwh).toBeCloseTo(max.kwh);
    expect(c.rte).toBe(max.eficiencia_max);
    expect(c.dod).toBeCloseTo(0.95);
    expect(c.soc_inicial_kwh).toBe(0);
  });

  it("multiplicador 4 escala potencia y capacidad", () => {
    const plus = buscarEquipo("hypercube-plus")!;
    const c = escalarEquipo(plus, 4);
    expect(c.p_kw).toBe(plus.kw_ac * 4);
    expect(c.e_kwh).toBeCloseTo(plus.kwh * 4);
  });

  it("acepta override de dod y soc_inicial_kwh", () => {
    const plus = buscarEquipo("hypercube-plus")!;
    const c = escalarEquipo(plus, 2, { dod: 0.9, soc_inicial_kwh: 50 });
    expect(c.dod).toBe(0.9);
    expect(c.soc_inicial_kwh).toBe(50);
  });

  it("multiplicador inválido lanza error", () => {
    const max = buscarEquipo("hypercube-max")!;
    expect(() => escalarEquipo(max, 0)).toThrow();
    expect(() => escalarEquipo(max, -1)).toThrow();
  });
});

describe("inversionTotal", () => {
  it("precio × multiplicador", () => {
    const max = buscarEquipo("hypercube-max")!;
    expect(inversionTotal(max, 3)).toBeCloseTo(max.precio_usd * 3);
  });
});
