import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PanelPreciosEditables } from "@/components/tab-sfv-bess/PanelPreciosEditables";
import { PRECIOS_DEFAULT } from "@/hooks/usePreciosProxy";

function rend(overrides: Partial<Parameters<typeof PanelPreciosEditables>[0]> = {}) {
  const setPrecio = vi.fn().mockReturnValue(true);
  const reset = vi.fn();
  const setTipoCambio = vi.fn().mockReturnValue(true);
  const props = {
    precios: PRECIOS_DEFAULT,
    setPrecio,
    reset,
    esProxy: true,
    tipoCambio: 20,
    setTipoCambio,
    ...overrides,
  };
  return { ...render(<PanelPreciosEditables {...props} />), setPrecio, reset, setTipoCambio };
}

describe("PanelPreciosEditables", () => {
  it("renderiza los 4 controles (TC + 3 precios)", () => {
    rend();
    expect(
      screen.getByLabelText(/tipo de cambio mxn por usd/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/precio energía ppa en mxn\/mwh/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/precio potencia firme en mxn\/mw-mes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/precio cel en mxn\/mwh/i)
    ).toBeInTheDocument();
  });

  it("escribir en input + blur llama a setPrecio del hook controlado", async () => {
    const user = userEvent.setup();
    const { setPrecio } = rend();
    const input = screen.getByLabelText(/precio energía ppa en mxn\/mwh/i);
    await user.clear(input);
    await user.type(input, "1500");
    await user.tab();
    expect(setPrecio).toHaveBeenCalledWith("energia_mxn_mwh", 1500);
  });
});
