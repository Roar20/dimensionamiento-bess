import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CATALOGO_HYPERSTRONG,
  type EquipoBESS,
} from "@/lib/bess/catalogo-hyperstrong";
import { recomendarEquipoOptimo } from "@/lib/bess/recomendacion";
import {
  calcularResumenCategorias,
  construirCategoriasDefault,
  DOD_DEFAULT,
} from "@/lib/core/bess";
import type { DatosSFV } from "@/types/sfv";
import type {
  ConfiguracionBESS,
  ParametrosPPA,
  ResumenCategoria,
  SeleccionCategoria,
} from "@/types/bess";

const STORAGE_KEY = "dimensionamiento-bess:configuracion-bess";
const MULTIPLICADOR_MIN = 1;
const MULTIPLICADOR_MAX = 20;

type Persistido = {
  equipoId: string;
  multiplicador: number;
};

function leerPersistido(): Persistido | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Persistido;
    if (
      typeof parsed.equipoId !== "string" ||
      typeof parsed.multiplicador !== "number"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function escribirPersistido(p: Persistido) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function limpiarConfiguracionBESSPersistida() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useConfiguracionBESS(
  datos: DatosSFV | null,
  params: ParametrosPPA | null,
  seleccionCategoria: SeleccionCategoria
) {
  const resumenes = useMemo<ResumenCategoria[]>(() => {
    if (!datos || !params) return [];
    const cats = construirCategoriasDefault(params);
    return calcularResumenCategorias(datos.registros, cats);
  }, [datos, params]);

  const equipoRecomendado: EquipoBESS | null = useMemo(() => {
    if (!datos || resumenes.length === 0) return null;
    const energiaCapturable =
      seleccionCategoria === "ninguna"
        ? resumenes.find((r) => r.categoria.tipo === "fuera_hora_punta_cfe")
            ?.total_mwh ?? 0
        : resumenes.find((r) => r.categoria.tipo === seleccionCategoria)
            ?.total_mwh ?? 0;
    const r = recomendarEquipoOptimo(
      datos.config.capacidad_poi_kw,
      energiaCapturable,
      seleccionCategoria
    );
    return r.equipo_recomendado;
  }, [datos, resumenes, seleccionCategoria]);

  const [equipoId, setEquipoIdState] = useState<string>(
    () => leerPersistido()?.equipoId ?? "hypercube-max"
  );
  const [multiplicador, setMultiplicadorState] = useState<number>(
    () => leerPersistido()?.multiplicador ?? 1
  );

  // Si llega un recomendado y no había nada persistido, sugiere el recomendado.
  useEffect(() => {
    if (equipoRecomendado && !leerPersistido()) {
      setEquipoIdState(equipoRecomendado.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipoRecomendado?.id]);

  useEffect(() => {
    escribirPersistido({ equipoId, multiplicador });
  }, [equipoId, multiplicador]);

  const equipoSeleccionado =
    CATALOGO_HYPERSTRONG.find((e) => e.id === equipoId) ??
    CATALOGO_HYPERSTRONG[1]!;

  const configuracionBESS: ConfiguracionBESS = useMemo(
    () => ({
      p_kw: equipoSeleccionado.kw_ac * multiplicador,
      e_kwh: equipoSeleccionado.kwh * multiplicador,
      dod: DOD_DEFAULT,
      rte: equipoSeleccionado.eficiencia_max,
      soc_inicial_kwh: 0,
    }),
    [equipoSeleccionado, multiplicador]
  );

  const setEquipo = useCallback((id: string) => {
    setEquipoIdState(id);
  }, []);

  const setMultiplicador = useCallback((n: number) => {
    const clamped = Math.max(
      MULTIPLICADOR_MIN,
      Math.min(MULTIPLICADOR_MAX, Math.round(n))
    );
    setMultiplicadorState(clamped);
  }, []);

  return {
    equipoSeleccionado,
    multiplicador,
    setEquipo,
    setMultiplicador,
    equipoRecomendado,
    configuracionBESS,
    resumenes,
    MULTIPLICADOR_MIN,
    MULTIPLICADOR_MAX,
  };
}
