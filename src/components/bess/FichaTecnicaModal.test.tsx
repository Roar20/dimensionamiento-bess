import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FichaTecnicaModal } from "@/components/bess/FichaTecnicaModal";
import { CATALOGO_HYPERSTRONG } from "@/data/catalogo-hyperstrong";

const cubePlus = CATALOGO_HYPERSTRONG[0]!;

describe("FichaTecnicaModal", () => {
  it("renderiza el contenido cuando está abierto", () => {
    render(
      <FichaTecnicaModal
        equipo={cubePlus}
        abierto={true}
        onOpenChange={() => {}}
      />
    );
    expect(
      screen.getByRole("heading", { name: cubePlus.nombre })
    ).toBeInTheDocument();
    expect(screen.getByText(/261\.2 kWh/)).toBeInTheDocument();
    // Secciones esperadas.
    expect(screen.getByText(/^dc$/i)).toBeInTheDocument();
    expect(screen.getByText(/^ac$/i)).toBeInTheDocument();
    expect(screen.getByText(/^general$/i)).toBeInTheDocument();
    expect(screen.getByText(/^comercial$/i)).toBeInTheDocument();
  });

  it("no renderiza contenido cuando abierto=false", () => {
    render(
      <FichaTecnicaModal
        equipo={cubePlus}
        abierto={false}
        onOpenChange={() => {}}
      />
    );
    expect(screen.queryByText(/261\.2 kWh/)).not.toBeInTheDocument();
  });

  it("dispara onOpenChange(false) al presionar Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <FichaTecnicaModal
        equipo={cubePlus}
        abierto={true}
        onOpenChange={onOpenChange}
      />
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
