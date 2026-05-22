import { describe, expect, it } from "vitest";

import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  correrBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";
import { prepararDatosCurva } from "@/lib/tab-sfv-bess/curva-captura-capacidad";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";
import type { CategoriaEnergia } from "@/types/bess";

const CATEGORIA: CategoriaEnergia = {
  tipo: "toda_energia",
  etiqueta: "Toda la energía",
  descripcion: "",
};

const PARAMS = { dod: 0.95, rte: 0.85, soc_inicial_kwh: 0 } as const;

function registros60Dias() {
  const rs = [];
  for (let d = 0; d < 60; d += 1) {
    rs.push(...generarDiaPlano(sumarDias("2025-03-01", d), 600, 8, 17));
  }
  return rs;
}

function resultadoCompleto() {
  return correrBarridoConfiguraciones(
    registros60Dias(),
    { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
    CATEGORIA,
    ["greedy", "arbitraje"],
    PARAMS
  );
}

describe("prepararDatosCurva", () => {
  it("32 evaluadas se mapean a 32 puntos {x,y,enFrente,config}", () => {
    const datos = prepararDatosCurva(resultadoCompleto());
    expect(datos.evaluadas).toHaveLength(32);
    for (const p of datos.evaluadas) {
      expect(typeof p.x).toBe("number");
      expect(typeof p.y).toBe("number");
      expect(typeof p.enFrente).toBe("boolean");
      expect(p.config).toBeDefined();
    }
  });

  it("X = config.e_kwh, Y = kpis.fraccion_capturada × 100", () => {
    const resultado = resultadoCompleto();
    const datos = prepararDatosCurva(resultado);
    const ev = resultado.evaluadas[0]!;
    const p = datos.evaluadas[0]!;
    expect(p.x).toBe(ev.config.e_kwh);
    expect(p.y).toBeCloseTo(ev.kpis.fraccion_capturada * 100, 9);
  });

  it("enFrente=true sólo para puntos del frente Pareto", () => {
    const resultado = resultadoCompleto();
    const datos = prepararDatosCurva(resultado);
    const nEnFrente = datos.evaluadas.filter((p) => p.enFrente).length;
    expect(nEnFrente).toBe(resultado.frentePareto.length);
    expect(nEnFrente).toBeGreaterThan(0);
  });

  it("frente devuelto ordenado por x ascendente", () => {
    const datos = prepararDatosCurva(resultadoCompleto());
    for (let i = 1; i < datos.frente.length; i += 1) {
      expect(datos.frente[i]!.x).toBeGreaterThanOrEqual(datos.frente[i - 1]!.x);
    }
  });

  it("codo no-null se mapea con mismo X/Y que en resultado", () => {
    const resultado = resultadoCompleto();
    if (resultado.codo === null) return; // si no hay codo, skip semantic
    const datos = prepararDatosCurva(resultado);
    expect(datos.codo).not.toBeNull();
    expect(datos.codo!.x).toBe(resultado.codo.config.e_kwh);
    expect(datos.codo!.y).toBeCloseTo(
      resultado.codo.kpis.fraccion_capturada * 100,
      9
    );
  });

  it("codo null se propaga", () => {
    const resultado = resultadoCompleto();
    const datos = prepararDatosCurva({ ...resultado, codo: null });
    expect(datos.codo).toBeNull();
  });

  it("yMaxObservado coincide con max(y) de evaluadas", () => {
    const datos = prepararDatosCurva(resultadoCompleto());
    const maxReal = Math.max(...datos.evaluadas.map((p) => p.y));
    expect(datos.yMaxObservado).toBe(maxReal);
  });

  it("evaluadas vacías → arrays vacíos y yMaxObservado=0", () => {
    const datos = prepararDatosCurva({
      evaluadas: [],
      frentePareto: [],
      codo: null,
    });
    expect(datos.evaluadas).toEqual([]);
    expect(datos.frente).toEqual([]);
    expect(datos.codo).toBeNull();
    expect(datos.yMaxObservado).toBe(0);
  });

  it("todo punto con enFrente=true existe también en frente[]", () => {
    const datos = prepararDatosCurva(resultadoCompleto());
    const xyEnFrente = datos.evaluadas
      .filter((p) => p.enFrente)
      .map((p) => `${p.x}:${p.y.toFixed(6)}`);
    const xyFrente = datos.frente.map(
      (p) => `${p.x}:${p.y.toFixed(6)}`
    );
    for (const k of xyEnFrente) {
      expect(xyFrente).toContain(k);
    }
  });
});
