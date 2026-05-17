import { describe, expect, it } from "vitest";

import { calcularDespachoDiarioPromedio } from "./despacho-diario-promedio";
import type { EstadoHorario } from "@/types/bess";

function estado(
  fechaY: number,
  fechaM: number,
  fechaD: number,
  hora: number,
  partial: Partial<EstadoHorario> = {}
): EstadoHorario {
  const ts = new Date(fechaY, fechaM, fechaD, hora, 0, 0, 0);
  return {
    timestamp: ts,
    gen_mwh: 0,
    energia_categoria_mwh: 0,
    cargado_kwh: 0,
    descargado_kwh: 0,
    no_capturada_kwh: 0,
    soc_kwh: 0,
    ...partial,
  };
}

describe("calcularDespachoDiarioPromedio", () => {
  it("devuelve 24 puntos en convención hora-ending 1..24", () => {
    const detalle = Array.from({ length: 24 }, (_, h) =>
      estado(2025, 0, 1, h)
    );
    const r = calcularDespachoDiarioPromedio(detalle, 1000);
    expect(r).toHaveLength(24);
    expect(r[0]!.hora).toBe(1);
    expect(r[23]!.hora).toBe(24);
  });

  it("gen_kw > 0 solo en horas con generación", () => {
    // 2 días con generación 100 kW solo en h=12 (inicio-intervalo) → hora-ending 13.
    const detalle: EstadoHorario[] = [];
    for (let d = 1; d <= 2; d += 1) {
      for (let h = 0; h < 24; h += 1) {
        detalle.push(
          estado(2025, 2, d, h, {
            gen_mwh: h === 12 ? 0.1 : 0,
          })
        );
      }
    }
    const r = calcularDespachoDiarioPromedio(detalle, 1000);
    expect(r[12]!.gen_kw).toBeCloseTo(100, 2); // h-end 13 → idx 12
    expect(r[0]!.gen_kw).toBe(0);
    expect(r[23]!.gen_kw).toBe(0);
  });

  it("soc_pct: SoC máximo = 950 con cap_util 1000 → soc_pct = 95", () => {
    const detalle = Array.from({ length: 24 }, (_, h) =>
      estado(2025, 0, 1, h, { soc_kwh: h === 12 ? 950 : 0 })
    );
    const r = calcularDespachoDiarioPromedio(detalle, 1000);
    expect(r[12]!.soc_pct).toBeCloseTo(95, 4);
  });

  it("promedia sobre múltiples días en la misma hora", () => {
    const detalle: EstadoHorario[] = [];
    for (let d = 1; d <= 3; d += 1) {
      detalle.push(
        estado(2025, 0, d, 10, { cargado_kwh: d * 30 })
      );
    }
    const r = calcularDespachoDiarioPromedio(detalle, 1000);
    // En h-end 11 (idx 10): (30 + 60 + 90) / 3 = 60.
    expect(r[10]!.carga_kw).toBeCloseTo(60, 4);
  });
});
