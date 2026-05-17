import { describe, expect, it } from "vitest";

import { calcularPerfilHorario } from "./perfil-horario";
import {
  generarDiaPlano,
  generarDiaSintetico,
} from "@/test/fixtures/sfv-fixtures";

describe("calcularPerfilHorario", () => {
  it("identifica hora_pico en una gaussiana centrada al mediodía", () => {
    // Gaussiana centrada en getHours()=12 (timestamp 12:00 = hora-ending 13).
    const registros = generarDiaSintetico("2025-06-15", 400, 2, 12);
    const r = calcularPerfilHorario(registros);

    // Centro en getHours()=12 → hora-ending 13.
    expect(r.hora_pico).toBe(13);
    expect(r.hora_inicio_generacion).not.toBeNull();
    expect(r.hora_fin_generacion).not.toBeNull();
    expect(r.hora_inicio_generacion!).toBeLessThan(r.hora_pico);
    expect(r.hora_fin_generacion!).toBeGreaterThan(r.hora_pico);
    expect(r.perfil_por_hora[r.hora_pico]!.kW_promedio).toBeCloseTo(400, 0);
  });

  it("reporta 100% de energía en hora-punta cuando solo hay generación entre 18-22", () => {
    // Hora-ending 18..22 = inicio-intervalo 17..21.
    const registros = generarDiaPlano("2025-06-16", 200, 17, 21);
    const r = calcularPerfilHorario(registros);

    expect(r.pct_energia_en_punta).toBe(100);
    expect(r.energia_durante_punta_mwh).toBeCloseTo(5 * 0.2, 6);
    expect(r.ventana_punta_cfe).toEqual([18, 22]);
  });

  it("reporta 0% de energía en hora-punta cuando no hay solapamiento", () => {
    // Hora-ending 8..15 → inicio-intervalo 7..14. Fuera de [18, 22].
    const registros = generarDiaPlano("2025-06-17", 300, 7, 14);
    const r = calcularPerfilHorario(registros);

    expect(r.pct_energia_en_punta).toBe(0);
    expect(r.energia_durante_punta_mwh).toBe(0);
  });

  it("perfil_por_hora cubre las 24 horas (1..24)", () => {
    const registros = generarDiaPlano("2025-06-18", 100, 8, 17);
    const r = calcularPerfilHorario(registros);

    for (let h = 1; h <= 24; h += 1) {
      expect(r.perfil_por_hora[h]).toBeDefined();
      expect(r.perfil_por_hora[h]!.kW_promedio).toBeGreaterThanOrEqual(0);
      expect(r.perfil_por_hora[h]!.kW_maximo).toBeGreaterThanOrEqual(0);
    }
  });
});
