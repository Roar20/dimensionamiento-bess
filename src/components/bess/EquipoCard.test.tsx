import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EquipoCard } from "@/components/bess/EquipoCard";
import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";

const cubePlus = CATALOGO_HYPERSTRONG[0]!;
const cubeMax = CATALOGO_HYPERSTRONG[1]!;
const blockIii = CATALOGO_HYPERSTRONG[2]!;

function rend(equipo = cubePlus, tipoCambio = 20) {
  return render(
    <EquipoCard
      equipo={equipo}
      tipoCambio={tipoCambio}
      onAbrirFicha={() => {}}
    />
  );
}

describe("EquipoCard", () => {
  it("renderiza nombre, modelo y capacidad del equipo", () => {
    rend();
    expect(
      screen.getByRole("heading", { name: cubePlus.nombre })
    ).toBeInTheDocument();
    expect(screen.getByText(cubePlus.modelo)).toBeInTheDocument();
    expect(screen.getByText(/261\.2 kWh/)).toBeInTheDocument();
  });

  it("muestra badge 'Aplicable a Tequila' en Cube Plus y Cube Max, no en Block III", () => {
    const { rerender } = render(
      <EquipoCard equipo={cubePlus} tipoCambio={20} onAbrirFicha={() => {}} />
    );
    expect(screen.getByText(/aplicable a tequila/i)).toBeInTheDocument();

    rerender(
      <EquipoCard equipo={cubeMax} tipoCambio={20} onAbrirFicha={() => {}} />
    );
    expect(screen.getByText(/aplicable a tequila/i)).toBeInTheDocument();

    rerender(
      <EquipoCard equipo={blockIii} tipoCambio={20} onAbrirFicha={() => {}} />
    );
    expect(screen.queryByText(/aplicable a tequila/i)).not.toBeInTheDocument();
  });

  it("botón 'Ficha técnica' dispara onAbrirFicha; botón 'PDF' apunta al datasheet", async () => {
    const user = userEvent.setup();
    const onAbrirFicha = vi.fn();
    render(
      <EquipoCard
        equipo={cubePlus}
        tipoCambio={20}
        onAbrirFicha={onAbrirFicha}
      />
    );

    await user.click(screen.getByRole("button", { name: /ficha técnica/i }));
    expect(onAbrirFicha).toHaveBeenCalledTimes(1);
    expect(onAbrirFicha).toHaveBeenCalledWith(cubePlus);

    const pdfLink = screen.getByRole("link", { name: /pdf/i });
    expect(pdfLink).toHaveAttribute("href", "/datasheets/hypercube-plus.pdf");
    expect(pdfLink).toHaveAttribute("target", "_blank");
    expect(pdfLink).toHaveAttribute("rel", "noopener");
  });

  it("muestra chip MXN debajo de cada precio USD", () => {
    rend(cubePlus, 20);
    // USD 55,997 → MX$ 1,119,940. USD 214 → MX$ 4,280.
    expect(screen.getByText(/USD 55,997/)).toBeInTheDocument();
    expect(screen.getByText(/\$1,119,940/)).toBeInTheDocument();
    expect(screen.getByText(/USD 214/)).toBeInTheDocument();
    expect(screen.getByText(/\$4,280/)).toBeInTheDocument();
  });

  it("renderiza las 4 magnitudes físicas en filas separadas con sus tooltips de trazabilidad", () => {
    rend();
    // Cuarteto arquitectónico: capacidad nominal, potencia AC PCS, DoD, RTE.
    expect(screen.getByText("Capacidad nominal")).toBeInTheDocument();
    expect(screen.getByText("Potencia AC PCS")).toBeInTheDocument();
    expect(screen.getByText("DoD")).toBeInTheDocument();
    expect(screen.getByText("RTE")).toBeInTheDocument();

    // Cada una expone su botón de trazabilidad (info-circle).
    expect(
      screen.getByRole("button", {
        name: /trazabilidad: capacidad nominal/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /trazabilidad: potencia ac pcs/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: dod del sistema/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trazabilidad: rte del sistema/i })
    ).toBeInTheDocument();
  });

  it("NUNCA renderiza métricas colapsadas tipo 'capacidad equivalente' o 'potencia firme típica'", () => {
    const { container, rerender } = render(
      <EquipoCard equipo={cubePlus} tipoCambio={20} onAbrirFicha={() => {}} />
    );
    const PROHIBIDAS =
      /capacidad equivalente|potencia firme típica|energía firme/i;
    expect(container.textContent ?? "").not.toMatch(PROHIBIDAS);

    // Defensa para los 3 equipos.
    rerender(
      <EquipoCard equipo={cubeMax} tipoCambio={20} onAbrirFicha={() => {}} />
    );
    expect(container.textContent ?? "").not.toMatch(PROHIBIDAS);
    rerender(
      <EquipoCard equipo={blockIii} tipoCambio={20} onAbrirFicha={() => {}} />
    );
    expect(container.textContent ?? "").not.toMatch(PROHIBIDAS);
  });
});
