import { describe, expect, it } from "vitest";

import { calcularExcedenteHoraMes } from "./excedente-hora-mes";
import { createRegistro, sumarDias, generarDiaPlano } from "@/test/fixtures/sfv-fixtures";
import type { RegistroHorario } from "@/types/sfv";

const POI = 500;

function generarAnioSinExcedente(picoKw = 250) {
  const registros: RegistroHorario[] = [];
  for (let d = 0; d < 365; d += 1) {
    registros.push(
      ...generarDiaPlano(sumarDias("2025-01-01", d), picoKw, 8, 17)
    );
  }
  return registros;
}

function generarDiaConExcedenteUnico(
  fecha: string,
  hora: number,
  excedenteKw: number
): RegistroHorario[] {
  // 24 registros del día, casi todos cero salvo `hora` con potencia >POI.
  const out: RegistroHorario[] = [];
  for (let h = 0; h < 24; h += 1) {
    const kw = h === hora ? POI + excedenteKw : 0;
    out.push(createRegistro(fecha, h, kw / 1000));
  }
  return out;
}

describe("excedente-hora-mes · caso sin excedentes (Tequila)", () => {
  it("genera 288 celdas (12 meses × 24 horas) todas con 0 kWh", () => {
    const r = generarAnioSinExcedente();
    const res = calcularExcedenteHoraMes(r, POI);
    expect(res.celdas).toHaveLength(12 * 24);
    expect(res.celdas.every((c) => c.excedenteKwh === 0)).toBe(true);
  });

  it("excedenteAnualKwh = 0", () => {
    const r = generarAnioSinExcedente();
    const res = calcularExcedenteHoraMes(r, POI);
    expect(res.excedenteAnualKwh).toBe(0);
  });

  it("ventanaP80 = null (no hay excedente que repartir)", () => {
    const r = generarAnioSinExcedente();
    const res = calcularExcedenteHoraMes(r, POI);
    expect(res.ventanaP80).toBeNull();
  });

  it("topHoraMes = [] (no hay celdas con excedente)", () => {
    const r = generarAnioSinExcedente();
    const res = calcularExcedenteHoraMes(r, POI);
    expect(res.topHoraMes).toEqual([]);
  });

  it("dataset vacío no lanza excepción", () => {
    expect(() => calcularExcedenteHoraMes([], POI)).not.toThrow();
    const res = calcularExcedenteHoraMes([], POI);
    expect(res.excedenteAnualKwh).toBe(0);
    expect(res.ventanaP80).toBeNull();
  });
});

describe("excedente-hora-mes · ventana P80 — algoritmo greedy", () => {
  it("todo el excedente en una sola hora → ventana = 1 h", () => {
    // 60 días, cada día con excedente solo a las 12h
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 60; d += 1) {
      registros.push(
        ...generarDiaConExcedenteUnico(sumarDias("2025-03-01", d), 12, 100)
      );
    }
    const res = calcularExcedenteHoraMes(registros, POI);
    expect(res.ventanaP80).not.toBeNull();
    expect(res.ventanaP80!.horaInicio).toBe(12);
    expect(res.ventanaP80!.horaFin).toBe(12);
    expect(res.ventanaP80!.horasDuracion).toBe(1);
  });

  it("excedente uniforme entre 10h–14h → ventana contigua dentro del rango activo", () => {
    // Caso degenerado: cinco horas con el mismo excedente. Cualquier
    // ventana de 4 horas contiguas dentro de [10..14] cubre exactamente
    // 80%, así que el algoritmo elige válidamente [10,13] o [11,14] (no
    // necesita expandirse a 5). Validamos el invariante semántico, no
    // un número mágico.
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 0; h < 24; h += 1) {
        const enVentana = h >= 10 && h <= 14;
        const kw = enVentana ? POI + 100 : 0;
        registros.push(createRegistro(fecha, h, kw / 1000));
      }
    }
    const res = calcularExcedenteHoraMes(registros, POI);
    expect(res.ventanaP80).not.toBeNull();
    expect(res.ventanaP80!.horaInicio).toBeGreaterThanOrEqual(10);
    expect(res.ventanaP80!.horaFin).toBeLessThanOrEqual(14);
    expect(res.ventanaP80!.horasDuracion).toBeGreaterThanOrEqual(4);
    expect(res.ventanaP80!.horasDuracion).toBeLessThanOrEqual(5);
  });

  it("excedente unimodal con peak claro → ventana centrada", () => {
    // Distribución unimodal real: pico en h=12, decreciendo hacia 9 y 15.
    // El algoritmo debe arrancar en el pico y expandir simétricamente.
    const perfil: Record<number, number> = {
      9: 30, 10: 60, 11: 90, 12: 120, 13: 90, 14: 60, 15: 30,
    };
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 0; h < 24; h += 1) {
        const exc = perfil[h] ?? 0;
        registros.push(createRegistro(fecha, h, (POI + exc) / 1000));
      }
    }
    const res = calcularExcedenteHoraMes(registros, POI);
    expect(res.ventanaP80).not.toBeNull();
    expect(res.ventanaP80!.horaInicio).toBeLessThanOrEqual(12);
    expect(res.ventanaP80!.horaFin).toBeGreaterThanOrEqual(12);
  });

  it("duracionBessMinima respeta el piso de 4 h cuando horaFin >= horaFinDescarga", () => {
    // Hora pico justo en 22h → cota es max(4, 0) = 4
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      registros.push(
        ...generarDiaConExcedenteUnico(sumarDias("2025-03-01", d), 22, 100)
      );
    }
    const res = calcularExcedenteHoraMes(registros, POI, 22);
    expect(res.ventanaP80!.duracionBessMinima).toBe(4);
  });

  it("duracionBessMinima respeta el horaFinDescarga parametrizado", () => {
    // Hora pico 12h, default horaFinDescarga=22 → 22 - 12 = 10
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      registros.push(
        ...generarDiaConExcedenteUnico(sumarDias("2025-03-01", d), 12, 100)
      );
    }
    const res = calcularExcedenteHoraMes(registros, POI, 22);
    expect(res.ventanaP80!.duracionBessMinima).toBe(10);
    // Con horaFinDescarga=20, baja a 8
    const res2 = calcularExcedenteHoraMes(registros, POI, 20);
    expect(res2.ventanaP80!.duracionBessMinima).toBe(8);
  });
});

describe("excedente-hora-mes · top hora-mes", () => {
  it("topHoraMes está ordenado descendentemente y limitado a 10", () => {
    // 12 horas distintas con excedente distinto → top 10 son las 10 mayores
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 8; h <= 19; h += 1) {
        const exc = (h - 7) * 50; // 50, 100, 150, ..., 600
        registros.push(createRegistro(fecha, h, (POI + exc) / 1000));
      }
      for (let h = 0; h < 24; h += 1) {
        if (h < 8 || h > 19) registros.push(createRegistro(fecha, h, 0));
      }
    }
    const res = calcularExcedenteHoraMes(registros, POI);
    expect(res.topHoraMes).toHaveLength(10);
    for (let i = 1; i < res.topHoraMes.length; i += 1) {
      expect(res.topHoraMes[i - 1]!.excedenteKwh).toBeGreaterThanOrEqual(
        res.topHoraMes[i]!.excedenteKwh
      );
    }
  });
});

describe("excedente-hora-mes · agregación celda", () => {
  it("celda promedia sobre días del mes que cubren ese hueco horario", () => {
    // 10 días de marzo con excedente 200 kWh a las 12h, 0 los demás.
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 10; d += 1) {
      registros.push(
        ...generarDiaConExcedenteUnico(sumarDias("2025-03-01", d), 12, 200)
      );
    }
    const res = calcularExcedenteHoraMes(registros, POI);
    const celda = res.celdas.find((c) => c.mes === 3 && c.hora === 12);
    expect(celda).toBeDefined();
    expect(celda!.excedenteKwh).toBe(200);
    const celdaCero = res.celdas.find((c) => c.mes === 3 && c.hora === 3);
    expect(celdaCero!.excedenteKwh).toBe(0);
  });
});
