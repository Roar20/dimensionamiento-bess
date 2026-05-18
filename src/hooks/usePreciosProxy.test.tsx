import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import {
  PRECIOS_DEFAULT,
  limpiarPreciosProxyPersistidos,
  usePreciosProxy,
} from "@/hooks/usePreciosProxy";

beforeEach(() => limpiarPreciosProxyPersistidos());
afterEach(() => limpiarPreciosProxyPersistidos());

describe("usePreciosProxy", () => {
  it("arranca en defaults Estanzuela 2 cuando no hay localStorage", () => {
    const { result } = renderHook(() => usePreciosProxy());
    expect(result.current.precios).toEqual(PRECIOS_DEFAULT);
    expect(result.current.esProxy).toBe(true);
  });

  it("setPrecio acepta valores válidos por campo, persiste, y rehidrata", () => {
    const { result, unmount } = renderHook(() => usePreciosProxy());
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

    unmount();
    const segundo = renderHook(() => usePreciosProxy());
    expect(segundo.result.current.precios.energia_mxn_mwh).toBe(1200);
    expect(segundo.result.current.precios.cel_mxn).toBe(310);
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
