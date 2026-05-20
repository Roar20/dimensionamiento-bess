import { useCallback, useEffect, useMemo, useState } from "react";

import type { DatosSFV, RegistroHorario } from "@/types/sfv";
import {
  calcularPeriodosDisponibles,
  construirPeriodoAnual,
  construirPeriodoDiario,
  construirPeriodoMensual,
  construirPeriodoSemestral,
  construirPeriodoTrimestral,
  filtrarRegistros,
  type Granularidad,
  type PeriodoActivo,
} from "@/lib/tab-sfv/filtrar-por-periodo";

// Stateless: granularidad y período seleccionado viven solo en memoria.
// Sin persistencia en localStorage.

export type UsePeriodoActivoResult = {
  periodo: PeriodoActivo | null;
  granularidad: Granularidad;
  setGranularidad: (g: Granularidad) => void;
  irAnterior: () => void;
  irSiguiente: () => void;
  hayAnterior: boolean;
  haySiguiente: boolean;
  seleccionarPorId: (id: string) => void;
  registrosFiltrados: RegistroHorario[];
  periodosDisponibles: PeriodoActivo[];
};

export function usePeriodoActivo(
  datos: DatosSFV | null
): UsePeriodoActivoResult {
  const [granularidad, setGranularidadState] =
    useState<Granularidad>("anual");
  const [indice, setIndice] = useState<number>(0);

  const periodosDisponibles = useMemo<PeriodoActivo[]>(() => {
    if (!datos) return [];
    return calcularPeriodosDisponibles(datos.registros, granularidad);
  }, [datos, granularidad]);

  useEffect(() => {
    if (periodosDisponibles.length === 0) {
      setIndice(0);
      return;
    }
    if (indice >= periodosDisponibles.length) {
      setIndice(periodosDisponibles.length - 1);
    }
  }, [periodosDisponibles, indice]);

  const periodo = periodosDisponibles[indice] ?? null;

  const registrosFiltrados = useMemo<RegistroHorario[]>(() => {
    if (!datos || !periodo) return [];
    return filtrarRegistros(datos.registros, periodo);
  }, [datos, periodo]);

  const setGranularidad = useCallback(
    (g: Granularidad) => {
      if (g === granularidad) return;
      const previo = periodo;
      const nuevos = datos
        ? calcularPeriodosDisponibles(datos.registros, g)
        : [];
      let nuevoIndice = 0;
      if (previo && nuevos.length > 0) {
        const target = previo.fechaInicio.getTime();
        const candidato = nuevos.findIndex(
          (p) =>
            p.fechaInicio.getTime() <= target &&
            p.fechaFin.getTime() > target
        );
        if (candidato >= 0) nuevoIndice = candidato;
      }
      setGranularidadState(g);
      setIndice(nuevoIndice);
    },
    [granularidad, periodo, datos]
  );

  const irAnterior = useCallback(() => {
    setIndice((i) => Math.max(0, i - 1));
  }, []);
  const irSiguiente = useCallback(() => {
    setIndice((i) =>
      Math.min(Math.max(periodosDisponibles.length - 1, 0), i + 1)
    );
  }, [periodosDisponibles.length]);

  const seleccionarPorId = useCallback(
    (id: string) => {
      const idx = periodosDisponibles.findIndex((p) => p.id === id);
      if (idx >= 0) setIndice(idx);
    },
    [periodosDisponibles]
  );

  return {
    periodo,
    granularidad,
    setGranularidad,
    irAnterior,
    irSiguiente,
    hayAnterior: indice > 0,
    haySiguiente: indice < periodosDisponibles.length - 1,
    seleccionarPorId,
    registrosFiltrados,
    periodosDisponibles,
  };
}

export {
  construirPeriodoAnual,
  construirPeriodoDiario,
  construirPeriodoMensual,
  construirPeriodoSemestral,
  construirPeriodoTrimestral,
  type Granularidad,
  type PeriodoActivo,
};
