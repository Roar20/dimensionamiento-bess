import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PRECIOS_DEFAULT, usePreciosProxy } from "@/hooks/usePreciosProxy";

describe("usePreciosProxy", () => {
  it("arranca en defaults Estanzuela 2 (stateless, sin localStorage)", () => {
    const { result } = renderHook(() => usePreciosProxy());
    expect(result.current.precios).toEqual(PRECIOS_DEFAULT);
    expect(result.current.esProxy).toBe(true);
  });

  it("setPrecio acepta valores válidos por campo y actualiza el estado", () => {
    const { result } = renderHook(() => usePreciosProxy());
    act(() => {
      expect(result.current.setPrecio("energia_mxn_mwh", 1200)).toBe(true);
      expect(result.current.setPrecio("cel_mxn", 310)).toBe(true);
      expect(
        result.current.setPrecio("potencia_firme_mxn_mw_mes", 25000)
      ).toBe(true);
    });
    expect(result.current.precios.energia_mxn_mwh).toBe(1200);
    expect(result.current.precios.cel_mxn).toBe(310);
    expect(result.current.precios.potencia_firme_mxn_mw_mes).toBe(25000);
    expect(result.current.esProxy).toBe(false);
  });

  it("rechaza valores inválidos (negativos, 0, NaN) y conserva los previos", () => {
    const { result } = renderHook(() => usePreciosProxy());
    const previo = { ...result.current.precios };
    act(() => {
      expect(result.current.setPrecio("energia_mxn_mwh", -100)).toBe(false);
      expect(result.current.setPrecio("cel_mxn", 0)).toBe(false);
      expect(
        result.current.setPrecio("potencia_firme_mxn_mw_mes", NaN)
      ).toBe(false);
    });
    expect(result.current.precios).toEqual(previo);
  });

  it("reset() vuelve a los defaults y marca esProxy=true", () => {
    const { result } = renderHook(() => usePreciosProxy());
    act(() => {
      result.current.setPrecio("energia_mxn_mwh", 1500);
    });
    expect(result.current.esProxy).toBe(false);
    act(() => {
      result.current.reset();
    });
    expect(result.current.precios).toEqual(PRECIOS_DEFAULT);
    expect(result.current.esProxy).toBe(true);
  });
});
