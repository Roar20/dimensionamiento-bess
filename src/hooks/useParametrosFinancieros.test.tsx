import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import {
  PARAMETROS_FINANCIEROS_DEFAULT,
  limpiarParametrosFinancierosPersistidos,
  useParametrosFinancieros,
} from "@/hooks/useParametrosFinancieros";

beforeEach(() => limpiarParametrosFinancierosPersistidos());
afterEach(() => limpiarParametrosFinancierosPersistidos());

describe("useParametrosFinancieros", () => {
  it("monta con defaults validados marzo 2026 cuando no hay persistencia", () => {
    const { result } = renderHook(() => useParametrosFinancieros());
    expect(result.current.params).toEqual(PARAMETROS_FINANCIEROS_DEFAULT);
    expect(result.current.params.precio_energia_mxn_mwh).toBe(1010.80);
    expect(result.current.params.precio_cel_mxn).toBe(190);
    expect(result.current.params.precio_potencia_firme_mxn_mw_mes).toBe(333_334);
    expect(result.current.params.lmp_mxn_mwh).toBe(360);
    expect(result.current.params.factor_produccion).toBe(1.0);
    expect(result.current.params.factor_credibilidad_pfirme).toBe(0.40);
  });

  it("actualizar persiste el cambio y mezcla con el estado previo", () => {
    const { result } = renderHook(() => useParametrosFinancieros());
    act(() => result.current.actualizar({ factor_produccion: 1.5 }));
    expect(result.current.params.factor_produccion).toBe(1.5);
    expect(result.current.params.wacc_pct).toBe(0.10);
    const persistido = JSON.parse(
      window.localStorage.getItem(
        "dimensionamiento-bess:parametros-financieros"
      ) ?? "{}"
    );
    expect(persistido.factor_produccion).toBe(1.5);
  });

  it("resetear vuelve a los defaults y persiste", () => {
    const { result } = renderHook(() => useParametrosFinancieros());
    act(() => result.current.actualizar({ wacc_pct: 0.15 }));
    expect(result.current.params.wacc_pct).toBe(0.15);
    act(() => result.current.resetear());
    expect(result.current.params).toEqual(PARAMETROS_FINANCIEROS_DEFAULT);
  });

  it("descarta persistencia inválida y cae a defaults", () => {
    window.localStorage.setItem(
      "dimensionamiento-bess:parametros-financieros",
      JSON.stringify({ factor_produccion: 5.0 })
    );
    const { result } = renderHook(() => useParametrosFinancieros());
    expect(result.current.params).toEqual(PARAMETROS_FINANCIEROS_DEFAULT);
  });
});
