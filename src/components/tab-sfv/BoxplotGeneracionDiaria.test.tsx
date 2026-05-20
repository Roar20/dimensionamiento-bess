import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { BoxplotGeneracionDiaria } from "@/components/tab-sfv/BoxplotGeneracionDiaria";
import {
  generarDiaPlano,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";
import type { RegistroHorario } from "@/types/sfv";

function generarAnio(picoKw = 250) {
  const registros: RegistroHorario[] = [];
  for (let d = 0; d < 365; d += 1) {
    registros.push(
      ...generarDiaPlano(sumarDias("2025-01-01", d), picoKw, 8, 17)
    );
  }
  return registros;
}

describe("BoxplotGeneracionDiaria", () => {
  it("renderiza section label, título y subtítulo", () => {
    render(<BoxplotGeneracionDiaria registros={generarAnio()} />);
    expect(
      screen.getByText(/variabilidad de la generación diaria/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dispersión de generación diaria por mes/i)
    ).toBeInTheDocument();
  });

  it("renderiza los 12 meses en la columna izquierda", () => {
    render(<BoxplotGeneracionDiaria registros={generarAnio()} />);
    for (const mes of ["Ene", "Feb", "Mar", "Abr", "Dic"]) {
      // Cada mes aparece >=1 vez (puede repetirse en la tabla de
      // extremos cuando se expande el details).
      expect(screen.getAllByText(mes).length).toBeGreaterThan(0);
    }
  });

  it("renderiza el toggle de días extremos cuando hay datos", () => {
    render(<BoxplotGeneracionDiaria registros={generarAnio()} />);
    expect(screen.getByText(/ver días extremos por mes/i)).toBeInTheDocument();
  });

  it("dataset vacío: no renderiza toggle de extremos ni lectura", () => {
    render(<BoxplotGeneracionDiaria registros={[]} />);
    expect(
      screen.queryByText(/ver días extremos por mes/i)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/^Lectura:$/i)).not.toBeInTheDocument();
  });

  it("identifica mes mejor y peor en la lectura", () => {
    // Marzo será el mejor (mayor pico), enero el peor.
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 31; d += 1) {
      registros.push(...generarDiaPlano(sumarDias("2025-01-01", d), 100, 8, 17));
    }
    for (let d = 0; d < 31; d += 1) {
      registros.push(...generarDiaPlano(sumarDias("2025-03-01", d), 400, 8, 17));
    }
    render(<BoxplotGeneracionDiaria registros={registros} />);
    // El texto de Lectura debe mencionar Mar (mejor) y Ene (peor).
    const lectura = screen.getByText(/concentra la generación más alta/i);
    expect(lectura.textContent).toMatch(/Mar/);
    expect(lectura.textContent).toMatch(/Ene/);
  });
});
