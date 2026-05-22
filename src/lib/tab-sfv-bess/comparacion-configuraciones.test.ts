import { describe, expect, it } from "vitest";

import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  correrBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";
import {
  calcularResumenBarrido,
  construirFilasTabla,
  esMismaConfiguracionEvaluada,
  formatearCiclos,
  formatearConfig,
  formatearPct,
} from "@/lib/tab-sfv-bess/comparacion-configuraciones";
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

describe("construirFilasTabla", () => {
  it("produce 32 filas para el sweep 4×4×2", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const filas = construirFilasTabla(resultado);
    expect(filas).toHaveLength(32);
  });

  it("filas ordenadas por e_kwh asc → estrategia → p_kw", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const filas = construirFilasTabla(resultado);
    for (let i = 1; i < filas.length; i += 1) {
      const prev = filas[i - 1]!;
      const curr = filas[i]!;
      const eP = prev.evaluada.config.e_kwh;
      const eC = curr.evaluada.config.e_kwh;
      if (eP === eC) {
        const strCmp = prev.evaluada.estrategia.localeCompare(
          curr.evaluada.estrategia
        );
        if (strCmp === 0) {
          expect(prev.evaluada.config.p_kw).toBeLessThanOrEqual(
            curr.evaluada.config.p_kw
          );
        } else {
          expect(strCmp).toBeLessThanOrEqual(0);
        }
      } else {
        expect(eP).toBeLessThan(eC);
      }
    }
  });

  it("al menos una fila con enFrente=true", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const filas = construirFilasTabla(resultado);
    expect(filas.some((f) => f.enFrente)).toBe(true);
  });

  it("si codo !== null, exactamente una fila con esCodo=true", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const filas = construirFilasTabla(resultado);
    const codosCount = filas.filter((f) => f.esCodo).length;
    if (resultado.codo === null) {
      expect(codosCount).toBe(0);
    } else {
      expect(codosCount).toBe(1);
    }
  });

  it("ninguna fila con esCodo=true cuando codo es null", () => {
    // Sweep mínimo de 2 puntos → frentePareto tendrá <3 pts → codo=null
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [200, 500], horas: [2] },
      CATEGORIA,
      ["greedy"],
      PARAMS
    );
    // Forzamos a que el resultado tenga codo null
    const resultadoSinCodo = { ...resultado, codo: null };
    const filas = construirFilasTabla(resultadoSinCodo);
    expect(filas.every((f) => !f.esCodo)).toBe(true);
  });

  it("toda fila con esCodo=true también tiene enFrente=true", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const filas = construirFilasTabla(resultado);
    for (const f of filas) {
      if (f.esCodo) {
        expect(f.enFrente).toBe(true);
      }
    }
  });
});

describe("esMismaConfiguracionEvaluada", () => {
  it("devuelve true para objetos con mismos p_kw, e_kwh y estrategia", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [300], horas: [4] },
      CATEGORIA,
      ["greedy"],
      PARAMS
    );
    const ev = resultado.evaluadas[0]!;
    expect(esMismaConfiguracionEvaluada(ev, ev)).toBe(true);
  });

  it("devuelve false cuando difiere la estrategia", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: [300], horas: [4] },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const a = resultado.evaluadas[0]!;
    const b = resultado.evaluadas[1]!;
    expect(a.estrategia).not.toBe(b.estrategia);
    expect(esMismaConfiguracionEvaluada(a, b)).toBe(false);
  });
});

describe("formatearConfig", () => {
  it('400 kW × 4 h → "400 kW × 4 h"', () => {
    expect(formatearConfig(400, 4)).toBe("400 kW × 4 h");
  });

  it('200 kW × 2 h → "200 kW × 2 h"', () => {
    expect(formatearConfig(200, 2)).toBe("200 kW × 2 h");
  });
});

describe("formatearPct", () => {
  it("0.785 → '78.5 %'", () => {
    expect(formatearPct(0.785)).toBe("78.5 %");
  });

  it("1.0 → '100.0 %'", () => {
    expect(formatearPct(1.0)).toBe("100.0 %");
  });

  it("0 → '0.0 %'", () => {
    expect(formatearPct(0)).toBe("0.0 %");
  });
});

describe("formatearCiclos", () => {
  it("142.3 → '142'", () => {
    expect(formatearCiclos(142.3)).toBe("142");
  });

  it("0 → '0'", () => {
    expect(formatearCiclos(0)).toBe("0");
  });

  it("redondea hacia arriba en .5", () => {
    expect(formatearCiclos(142.5)).toBe("143");
  });
});

describe("calcularResumenBarrido", () => {
  it("32 evaluadas → numConfiguraciones=32 + min/max en porcentaje entero", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const r = calcularResumenBarrido(resultado);
    expect(r.numConfiguraciones).toBe(32);
    expect(Number.isInteger(r.capturaMinPct)).toBe(true);
    expect(Number.isInteger(r.capturaMaxPct)).toBe(true);
    expect(r.capturaMinPct).toBeGreaterThanOrEqual(0);
    expect(r.capturaMaxPct).toBeLessThanOrEqual(100);
    expect(r.capturaMinPct).toBeLessThanOrEqual(r.capturaMaxPct);
  });

  it("min y max coinciden con el rango real de fraccion_capturada en evaluadas", () => {
    const registros = registros60Dias();
    const resultado = correrBarridoConfiguraciones(
      registros,
      { potencias_kw: POTENCIAS_KW_DEFAULT, horas: HORAS_DEFAULT },
      CATEGORIA,
      ["greedy", "arbitraje"],
      PARAMS
    );
    const fracciones = resultado.evaluadas.map(
      (e) => e.kpis.fraccion_capturada
    );
    const minReal = Math.round(Math.min(...fracciones) * 100);
    const maxReal = Math.round(Math.max(...fracciones) * 100);
    const r = calcularResumenBarrido(resultado);
    expect(r.capturaMinPct).toBe(minReal);
    expect(r.capturaMaxPct).toBe(maxReal);
  });

  it("evaluadas vacías → ceros", () => {
    const r = calcularResumenBarrido({
      evaluadas: [],
      frentePareto: [],
      codo: null,
    });
    expect(r).toEqual({
      numConfiguraciones: 0,
      capturaMinPct: 0,
      capturaMaxPct: 0,
    });
  });
});
