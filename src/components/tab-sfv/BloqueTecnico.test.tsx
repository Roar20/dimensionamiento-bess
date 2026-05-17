import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, type ReactNode } from "react";

import { BloqueTecnico } from "./BloqueTecnico";
import { ViewModeProvider, useViewMode } from "@/context/ViewModeContext";

function SetTecnico() {
  const { setMode } = useViewMode();
  useEffect(() => {
    setMode("tecnico");
  }, [setMode]);
  return null;
}

function renderEnTecnico(node: ReactNode) {
  return render(
    <ViewModeProvider>
      <SetTecnico />
      {node}
    </ViewModeProvider>
  );
}

describe("BloqueTecnico", () => {
  it("no renderiza icono (i) cuando no hay prop tooltip", () => {
    renderEnTecnico(
      <BloqueTecnico titulo="Detalle técnico">contenido</BloqueTecnico>
    );
    expect(
      screen.queryByLabelText(/más información/i)
    ).not.toBeInTheDocument();
  });

  it("renderiza icono (i) cuando se pasa tooltip", () => {
    renderEnTecnico(
      <BloqueTecnico titulo="Detalle técnico" tooltip="Explicación de algo">
        contenido
      </BloqueTecnico>
    );
    expect(screen.getByLabelText(/más información/i)).toBeInTheDocument();
  });

  it("click en el icono (i) no expande/colapsa el details", async () => {
    const user = userEvent.setup();
    renderEnTecnico(
      <BloqueTecnico titulo="Detalle técnico" tooltip="Explicación de algo">
        contenido
      </BloqueTecnico>
    );

    const details = screen.getByText(/detalle técnico/i).closest("details") as HTMLDetailsElement;
    expect(details.open).toBe(false);

    await user.click(screen.getByLabelText(/más información/i));
    expect(details.open).toBe(false);
  });

  it("no renderiza nada cuando mode !== tecnico", () => {
    const { container } = render(
      <ViewModeProvider>
        <BloqueTecnico titulo="Detalle técnico">contenido</BloqueTecnico>
      </ViewModeProvider>
    );
    expect(container.firstChild).toBeNull();
  });
});
