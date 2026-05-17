import {
  CATALOGO_HYPERSTRONG,
  buscarEquipo,
  type EquipoBESS,
} from "./catalogo-hyperstrong";

export type EquipoDescartado = {
  equipo: EquipoBESS;
  razon: string;
};

export type RecomendacionEquipo = {
  equipo_recomendado: EquipoBESS;
  razon: string;
  equipos_descartados: EquipoDescartado[];
};

/**
 * Recomienda un equipo como punto de partida, NO como dimensionamiento final.
 *
 * Regla heurística por capacidad CFE:
 *   - POI ≤ 200 kW: HyperCube II Plus (125 kW).
 *   - 200 < POI ≤ 600 kW: HyperCube II Max (250 kW).
 *   - POI > 600 kW: HyperBlock III (2.5 MW, utility-scale).
 */
export function recomendarEquipoOptimo(
  capacidad_poi_kw: number
): RecomendacionEquipo {
  const plus = buscarEquipo("hypercube-plus")!;
  const max = buscarEquipo("hypercube-max")!;
  const block = buscarEquipo("hyperblock-iii")!;

  if (capacidad_poi_kw <= 200) {
    return {
      equipo_recomendado: plus,
      razon: `Para una planta de ${capacidad_poi_kw} kW, el HyperCube II Plus (125 kW) es el equipo en el rango correcto. Su potencia es proporcional a la capacidad CFE y permite arbitraje sin sobredimensionar.`,
      equipos_descartados: [
        { equipo: max, razon: "Sobredimensionado para esta escala." },
        { equipo: block, razon: "Equipo utility-scale, fuera de rango." },
      ],
    };
  }

  if (capacidad_poi_kw <= 600) {
    return {
      equipo_recomendado: max,
      razon: `Para una planta de ${capacidad_poi_kw} kW, el HyperCube II Max (250 kW) es el equipo en el rango correcto. Su potencia es ~50% del POI, deja margen operativo y permite arbitraje en hora-punta sin saturar.`,
      equipos_descartados: [
        {
          equipo: plus,
          razon: "Potencia menor a 25% del POI, limita el arbitraje.",
        },
        { equipo: block, razon: "Equipo utility-scale, sobredimensionado." },
      ],
    };
  }

  return {
    equipo_recomendado: block,
    razon: `Para una planta de ${capacidad_poi_kw} kW, el HyperBlock III (2.5 MW) está en el rango utility-scale apropiado.`,
    equipos_descartados: [
      {
        equipo: plus,
        razon: "Equipo C&I de baja potencia, fuera de escala.",
      },
      {
        equipo: max,
        razon: "Equipo C&I de potencia intermedia, fuera de escala.",
      },
    ],
  };
}

export { CATALOGO_HYPERSTRONG };
