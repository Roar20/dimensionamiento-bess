import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { PanelCalidadDataset } from "@/components/tab-sfv/PanelCalidadDataset";
import { generarDiaPlano, sumarDias } from "@/test/fixtures/sfv-fixtures";

function generarAnio(anioInicio: string, numDias: number, pico: number) {
  const registros = [];
  for (let d = 0; d < numDias; d += 1) {
    registros.push(...generarDiaPlano(sumarDias(anioInicio, d), pico, 8, 17));
  }
  return registros;
}

describe("PanelCalidadDataset", () => {
  it("renderiza el título y los 4 labels de indicadores", () => {
    const registros = generarAnio("2025-01-01", 30, 250);
    render(<PanelCalidadDataset registros={registros} anio={2025} />);
    expect(screen.getByText(/calidad del dataset/i)).toBeInTheDocument();
    expect(screen.getByText(/cobertura temporal/i)).toBeInTheDocument();
    expect(screen.getByText(/^días con generación$/i)).toBeInTheDocument();
    expect(screen.getByText(/^anomalías detectadas$/i)).toBeInTheDocument();
    expect(screen.getByText(/^granularidad$/i)).toBeInTheDocument();
  });

  it("año completo no bisiesto muestra cobertura 100.0% y granularidad 1 h", () => {
    const registros = generarAnio("2025-01-01", 365, 250);
    render(<PanelCalidadDataset registros={registros} anio={2025} />);
    // "100.0%" aparece dos veces (valor cobertura + nota días/calendario).
    // Confirmamos al menos una ocurrencia.
    expect(screen.getAllByText(/100\.0%/).length).toBeGreaterThan(0);
    expect(screen.getByText(/8,760 \/ 8,760 registros/)).toBeInTheDocument();
    expect(screen.getByText(/^1 h$/)).toBeInTheDocument();
  });

  it("dataset sin anomalías muestra mensaje 'Sin anomalías detectadas'", () => {
    const registros = generarAnio("2025-01-01", 60, 250);
    render(<PanelCalidadDataset registros={registros} anio={2025} />);
    expect(
      screen.getByText(/sin anomalías detectadas/i)
    ).toBeInTheDocument();
  });

  it("dataset con caída >30% lista la fecha en la nota", () => {
    const registros = [];
    for (let d = 0; d < 60; d += 1) {
      const pico = d === 30 ? 80 : 250; // 68% caída
      registros.push(...generarDiaPlano(sumarDias("2025-01-01", d), pico, 8, 17));
    }
    render(<PanelCalidadDataset registros={registros} anio={2025} />);
    // `Intl.DateTimeFormat` con `month: "short"` rinde "31 ene" en browser
    // y "31-ene" en jsdom. Aceptamos ambas separaciones.
    expect(screen.getByText(/31[\s-]ene/i)).toBeInTheDocument();
  });
});
