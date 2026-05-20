import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { HeatmapExcedente } from "@/components/tab-sfv/HeatmapExcedente";
import {
  createRegistro,
  generarDiaPlano,
  sumarDias,
} from "@/test/fixtures/sfv-fixtures";
import type { RegistroHorario } from "@/types/sfv";

const POI = 500;

describe("HeatmapExcedente", () => {
  it("retorna null cuando no hay excedentes (caso Tequila)", () => {
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      registros.push(
        ...generarDiaPlano(sumarDias("2025-03-01", d), 250, 8, 17)
      );
    }
    const { container } = render(
      <HeatmapExcedente registros={registros} poiKw={POI} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza section label, título y leyenda cuando hay excedentes", () => {
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 0; h < 24; h += 1) {
        const kw = h === 12 ? POI + 200 : 0;
        registros.push(createRegistro(fecha, h, kw / 1000));
      }
    }
    render(<HeatmapExcedente registros={registros} poiKw={POI} />);
    expect(
      screen.getByText(/distribución del excedente sobre poi/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/excedente por hora del día y mes/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/^0 kwh$/i)).toBeInTheDocument();
    expect(screen.getByText(/^≥ 250 kwh$/i)).toBeInTheDocument();
  });

  it("renderiza el toggle de top 10 cuando hay excedentes", () => {
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 0; h < 24; h += 1) {
        const kw = h === 12 ? POI + 200 : 0;
        registros.push(createRegistro(fecha, h, kw / 1000));
      }
    }
    render(<HeatmapExcedente registros={registros} poiKw={POI} />);
    expect(
      screen.getByText(/ver top 10 horas-mes con mayor excedente/i)
    ).toBeInTheDocument();
  });

  it("incluye la hora fin de descarga parametrizada en la lectura", () => {
    const registros: RegistroHorario[] = [];
    for (let d = 0; d < 30; d += 1) {
      const fecha = sumarDias("2025-03-01", d);
      for (let h = 0; h < 24; h += 1) {
        const kw = h === 12 ? POI + 200 : 0;
        registros.push(createRegistro(fecha, h, kw / 1000));
      }
    }
    render(
      <HeatmapExcedente registros={registros} poiKw={POI} horaFinDescarga={20} />
    );
    expect(screen.getByText(/horario punta CFE \(18–20h\)/i)).toBeInTheDocument();
  });
});
