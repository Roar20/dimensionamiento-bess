import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ComparativaTecnica } from "@/components/bess/ComparativaTecnica";

describe("ComparativaTecnica", () => {
  it("renderiza exactamente 10 filas de parámetros", () => {
    render(<ComparativaTecnica />);
    const tabla = screen.getByRole("table");
    const filas = tabla.querySelectorAll("tbody tr");
    expect(filas).toHaveLength(10);
  });

  it("incluye los 10 parámetros consultor en orden", () => {
    render(<ComparativaTecnica />);
    const labels = Array.from(
      document.querySelectorAll("tbody tr td:first-child")
    ).map((td) => td.textContent);
    expect(labels).toEqual([
      "Energía nominal",
      "Potencia nominal",
      "Configuración celdas",
      "Voltaje DC nominal",
      "Eficiencia máxima",
      "Temperatura operación",
      "Vida útil declarada",
      "Refrigeración",
      "Capacidad paralelo",
      "Costo USD/kWh",
    ]);
  });

  it("valores numéricos del catálogo se renderizan en cada columna", () => {
    render(<ComparativaTecnica />);
    // Energía: 261.2 / 835.9 / 5,015.96 kWh.
    expect(screen.getByText(/261\.2 kWh/)).toBeInTheDocument();
    expect(screen.getByText(/835\.9 kWh/)).toBeInTheDocument();
    expect(screen.getByText(/5,016\.0 kWh/)).toBeInTheDocument();
    // Costo USD/kWh.
    expect(screen.getByText(/^214$/)).toBeInTheDocument();
    expect(screen.getByText(/^177$/)).toBeInTheDocument();
    expect(screen.getByText(/^113$/)).toBeInTheDocument();
  });
});
