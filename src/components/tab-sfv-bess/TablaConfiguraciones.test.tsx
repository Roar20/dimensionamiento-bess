import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import {
  HORAS_DEFAULT,
  POTENCIAS_KW_DEFAULT,
  correrBarridoConfiguraciones,
} from "@/lib/core/bess/barrido-configuraciones";
import { TablaConfiguraciones } from "./TablaConfiguraciones";
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

describe("TablaConfiguraciones", () => {
  it("renderiza 32 filas para el sweep 4×4×2", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    const filas = screen.getAllByTestId("fila-config");
    expect(filas).toHaveLength(32);
  });

  it("al menos una fila tiene badge Frente", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    const badges = screen.getAllByTestId("badge-frente");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("si codo !== null, exactamente una fila tiene badge Inflexión", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    const badgesInflexion = screen.queryAllByTestId("badge-inflexion");
    if (resultado.codo === null) {
      expect(badgesInflexion).toHaveLength(0);
    } else {
      expect(badgesInflexion).toHaveLength(1);
    }
  });

  it("no hay badge Inflexión cuando codo es null", () => {
    const resultado = resultadoCompleto();
    const resultadoSinCodo = { ...resultado, codo: null };
    render(<TablaConfiguraciones resultado={resultadoSinCodo} />);
    expect(screen.queryAllByTestId("badge-inflexion")).toHaveLength(0);
  });

  it("filas dominadas tienen bg-[#fafafa]", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    const filas = screen.getAllByTestId("fila-config");
    const dominadas = filas.filter((f) => f.getAttribute("data-frente") !== "true");
    // Al menos alguna fila debería ser dominada con 4×4×2 configs
    if (dominadas.length > 0) {
      for (const fila of dominadas) {
        expect(fila.className).toContain("bg-[#fafafa]");
      }
    }
  });

  it("filas del frente tienen bg-white", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    const filas = screen.getAllByTestId("fila-config");
    const delFrente = filas.filter(
      (f) => f.getAttribute("data-frente") === "true"
    );
    expect(delFrente.length).toBeGreaterThan(0);
    for (const fila of delFrente) {
      expect(fila.className).toContain("bg-white");
    }
  });

  it("ambas estrategias visibles en la tabla", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    expect(screen.getAllByText("Greedy").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Arbitraje").length).toBeGreaterThan(0);
  });

  it("el badge Inflexión también tiene badge Frente en la misma fila", () => {
    const resultado = resultadoCompleto();
    if (resultado.codo === null) return;
    render(<TablaConfiguraciones resultado={resultado} />);
    const filas = screen.getAllByTestId("fila-config");
    const filaCodo = filas.find(
      (f) => f.getAttribute("data-codo") === "true"
    );
    expect(filaCodo).toBeDefined();
    expect(within(filaCodo!).getByTestId("badge-frente")).toBeInTheDocument();
    expect(within(filaCodo!).getByTestId("badge-inflexion")).toBeInTheDocument();
  });

  it("cabeceras de la tabla presentes", () => {
    const resultado = resultadoCompleto();
    render(<TablaConfiguraciones resultado={resultado} />);
    expect(screen.getByText(/configuración/i)).toBeInTheDocument();
    expect(screen.getByText(/estrategia/i)).toBeInTheDocument();
    expect(screen.getByText(/captura/i)).toBeInTheDocument();
    expect(screen.getByText(/ciclos/i)).toBeInTheDocument();
  });
});
