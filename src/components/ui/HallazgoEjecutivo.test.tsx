import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { HallazgoEjecutivo } from "@/components/ui/HallazgoEjecutivo";

function rend(props: Parameters<typeof HallazgoEjecutivo>[0]) {
  return render(
    <MemoryRouter>
      <HallazgoEjecutivo {...props} />
    </MemoryRouter>
  );
}

describe("HallazgoEjecutivo", () => {
  it("renderiza título y párrafos", () => {
    rend({
      titulo: "Sin excedentes físicos en el año base",
      parrafos: ["Primer párrafo.", "Segundo párrafo."],
    });
    expect(
      screen.getByRole("heading", {
        name: /sin excedentes físicos en el año base/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/primer párrafo\./i)).toBeInTheDocument();
    expect(screen.getByText(/segundo párrafo\./i)).toBeInTheDocument();
  });

  it("incluye el CTA como link cuando se pasan ctaLabel y ctaHref", () => {
    rend({
      titulo: "T",
      parrafos: ["Ver más en otra tab."],
      ctaLabel: "Ver Tab SFV + BESS",
      ctaHref: "/sfv-bess",
    });
    const link = screen.getByRole("link", { name: /ver tab sfv \+ bess/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/sfv-bess");
  });

  it("omite el CTA cuando no se pasan ctaLabel ni ctaHref", () => {
    rend({ titulo: "T", parrafos: ["Solo texto."] });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
