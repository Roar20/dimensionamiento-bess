import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PanelPreciosEditables } from "@/components/tab-sfv-bess/PanelPreciosEditables";
import { limpiarPreciosProxyPersistidos } from "@/hooks/usePreciosProxy";
import { limpiarTipoCambioPersistido } from "@/hooks/useTipoCambio";

beforeEach(() => {
  limpiarPreciosProxyPersistidos();
  limpiarTipoCambioPersistido();
});
afterEach(() => {
  limpiarPreciosProxyPersistidos();
  limpiarTipoCambioPersistido();
});

describe("PanelPreciosEditables", () => {
  it("renderiza los 4 controles (TC + 3 precios) con sus valores default", () => {
    render(<PanelPreciosEditables />);
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

  it("escribir un valor en el input de energía + blur dispara persistencia (esProxy=false → reset habilitado)", async () => {
    const user = userEvent.setup();
    render(<PanelPreciosEditables />);
    // Antes del cambio el reset está deshabilitado (esProxy=true).
    const reset = screen.getByRole("button", { name: /restablecer defaults/i });
    expect(reset).toBeDisabled();

    const input = screen.getByLabelText(/precio energía ppa en mxn\/mwh/i);
    await user.clear(input);
    await user.type(input, "1500");
    await user.tab();

    expect(reset).toBeEnabled();
  });
});
