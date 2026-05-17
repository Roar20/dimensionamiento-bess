import { describe, expect, it } from "vitest";

import {
  calcularPeriodosDisponibles,
  construirPeriodoAnual,
  construirPeriodoDiario,
  construirPeriodoMensual,
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
});
