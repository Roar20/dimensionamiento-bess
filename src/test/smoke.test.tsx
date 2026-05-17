import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "@/App";

describe("Módulo 0 — smoke", () => {
  it("renderiza la página Home con el placeholder de bootstrap", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /módulo 0 ok/i })
    ).toBeInTheDocument();
  });

  it("muestra el header con los 4 tabs deshabilitados", () => {
    render(<App />);
    for (const label of ["SFV", "BESS", "SFV + BESS", "Análisis financiero"]) {
      const item = screen.getByText(label);
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute("aria-disabled", "true");
    }
  });

  it("inicia en vista cliente por default", () => {
    render(<App />);
    const toggle = screen.getByRole("switch", {
      name: /activar vista técnica/i,
    });
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("al clickear el toggle cambia a técnico y persiste tras recarga", async () => {
    const user = userEvent.setup();
    const first = render(<App />);
    const toggle = screen.getByRole("switch", {
      name: /activar vista técnica/i,
    });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(window.localStorage.getItem("dimensionamiento-bess:viewMode")).toBe(
      "tecnico"
    );

    first.unmount();

    render(<App />);
    const toggleAfter = screen.getByRole("switch", {
      name: /activar vista técnica/i,
    });
    expect(toggleAfter).toHaveAttribute("aria-checked", "true");
  });
});
