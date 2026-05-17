import { describe, expect, it } from "vitest";

import {
  contarDiasDistintos,
  filtrarDetalle,
} from "./filtrar-detalle-por-periodo";
import {
  construirPeriodoAnual,
  construirPeriodoDiario,
  construirPeriodoMensual,
} from "@/lib/tab-sfv/filtrar-por-periodo";
import type { EstadoHorario } from "@/types/bess";

function estadoEnFecha(y: number, m: number, d: number, h: number): EstadoHorario {
  return {
    timestamp: new Date(y, m, d, h, 0, 0, 0),
    gen_mwh: 0,
    energia_categoria_mwh: 0,
    cargado_kwh: 0,
    descargado_kwh: 0,
    no_capturada_kwh: 0,
    soc_kwh: 0,
  };
}

function detalleAnio(y: number): EstadoHorario[] {
  const detalle: EstadoHorario[] = [];
  for (let mes = 0; mes < 12; mes += 1) {
    const dias = new Date(y, mes + 1, 0).getDate();
    for (let d = 1; d <= dias; d += 1) {
      for (let h = 0; h < 24; h += 1) {
        detalle.push(estadoEnFecha(y, mes, d, h));
      }
    }
  }
  return detalle;
}

describe("filtrarDetalle", () => {
  it("anual: devuelve 8,760 entradas para 2025", () => {
    const detalle = detalleAnio(2025);
    expect(detalle).toHaveLength(8760);
    const r = filtrarDetalle(detalle, construirPeriodoAnual(2025));
    expect(r).toHaveLength(8760);
  });

  it("mensual enero: 31 × 24 = 744 entradas", () => {
    const detalle = detalleAnio(2025);
    const r = filtrarDetalle(detalle, construirPeriodoMensual(2025, 0));
    expect(r).toHaveLength(744);
  });

  it("diario 15 marzo: 24 entradas", () => {
    const detalle = detalleAnio(2025);
    const r = filtrarDetalle(detalle, construirPeriodoDiario(new Date(2025, 2, 15)));
    expect(r).toHaveLength(24);
  });

  it("sin periodo devuelve todo el detalle", () => {
    const detalle = detalleAnio(2025);
    const r = filtrarDetalle(detalle, null);
    expect(r).toHaveLength(detalle.length);
  });
});

describe("contarDiasDistintos", () => {
  it("8,760 registros horarios cubren 365 días", () => {
    const detalle = detalleAnio(2025);
    expect(contarDiasDistintos(detalle)).toBe(365);
  });

  it("24 registros del mismo día cuentan 1", () => {
    const detalle = Array.from({ length: 24 }, (_, h) =>
      estadoEnFecha(2025, 5, 10, h)
    );
    expect(contarDiasDistintos(detalle)).toBe(1);
  });
});
