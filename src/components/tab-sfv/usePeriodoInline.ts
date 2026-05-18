import { useCallback, useEffect, useMemo, useState } from "react";

import {
  calcularPeriodosDisponibles,
  filtrarRegistros,
  type Granularidad,
  type PeriodoActivo,
} from "@/lib/tab-sfv/filtrar-por-periodo";
import type { RegistroHorario } from "@/types/sfv";

interface Result {
  granularidad: Granularidad;
  setGranularidad: (g: Granularidad) => void;
  periodo: PeriodoActivo | null;
  periodos: PeriodoActivo[];
  registrosFiltrados: RegistroHorario[];
  seleccionarPorId: (id: string) => void;
  irAnterior: () => void;
  irSiguiente: () => void;
  hayAnterior: boolean;
  haySiguiente: boolean;
}

/**
 * Estado de periodo local a un chart. No persiste en localStorage (a
 * diferencia de `usePeriodoActivo`, que es global compartido entre tabs).
 * Default = anual.
 */
export function usePeriodoInline(
  registros: readonly RegistroHorario[]
): Result {
  const [granularidad, setGranularidadState] = useState<Granularidad>("anual");
  const [indice, setIndice] = useState(0);

  const periodos = useMemo(
    () => calcularPeriodosDisponibles(registros, granularidad),
    [registros, granularidad]
  );

  useEffect(() => {
    if (periodos.length === 0) {
      if (indice !== 0) setIndice(0);
      return;
    }
    if (indice >= periodos.length) setIndice(periodos.length - 1);
  }, [periodos, indice]);

  const periodo = periodos[indice] ?? null;

  const registrosFiltrados = useMemo(
    () => (periodo ? filtrarRegistros(registros, periodo) : []),
    [registros, periodo]
  );

  const setGranularidad = useCallback((g: Granularidad) => {
    setGranularidadState(g);
    setIndice(0);
  }, []);

  const seleccionarPorId = useCallback(
    (id: string) => {
      const idx = periodos.findIndex((p) => p.id === id);
      if (idx >= 0) setIndice(idx);
    },
    [periodos]
  );

  const irAnterior = useCallback(() => {
    setIndice((i) => Math.max(0, i - 1));
  }, []);

  const irSiguiente = useCallback(() => {
    setIndice((i) => Math.min(periodos.length - 1, i + 1));
  }, [periodos.length]);

  return {
    granularidad,
    setGranularidad,
    periodo,
    periodos,
    registrosFiltrados,
    seleccionarPorId,
    irAnterior,
    irSiguiente,
    hayAnterior: indice > 0,
    haySiguiente: indice < periodos.length - 1,
  };
}
