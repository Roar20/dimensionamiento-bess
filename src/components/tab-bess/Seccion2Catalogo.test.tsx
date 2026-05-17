import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Seccion2Catalogo } from "./Seccion2Catalogo";
import { recomendarEquipoOptimo } from "@/lib/bess/recomendacion";

describe("Seccion2Catalogo", () => {
  it("sin recomendación: muestra las 3 cards sin destacar ninguna ni opacar", () => {
    render(
      <Seccion2Catalogo recomendacion={null} onVerFicha={() => {}} />
    );
    expect(screen.getByText("II Plus")).toBeInTheDocument();
    expect(screen.getByText("II Max")).toBeInTheDocument();
    expect(screen.getByText("Block III")).toBeInTheDocument();
    expect(
      screen.queryAllByText(/punto de partida sugerido/i)
    ).toHaveLength(0);
  });

  it("Tequila (POI 500, toda_energia 913 MWh): destaca HyperCube II Max", () => {
    const recomendacion = recomendarEquipoOptimo(500, 913, "toda_energia");
    render(
      <Seccion2Catalogo
        recomendacion={recomendacion}
        onVerFicha={() => {}}
      />
    );
    expect(screen.getByText(/punto de partida sugerido/i)).toBeInTheDocument();
    const cardMax = screen.getByText("II Max").closest("[class*='border-2']");
    expect(cardMax).not.toBeNull();
  });

  it("Tequila con energía libre baja (~50 MWh): destaca HyperCube II Plus", () => {
    const recomendacion = recomendarEquipoOptimo(
      500,
      50,
      "compromiso_ppa_mensual_mwh"
    );
    render(
      <Seccion2Catalogo
        recomendacion={recomendacion}
        onVerFicha={() => {}}
      />
    );
    const cardPlus = screen.getByText("II Plus").closest("[class*='border-2']");
    expect(cardPlus).not.toBeNull();
  });

  it("categoría con energía cero: alerta visible, cards en opacity 50", () => {
    const recomendacion = recomendarEquipoOptimo(
      500,
      0,
      "exceso_capacidad_cfe_kw"
    );
    const { container } = render(
      <Seccion2Catalogo
        recomendacion={recomendacion}
        onVerFicha={() => {}}
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    // Ninguna card destacada como recomendada
    expect(
      screen.queryByText(/punto de partida sugerido/i)
    ).not.toBeInTheDocument();
    // Las 3 cards están con opacity-50
    const cards = container.querySelectorAll("[class*='opacity-50']");
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });

  it("click en 'Ver ficha completa' propaga el id correcto", async () => {
    const user = userEvent.setup();
    const onVerFicha = vi.fn();
    render(
      <Seccion2Catalogo recomendacion={null} onVerFicha={onVerFicha} />
    );
    const botones = screen.getAllByRole("button", {
      name: /ver ficha completa/i,
    });
    await user.click(botones[0]!);
    expect(onVerFicha).toHaveBeenCalledWith("hypercube-plus");
  });
});
