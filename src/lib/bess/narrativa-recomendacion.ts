import type { EquipoBESS } from "@/lib/bess/catalogo-hyperstrong";
import { duracionNominalHoras } from "@/lib/bess/catalogo-hyperstrong";
import type { ResumenCategoria, SeleccionCategoria } from "@/types/bess";

export function generarNarrativaRecomendacion(
  seleccion: SeleccionCategoria,
  resumenes: readonly ResumenCategoria[],
  equipo: EquipoBESS,
  poi_kw: number
): string {
  const nombre = equipo.nombre_completo;
  const kw = equipo.kw_ac;
  const kwh = Math.round(equipo.kwh);

  if (seleccion === "ninguna") {
    return `Por la incertidumbre del PPA, el ${nombre} (${kw} kW × ${kwh} kWh) es el equipo en el rango correcto para tu planta de ${poi_kw} kW. Cubre los escenarios más probables sin sobredimensionar. El dimensionamiento exacto se ajustará en el Tab SFV + BESS.`;
  }

  const sel = resumenes.find((r) => r.categoria.tipo === seleccion);
  if (!sel) {
    return `${nombre} es el equipo recomendado para tu planta de ${poi_kw} kW.`;
  }
  const totalMwh = Math.round(sel.total_mwh).toLocaleString("es-MX");
  const promMes = sel.promedio_mensual_mwh.toFixed(1);

  switch (seleccion) {
    case "toda_energia":
      return `En el escenario donde todos los ${totalMwh} MWh quedan libres para almacenar, el ${nombre} sigue siendo el equipo correcto: la limitante operativa es la capacidad CFE de ${poi_kw} kW, no la energía disponible.`;
    case "fuera_hora_punta_cfe":
      return `De los ${totalMwh} MWh anuales que tu SFV genera fuera de hora-punta CFE, el ${nombre} (${kw} kW × ${kwh} kWh) puede capturar una porción significativa. Su potencia de ${kw} kW absorbe el flujo durante el día y su capacidad de ${kwh} kWh permite descargar ~${duracionNominalHoras(equipo).toFixed(1)} horas continuas en hora-punta.`;
    case "compromiso_ppa_mensual_mwh":
      return `De los ${totalMwh} MWh anuales que quedan libres del compromiso PPA (~${promMes} MWh/mes), el ${nombre} es el equipo apropiado. Su capacidad de ${kwh} kWh cubre el volumen mensual con margen operativo.`;
    case "exceso_capacidad_cfe_kw":
      return `Con ${totalMwh} MWh anuales por encima del techo CFE (típicamente ~0 para un SFV no ampliado), el caso de negocio bajo este supuesto es marginal. Si tu SFV se ampliara físicamente, este escenario tendría sentido.`;
  }
}
