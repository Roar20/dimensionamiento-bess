import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";

import {
  limpiarTipoCambioPersistido,
  useTipoCambio,
} from "@/hooks/useTipoCambio";

const STORAGE_KEY = "dimensionamiento-bess:tipo-cambio";

beforeEach(() => {
  limpiarTipoCambioPersistido();
});

afterEach(() => {
  limpiarTipoCambioPersistido();
});

describe("useTipoCambio", () => {
  it("arranca en 20 cuando no hay valor en localStorage", () => {
    const { result } = renderHook(() => useTipoCambio());
    expect(result.current.tipoCambio).toBe(20);
  });

  it("acepta 19.50, persiste, y se recupera tras remount", () => {
    const { result, unmount } = renderHook(() => useTipoCambio());
    act(() => {
      expect(result.current.setTipoCambio(19.5)).toBe(true);
    });
    expect(result.current.tipoCambio).toBe(19.5);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("19.5");

    unmount();
    const segundo = renderHook(() => useTipoCambio());
    expect(segundo.result.current.tipoCambio).toBe(19.5);
  });

  it("rechaza 19.555 (más de 2 decimales) y conserva el valor previo", () => {
    const { result } = renderHook(() => useTipoCambio());
    act(() => {
      expect(result.current.setTipoCambio(19.555)).toBe(false);
    });
    expect(result.current.tipoCambio).toBe(20);
  });

  it("rechaza -5 y conserva el valor previo", () => {
    const { result } = renderHook(() => useTipoCambio());
    act(() => {
      expect(result.current.setTipoCambio(-5)).toBe(false);
    });
    expect(result.current.tipoCambio).toBe(20);
  });

  it("rechaza 150 (fuera del rango superior) y conserva el valor previo", () => {
    const { result } = renderHook(() => useTipoCambio());
    act(() => {
      expect(result.current.setTipoCambio(150)).toBe(false);
    });
    expect(result.current.tipoCambio).toBe(20);
  });

  it("acepta 0.01 como límite inferior estricto", () => {
    const { result } = renderHook(() => useTipoCambio());
    act(() => {
      expect(result.current.setTipoCambio(0.01)).toBe(true);
    });
    expect(result.current.tipoCambio).toBe(0.01);
  });

  it("acepta 99.99 como límite superior estricto", () => {
    const { result } = renderHook(() => useTipoCambio());
    act(() => {
      expect(result.current.setTipoCambio(99.99)).toBe(true);
    });
    expect(result.current.tipoCambio).toBe(99.99);
  });
});
