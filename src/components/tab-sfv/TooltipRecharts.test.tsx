import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TooltipRecharts } from "./TooltipRecharts";

describe("TooltipRecharts", () => {
  it("no renderiza nada cuando active=false", () => {
    const { container } = render(
      <TooltipRecharts active={false} formatear={() => []} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("no renderiza nada cuando el payload está vacío", () => {
    const { container } = render(
      <TooltipRecharts active={true} payload={[]} formatear={() => []} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza los items formateados", () => {
    render(
      <TooltipRecharts
        active={true}
        payload={[{ value: 42, name: "x" } as never]}
        formatear={() => [
          { label: "Promedio", valor: "100 kW", color: "#4A7C59" },
          { label: "Máximo", valor: "200 kW", color: "#D97706" },
        ]}
      />
    );
    expect(screen.getByText("Promedio")).toBeInTheDocument();
    expect(screen.getByText("100 kW")).toBeInTheDocument();
    expect(screen.getByText("Máximo")).toBeInTheDocument();
    expect(screen.getByText("200 kW")).toBeInTheDocument();
  });

  it("renderiza título cuando se pasa la prop", () => {
    render(
      <TooltipRecharts
        active={true}
        payload={[{ value: 1 } as never]}
        label="13"
        titulo={(l) => `Hora ${l}h`}
        formatear={() => [{ label: "Energía", valor: "1 MWh" }]}
      />
    );
    expect(screen.getByText("Hora 13h")).toBeInTheDocument();
  });

  it("aplica color del swatch correctamente", () => {
    const { container } = render(
      <TooltipRecharts
        active={true}
        payload={[{ value: 1 } as never]}
        formatear={() => [{ label: "x", valor: "y", color: "#ff0000" }]}
      />
    );
    const swatch = container.querySelector("span[style]") as HTMLElement;
    expect(swatch).toBeTruthy();
    expect(swatch.style.backgroundColor).toMatch(/rgb\(255,\s*0,\s*0\)/);
  });
});
