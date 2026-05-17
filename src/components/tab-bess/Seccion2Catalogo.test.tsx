import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Seccion2Catalogo } from "./Seccion2Catalogo";
import { recomendarEquipoOptimo } from "@/lib/bess/recomendacion";

describe("Seccion2Catalogo", () => {
  it("sin planta: muestra las 3 cards sin destacar ninguna", () => {
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

  it("con planta de 500 kW: destaca HyperCube II Max", () => {
    const recomendacion = recomendarEquipoOptimo(500);
    render(
      <Seccion2Catalogo
        recomendacion={recomendacion}
        onVerFicha={() => {}}
      />
    );
    const badge = screen.getByText(/punto de partida sugerido/i);
    expect(badge).toBeInTheDocument();
    // El badge debe estar en la card del II Max.
    const cardMax = screen.getByText("II Max").closest("[class*='border-2']");
    expect(cardMax).not.toBeNull();
  });

  it("click en 'Ver ficha completa' llama el callback con el id correcto", async () => {
    const user = userEvent.setup();
    const onVerFicha = vi.fn();
    render(
      <Seccion2Catalogo recomendacion={null} onVerFicha={onVerFicha} />
    );
    const botones = screen.getAllByRole("button", {
      name: /ver ficha completa/i,
    });
    await user.click(botones[0]!);
    expect(onVerFicha).toHaveBeenCalledTimes(1);
    expect(onVerFicha).toHaveBeenCalledWith("hypercube-plus");
  });
});
