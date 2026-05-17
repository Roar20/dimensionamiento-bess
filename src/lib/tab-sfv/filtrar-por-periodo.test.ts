import { describe, expect, it } from "vitest";

import {
  calcularPeriodosDisponibles,
  construirPeriodoAnual,
  construirPeriodoDiario,
  construirPeriodoMensual,
  construirPeriodoSemestral,
  construirPeriodoTrimestral,
  filtrarRegistros,
} from "./filtrar-por-periodo";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";

function generarMes(fechaInicio: string, dias: number) {
  const registros = [];
  for (let d = 0; d < dias; d += 1) {
    registros.push(...generarDiaPlano(sumarDias(fechaInicio, d), 100, 8, 17));
  }
  return registros;
}

describe("filtrarRegistros", () => {
  it("filtra todos los registros del año seleccionado", () => {
    const enero = generarMes("2025-01-01", 31);
    const febrero = generarMes("2025-02-01", 28);
    const registros = [...enero, ...febrero];

    const periodo = construirPeriodoAnual(2025);
    const filtrados = filtrarRegistros(registros, periodo);

    expect(filtrados).toHaveLength(registros.length);
  });

  it("filtra solo registros del mes seleccionado", () => {
    const enero = generarMes("2025-01-01", 31);
    const febrero = generarMes("2025-02-01", 28);
    const registros = [...enero, ...febrero];

    const periodo = construirPeriodoMensual(2025, 1); // febrero
    const filtrados = filtrarRegistros(registros, periodo);

    expect(filtrados).toHaveLength(28 * 24);
    expect(
      filtrados.every((r) => r.timestamp.getMonth() === 1)
    ).toBe(true);
  });

  it("filtra solo registros del día seleccionado", () => {
    const enero = generarMes("2025-01-01", 5);
    const periodo = construirPeriodoDiario(new Date(2025, 0, 3));
    const filtrados = filtrarRegistros(enero, periodo);

    expect(filtrados).toHaveLength(24);
    expect(filtrados.every((r) => r.timestamp.getDate() === 3)).toBe(true);
  });

  it("devuelve array vacío si el periodo no tiene datos", () => {
    const enero = generarMes("2025-01-01", 5);
    const periodo = construirPeriodoMensual(2025, 5); // junio (sin datos)
    expect(filtrarRegistros(enero, periodo)).toHaveLength(0);
  });
});

describe("filtrarRegistros — granularidades extendidas", () => {
  it("Semestral S1 2025: solo registros de enero-junio", () => {
    const registros = [
      ...generarMes("2025-03-01", 5),
      ...generarMes("2025-08-01", 5),
    ];
    const s1 = construirPeriodoSemestral(2025, 1);
    const filtrados = filtrarRegistros(registros, s1);
    expect(
      filtrados.every((r) => r.timestamp.getMonth() < 6)
    ).toBe(true);
    expect(filtrados).toHaveLength(5 * 24);
  });

  it("Trimestral Q3 2025: solo registros de jul/ago/sep", () => {
    const registros = [
      ...generarMes("2025-06-01", 5),
      ...generarMes("2025-08-01", 5),
      ...generarMes("2025-10-01", 5),
    ];
    const q3 = construirPeriodoTrimestral(2025, 3);
    const filtrados = filtrarRegistros(registros, q3);
    expect(
      filtrados.every(
        (r) => r.timestamp.getMonth() >= 6 && r.timestamp.getMonth() <= 8
      )
    ).toBe(true);
    expect(filtrados).toHaveLength(5 * 24);
  });

  it("suma de S1 + S2 == año completo (sin huecos ni solapes)", () => {
    const registros = [];
    for (let mes = 0; mes < 12; mes += 1) {
      const fechaInicio = `2025-${String(mes + 1).padStart(2, "0")}-01`;
      const diasMes = new Date(2025, mes + 1, 0).getDate();
      registros.push(...generarMes(fechaInicio, diasMes));
    }
    const s1 = construirPeriodoSemestral(2025, 1);
    const s2 = construirPeriodoSemestral(2025, 2);
    const total =
      filtrarRegistros(registros, s1).length +
      filtrarRegistros(registros, s2).length;
    expect(total).toBe(registros.length);
  });

  it("suma de los 4 trimestres == año completo", () => {
    const registros = [];
    for (let mes = 0; mes < 12; mes += 1) {
      const fechaInicio = `2025-${String(mes + 1).padStart(2, "0")}-01`;
      const diasMes = new Date(2025, mes + 1, 0).getDate();
      registros.push(...generarMes(fechaInicio, diasMes));
    }
    let total = 0;
    for (let q = 1 as 1 | 2 | 3 | 4; q <= 4; q = (q + 1) as 1 | 2 | 3 | 4) {
      total += filtrarRegistros(
        registros,
        construirPeriodoTrimestral(2025, q)
      ).length;
    }
    expect(total).toBe(registros.length);
  });
});

describe("calcularPeriodosDisponibles", () => {
  it("anual: un período por año único", () => {
    const registros = [
      ...generarMes("2024-12-01", 1),
      ...generarMes("2025-01-01", 31),
    ];
    const periodos = calcularPeriodosDisponibles(registros, "anual");
    expect(periodos).toHaveLength(2);
    expect(periodos[0]!.label).toBe("2024");
    expect(periodos[1]!.label).toBe("2025");
  });

  it("mensual: un período por (año, mes) único", () => {
    const registros = [
      ...generarMes("2025-01-01", 31),
      ...generarMes("2025-02-01", 28),
      ...generarMes("2025-03-01", 31),
    ];
    const periodos = calcularPeriodosDisponibles(registros, "mensual");
    expect(periodos).toHaveLength(3);
  });

  it("diario: un período por fecha única", () => {
    const registros = generarMes("2025-01-01", 5);
    const periodos = calcularPeriodosDisponibles(registros, "diario");
    expect(periodos).toHaveLength(5);
  });

  it("semestral: 2 periodos por año con datos en ambos semestres", () => {
    const registros = [
      ...generarMes("2025-03-01", 5),
      ...generarMes("2025-10-01", 5),
    ];
    const periodos = calcularPeriodosDisponibles(registros, "semestral");
    expect(periodos).toHaveLength(2);
    expect(periodos.map((p) => p.label)).toEqual([
      "S1 2025 (ene–jun)",
      "S2 2025 (jul–dic)",
    ]);
  });

  it("semestral: omite semestres sin datos", () => {
    const registros = generarMes("2025-03-01", 5);
    const periodos = calcularPeriodosDisponibles(registros, "semestral");
    expect(periodos).toHaveLength(1);
    expect(periodos[0]!.label).toBe("S1 2025 (ene–jun)");
  });

  it("trimestral: 4 periodos por año con datos en los 4 trimestres", () => {
    const registros = [
      ...generarMes("2025-02-01", 1),
      ...generarMes("2025-05-01", 1),
      ...generarMes("2025-08-01", 1),
      ...generarMes("2025-11-01", 1),
    ];
    const periodos = calcularPeriodosDisponibles(registros, "trimestral");
    expect(periodos).toHaveLength(4);
    expect(periodos[0]!.label).toBe("Q1 2025 (ene–mar)");
    expect(periodos[3]!.label).toBe("Q4 2025 (oct–dic)");
  });
});
