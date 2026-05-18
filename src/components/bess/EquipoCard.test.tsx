import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EquipoCard } from "@/components/bess/EquipoCard";
import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";

const cubePlus = CATALOGO_HYPERSTRONG[0]!;
const cubeMax = CATALOGO_HYPERSTRONG[1]!;
const blockIii = CATALOGO_HYPERSTRONG[2]!;

describe("EquipoCard", () => {
  it("renderiza nombre, modelo y specs del equipo", () => {
    render(<EquipoCard equipo={cubePlus} onAbrirFicha={() => {}} />);
    expect(
      screen.getByRole("heading", { name: cubePlus.nombre })
    ).toBeInTheDocument();
    expect(screen.getByText(cubePlus.modelo)).toBeInTheDocument();
    expect(screen.getByText(/261\.2 kWh/)).toBeInTheDocument();
    expect(screen.getByText(/125 kVA/)).toBeInTheDocument();
  });

  it("muestra badge 'Aplicable a Tequila' en Cube Plus y Cube Max, no en Block III", () => {
    const { rerender } = render(
      <EquipoCard equipo={cubePlus} onAbrirFicha={() => {}} />
    );
    expect(screen.getByText(/aplicable a tequila/i)).toBeInTheDocument();

    rerender(<EquipoCard equipo={cubeMax} onAbrirFicha={() => {}} />);
    expect(screen.getByText(/aplicable a tequila/i)).toBeInTheDocument();

    rerender(<EquipoCard equipo={blockIii} onAbrirFicha={() => {}} />);
    expect(screen.queryByText(/aplicable a tequila/i)).not.toBeInTheDocument();
  });

  it("botón 'Ficha técnica' dispara onAbrirFicha; botón 'PDF' apunta al datasheet", async () => {
    const user = userEvent.setup();
    const onAbrirFicha = vi.fn();
    render(<EquipoCard equipo={cubePlus} onAbrirFicha={onAbrirFicha} />);

    await user.click(screen.getByRole("button", { name: /ficha técnica/i }));
    expect(onAbrirFicha).toHaveBeenCalledTimes(1);
    expect(onAbrirFicha).toHaveBeenCalledWith(cubePlus);

    const pdfLink = screen.getByRole("link", { name: /pdf/i });
    expect(pdfLink).toHaveAttribute("href", "/datasheets/hypercube-plus.pdf");
    expect(pdfLink).toHaveAttribute("target", "_blank");
    expect(pdfLink).toHaveAttribute("rel", "noopener");
  });
});
