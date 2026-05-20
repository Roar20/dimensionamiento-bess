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

// Stateless: configuración del BESS vive solo en memoria React.
// Sin persistencia en localStorage. Al cambiar planta o refrescar,
// vuelve a defaults / recomendación.
const MULTIPLICADOR_MIN = 1;
const MULTIPLICADOR_MAX = 20;
const EQUIPO_DEFAULT_ID = "hypercube-max";

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

  const [equipoId, setEquipoIdState] = useState<string>(EQUIPO_DEFAULT_ID);
  const [multiplicador, setMultiplicadorState] = useState<number>(1);

  // Si llega un recomendado, sugiere el recomendado. Sin persistencia
  // que evite el set: cada vez que cambia equipoRecomendado, se aplica.
  useEffect(() => {
    if (equipoRecomendado) {
      setEquipoIdState(equipoRecomendado.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipoRecomendado?.id]);

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
