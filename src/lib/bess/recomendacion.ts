import {
  CATALOGO_HYPERSTRONG,
  buscarEquipo,
  type EquipoBESS,
} from "./catalogo-hyperstrong";
import type { SeleccionCategoria } from "@/types/bess";

export type EquipoDescartado = {
  equipo: EquipoBESS;
  razon: string;
};

export type RecomendacionEquipo = {
  equipo_recomendado: EquipoBESS | null;
  razon: string;
  alerta?: string;
  equipos_descartados: EquipoDescartado[];
};

const UMBRAL_ENERGIA_MINIMA_MWH = 1;
const UMBRAL_PLUS_VS_MAX_MWH = 100;
const POI_LIMITE_CI_CHICO = 200;
const POI_LIMITE_UTILITY = 600;

/**
 * Recomienda un equipo según la categoría de energía seleccionada.
 *
 * Dos dimensiones consideradas:
 *   - Energía a almacenar (MWh/año) → define escala.
 *   - Capacidad CFE (kW) → define ventana de potencia AC objetivo.
 *
 * Casos borde:
 *   - energiaAlmacenable_mwh_anio < 1 MWh/año → ningún BESS aplica (alerta).
 *   - capacidad_poi_kw > 600 kW → utility scale (HyperBlock III).
 *   - capacidad_poi_kw ≤ 200 kW → C&I chico (HyperCube II Plus).
 *   - 200 < POI ≤ 600 kW → elegir entre Plus y Max según energía
 *     anual capturable (umbral 100 MWh).
 */
export function recomendarEquipoOptimo(
  capacidad_poi_kw: number,
  energiaAlmacenable_mwh_anio: number,
  _categoriaSeleccionada: SeleccionCategoria
): RecomendacionEquipo {
  const plus = buscarEquipo("hypercube-plus")!;
  const max = buscarEquipo("hypercube-max")!;
  const block = buscarEquipo("hyperblock-iii")!;

  if (energiaAlmacenable_mwh_anio < UMBRAL_ENERGIA_MINIMA_MWH) {
    return {
      equipo_recomendado: null,
      razon:
        "Bajo este supuesto, tu SFV no produce energía capturable por el BESS.",
      alerta:
        "El caso de negocio del BESS no se sostiene bajo esta categoría. Confirma con tu offtaker si el PPA realmente tiene este tipo de compromiso. Si lo tiene, considera otras alternativas de optimización para tu SFV.",
      equipos_descartados: CATALOGO_HYPERSTRONG.map((e) => ({
        equipo: e,
        razon: "Sin energía capturable, ningún BESS aplica.",
      })),
    };
  }

  const mwhFmt = Math.round(energiaAlmacenable_mwh_anio).toLocaleString(
    "es-MX"
  );

  if (capacidad_poi_kw > POI_LIMITE_UTILITY) {
    return {
      equipo_recomendado: block,
      razon: `Para una planta de ${capacidad_poi_kw} kW con ${mwhFmt} MWh anuales capturables, el HyperBlock III (2.5 MW × 5 MWh) está en escala utility apropiada.`,
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

  if (capacidad_poi_kw <= POI_LIMITE_CI_CHICO) {
    return {
      equipo_recomendado: plus,
      razon: `Para una planta de ${capacidad_poi_kw} kW con ${mwhFmt} MWh capturables, el HyperCube II Plus (125 kW × 261 kWh) está en el rango correcto.`,
      equipos_descartados: [
        { equipo: max, razon: "Sobredimensionado para esta escala." },
        { equipo: block, razon: "Equipo utility, fuera de rango." },
      ],
    };
  }

  // 200 < POI ≤ 600: la elección entre Plus y Max depende de la energía
  if (energiaAlmacenable_mwh_anio < UMBRAL_PLUS_VS_MAX_MWH) {
    return {
      equipo_recomendado: plus,
      razon: `Para una planta de ${capacidad_poi_kw} kW pero solo ${mwhFmt} MWh anuales capturables, el HyperCube II Plus (125 kW × 261 kWh) cubre el volumen sin sobredimensionar. Su potencia de 125 kW absorbe el flujo característico de esta categoría de energía.`,
      equipos_descartados: [
        {
          equipo: max,
          razon: `Para ${mwhFmt} MWh anuales, el II Max está sobredimensionado.`,
        },
        { equipo: block, razon: "Equipo utility, fuera de rango." },
      ],
    };
  }

  return {
    equipo_recomendado: max,
    razon: `Para una planta de ${capacidad_poi_kw} kW con ${mwhFmt} MWh anuales capturables, el HyperCube II Max (250 kW × 836 kWh) es el equipo en el rango correcto. Su potencia de 250 kW absorbe el pico característico durante el día y su capacidad de 836 kWh cubre ~3.3 horas continuas en hora-punta CFE.`,
    equipos_descartados: [
      { equipo: plus, razon: "Potencia limitada para esta escala de captura." },
      { equipo: block, razon: "Equipo utility, sobredimensionado." },
    ],
  };
}

export { CATALOGO_HYPERSTRONG };
